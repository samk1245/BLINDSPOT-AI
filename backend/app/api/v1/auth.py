import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.config import settings
from app.models.user import User, UserRole, SessionToken
from app.models.audit import AuditLog
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserProfileResponse
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.rate_limiter import enforce_rate_limit
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: Request, body: UserRegisterRequest, db: Session = Depends(get_db)):
    enforce_rate_limit(request, "auth_register", max_requests=10, window_seconds=60)

    existing_query = select(User).where(User.email == body.email.lower())
    existing = db.execute(existing_query).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )

    count_query = select(User)
    total_users = len(db.execute(count_query).scalars().all())
    user_role = UserRole.ADMIN if total_users == 0 else UserRole.USER

    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(body.password)

    new_user = User(
        id=user_id,
        email=body.email.lower(),
        hashed_password=hashed_pwd,
        full_name=body.full_name,
        role=user_role,
        is_active=True,
        is_verified=True
    )
    db.add(new_user)

    access_token = create_access_token(data={"sub": user_id, "role": user_role.value})
    refresh_token = create_refresh_token(data={"sub": user_id})

    session_token = SessionToken(
        id=str(uuid.uuid4()),
        user_id=user_id,
        refresh_token_hash=hash_password(refresh_token[:30]),
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(session_token)

    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user_id,
        action="USER_REGISTERED",
        resource_type="User",
        resource_id=user_id,
        ip_address=request.client.host if request.client else "unknown",
        details=f"Registered account with role {user_role.value}"
    )
    db.add(audit)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user_id,
        email=new_user.email,
        role=user_role.value,
        full_name=new_user.full_name
    )

@router.post("/login", response_model=TokenResponse)
def login(request: Request, body: UserLoginRequest, db: Session = Depends(get_db)):
    enforce_rate_limit(request, "auth_login", max_requests=10, window_seconds=60)

    query = select(User).where(User.email == body.email.lower())
    user = db.execute(query).scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    refresh_token = create_refresh_token(data={"sub": user.id})

    session_token = SessionToken(
        id=str(uuid.uuid4()),
        user_id=user.id,
        refresh_token_hash=hash_password(refresh_token[:30]),
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    db.add(session_token)

    audit = AuditLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        action="USER_LOGIN",
        resource_type="User",
        resource_id=user.id,
        ip_address=request.client.host if request.client else "unknown",
        details="Successful password authentication"
    )
    db.add(audit)
    db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user.id,
        email=user.email,
        role=user.role.value,
        full_name=user.full_name
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    query = select(User).where(User.id == user_id)
    user = db.execute(query).scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive or not found")

    new_access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    new_refresh_token = create_refresh_token(data={"sub": user.id})

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        user_id=user.id,
        email=user.email,
        role=user.role.value,
        full_name=user.full_name
    )

@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat()
    )

import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from sqlalchemy import delete
from app.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.investigation import Investigation
from app.schemas.auth import UserRegisterRequest
from app.schemas.investigation import InvestigationCreateRequest
from app.api.v1.auth import register
from app.api.v1.investigations import create_investigation, get_investigation
from app.api.v1.admin import get_admin_dashboard_metrics
from app.api.deps import require_admin

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    db.execute(delete(Investigation))
    db.execute(delete(User))
    db.commit()
    db.close()
    yield

def test_full_auth_and_cross_tenant_isolation():
    db = SessionLocal()
    mock_req = MagicMock()
    mock_req.client.host = "127.0.0.1"

    # 1. Register User A (Director) -> First user receives ADMIN role
    user_a_req = UserRegisterRequest(
        email="director@blindspot.ai",
        password="SecurePassword123!",
        full_name="Director Alice"
    )
    res_a = register(mock_req, user_a_req, db)
    assert res_a.role == "ADMIN"
    user_a = db.query(User).filter(User.id == res_a.user_id).first()
    assert user_a is not None

    # 2. Register User B (Researcher) -> Subsequent user receives standard USER role
    user_b_req = UserRegisterRequest(
        email="researcher@blindspot.ai",
        password="SecurePassword123!",
        full_name="Researcher Bob"
    )
    res_b = register(mock_req, user_b_req, db)
    assert res_b.role == "USER"
    user_b = db.query(User).filter(User.id == res_b.user_id).first()
    assert user_b is not None

    # 3. User B creates an Investigation
    inv_req = InvestigationCreateRequest(
        title="Autonomous Drone Defense Systems",
        research_question="What countermeasures are undocumented?",
        objective="Assess signal jamming vulnerabilities",
        domain="Defense & Aviation"
    )
    inv_b = create_investigation(inv_req, user_b, db)
    assert inv_b.id is not None
    assert inv_b.user_id == user_b.id

    # 4. User B can view their own investigation
    fetched_b = get_investigation(inv_b.id, user_b, db)
    assert fetched_b.id == inv_b.id

    # 5. IDOR Protection: User A (another user) tries to get User B's investigation -> 404
    with pytest.raises(HTTPException) as excinfo:
        get_investigation(inv_b.id, user_a, db)
    assert excinfo.value.status_code == 404

    # 6. Admin Protection (RBAC): User B tries to access admin dashboard -> 403 Forbidden
    with pytest.raises(HTTPException) as excinfo:
        require_admin(user_b)
    assert excinfo.value.status_code == 403
    assert "Administrative privileges required" in excinfo.value.detail

    # 7. Admin Protection (RBAC): User A (ADMIN) can access admin dashboard
    admin_verified = require_admin(user_a)
    assert admin_verified.role == UserRole.ADMIN

    admin_metrics = get_admin_dashboard_metrics(user_a, db)
    assert "metrics" in admin_metrics
    assert admin_metrics["metrics"]["total_users"] == 2
    assert admin_metrics["metrics"]["total_investigations"] == 1

    db.close()

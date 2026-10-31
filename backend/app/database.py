import os
import tempfile
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from app.config import settings

db_url = settings.DATABASE_URL
if "sqlite+aiosqlite" in db_url:
    db_url = db_url.replace("sqlite+aiosqlite", "sqlite")

# To prevent OneDrive file-locking conflicts on Windows workspaces,
# route default local SQLite to the local user AppData Temp directory.
if "sqlite" in db_url and ("./blindspot.db" in db_url or db_url == "sqlite:///blindspot.db"):
    local_temp_db = os.path.join(tempfile.gettempdir(), "blindspot.db")
    db_url = f"sqlite:///{local_temp_db}"

engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False, "timeout": 20} if "sqlite" in db_url else {},
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

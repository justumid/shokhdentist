"""Admin authentication for production"""
from fastapi import HTTPException, Header, Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from typing import Optional
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from config import settings
from logger import logger

security = HTTPBasic()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using constant-time comparison"""
    return secrets.compare_digest(
        hashlib.sha256(plain_password.encode()).hexdigest(),
        hashed_password
    )

def get_password_hash(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_admin_credentials(username: str, password: str) -> bool:
    """Verify admin credentials"""
    if not settings.ADMIN_PASSWORD:
        logger.warning("ADMIN_PASSWORD not set - admin access disabled")
        return False
    
    # Constant-time comparison
    username_match = secrets.compare_digest(username, settings.ADMIN_USERNAME)
    password_hash = get_password_hash(password)
    expected_hash = get_password_hash(settings.ADMIN_PASSWORD)
    password_match = secrets.compare_digest(password_hash, expected_hash)
    
    return username_match and password_match

def get_admin_user(
    credentials: HTTPBasicCredentials = Depends(security)
) -> str:
    """Dependency for admin endpoints - requires HTTP Basic Auth"""
    if not verify_admin_credentials(credentials.username, credentials.password):
        logger.warning(f"Failed admin login attempt: {credentials.username}")
        raise HTTPException(
            status_code=401,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    logger.info(f"Admin authenticated: {credentials.username}")
    return credentials.username

def get_admin_user_optional(
    x_admin_token: Optional[str] = Header(None)
) -> Optional[str]:
    """Optional admin auth - for endpoints that work for both admin and users"""
    if not x_admin_token:
        return None
    
    # Simple token comparison for now
    if settings.ADMIN_SECRET_KEY and x_admin_token == settings.ADMIN_SECRET_KEY:
        return "admin"
    
    return None

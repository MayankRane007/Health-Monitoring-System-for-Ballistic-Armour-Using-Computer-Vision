import base64
import binascii
import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from .database import get_db
from .models import AuthSession, User


SESSION_COOKIE_NAME = "armourwatch_session"
SESSION_DURATION = timedelta(hours=8)
PASSWORD_SCRYPT_N = 2**14
PASSWORD_SCRYPT_R = 8
PASSWORD_SCRYPT_P = 1


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=PASSWORD_SCRYPT_N,
        r=PASSWORD_SCRYPT_R,
        p=PASSWORD_SCRYPT_P,
        dklen=64,
        maxmem=64 * 1024 * 1024,
    )
    return "scrypt${}${}${}${}${}".format(
        PASSWORD_SCRYPT_N,
        PASSWORD_SCRYPT_R,
        PASSWORD_SCRYPT_P,
        base64.b64encode(salt).decode("ascii"),
        base64.b64encode(digest).decode("ascii"),
    )


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, n, r, p, salt_b64, digest_b64 = stored_hash.split("$")
        if algorithm != "scrypt":
            return False
        salt = base64.b64decode(salt_b64, validate=True)
        expected_digest = base64.b64decode(digest_b64, validate=True)
        actual_digest = hashlib.scrypt(
            password.encode("utf-8"),
            salt=salt,
            n=int(n),
            r=int(r),
            p=int(p),
            dklen=len(expected_digest),
            maxmem=64 * 1024 * 1024,
        )
    except (ValueError, TypeError, binascii.Error):
        return False

    return hmac.compare_digest(actual_digest, expected_digest)


def create_session(db: Session, user: User) -> tuple[str, datetime]:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + SESSION_DURATION
    db.query(AuthSession).filter(
        AuthSession.expires_at < datetime.now(timezone.utc)
    ).delete(synchronize_session=False)
    db.add(
        AuthSession(
            token_hash=hashlib.sha256(token.encode("utf-8")).hexdigest(),
            user_id=user.id,
            expires_at=expires_at,
        )
    )
    db.commit()
    return token, expires_at


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    auth_session = db.query(AuthSession).filter(
        AuthSession.token_hash == token_hash
    ).first()
    if not auth_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    expires_at = auth_session.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= datetime.now(timezone.utc):
        db.delete(auth_session)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired",
        )

    user = db.query(User).filter(
        User.id == auth_session.user_id,
        User.is_active.is_(True),
    ).first()
    if not user:
        db.delete(auth_session)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    return user


def session_cookie_options() -> dict:
    return {
        "httponly": True,
        "secure": os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true",
        "samesite": "strict",
        "path": "/",
    }

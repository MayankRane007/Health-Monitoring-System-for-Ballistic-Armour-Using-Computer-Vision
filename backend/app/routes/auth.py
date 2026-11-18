import re
import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import AuthSession, User
from ..security import (
    SESSION_COOKIE_NAME,
    SESSION_DURATION,
    create_session,
    get_current_user,
    hash_password,
    session_cookie_options,
    verify_password,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])
DEMO_ACCOUNT_EMAIL = "demo@armourwatch.invalid"


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=1024)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalized):
            raise ValueError("Enter a valid email address")
        return normalized


class RegisterRequest(LoginRequest):
    password: str = Field(min_length=12, max_length=1024)


class UserResponse(BaseModel):
    email: str


def start_user_session(response: Response, db: Session, user: User) -> None:
    token, _ = create_session(db, user)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=int(SESSION_DURATION.total_seconds()),
        **session_cookie_options(),
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    credentials: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    if credentials.email == DEMO_ACCOUNT_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That email address is reserved",
        )

    if db.query(User.id).filter(User.email == credentials.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists",
        )

    user = User(
        email=credentials.email,
        password_hash=hash_password(credentials.password),
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists",
        )

    start_user_session(response, db, user)
    return UserResponse(email=user.email)


@router.post("/demo", response_model=UserResponse)
def demo_login(response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == DEMO_ACCOUNT_EMAIL).first()
    if user is None:
        user = User(
            email=DEMO_ACCOUNT_EMAIL,
            password_hash=hash_password(secrets.token_urlsafe(32)),
        )
        db.add(user)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            user = db.query(User).filter(User.email == DEMO_ACCOUNT_EMAIL).first()
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Could not start the demo session",
                )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The demo account is disabled",
        )

    start_user_session(response, db, user)
    return UserResponse(email=user.email)


@router.post("/login", response_model=UserResponse)
def login(
    credentials: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not user.is_active or not verify_password(
        credentials.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    start_user_session(response, db, user)
    return UserResponse(email=user.email)


@router.get("/me", response_model=UserResponse)
def current_user(user: User = Depends(get_current_user)):
    return UserResponse(email=user.email)


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if token:
        token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        auth_session = db.query(AuthSession).filter(
            AuthSession.token_hash == token_hash
        ).first()
        if auth_session:
            db.delete(auth_session)
            db.commit()

    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        **session_cookie_options(),
    )
    return {"message": "Logged out"}

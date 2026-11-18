import getpass
import re

from sqlalchemy.exc import IntegrityError

from . import models
from .database import Base, SessionLocal, engine
from .security import hash_password


def main() -> None:
    Base.metadata.create_all(bind=engine)
    email = input("Account email: ").strip().lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise SystemExit("Enter a valid email address.")

    password = getpass.getpass("Password (12+ characters): ")
    confirmation = getpass.getpass("Confirm password: ")

    if len(password) < 12:
        raise SystemExit("Password must be at least 12 characters.")
    if password != confirmation:
        raise SystemExit("Passwords do not match.")

    db = SessionLocal()
    try:
        db.add(
            models.User(
                email=email,
                password_hash=hash_password(password),
            )
        )
        db.commit()
    except IntegrityError:
        db.rollback()
        raise SystemExit("An account with that email already exists.")
    finally:
        db.close()

    print(f"Account created for {email}.")


if __name__ == "__main__":
    main()

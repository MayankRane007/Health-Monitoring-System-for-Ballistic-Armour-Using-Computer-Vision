
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from .database import Base


# 1. Panel table
class Panel(Base):
    __tablename__ = "panels"

    id = Column(Integer, primary_key=True, index=True)
    panel_id = Column(String(50), unique=True, nullable=False, index=True)
    material = Column(String(100), nullable=True)
    manufacturer = Column(String(150), nullable=True)
    manufacture_date = Column(String(30), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    inspections = relationship(
        "Inspection",
        back_populates="panel",
        cascade="all, delete-orphan"
    )


# 2. Inspection table
class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    panel_id = Column(
        String(50),
        ForeignKey("panels.panel_id"),
        nullable=False,
        index=True
    )
    inspector_name = Column(String(100), nullable=True)
    inspection_date = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    status = Column(String(50), default="Pending")

    panel = relationship("Panel", back_populates="inspections")

    images = relationship(
        "Image",
        back_populates="inspection",
        cascade="all, delete-orphan"
    )


# 3. Image table
class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(
        Integer,
        ForeignKey("inspections.id"),
        nullable=False,
        index=True
    )
    surface = Column(String(10), nullable=False)  # front or back
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    content_type = Column(String(100), nullable=True)
    uploaded_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    inspection = relationship("Inspection", back_populates="images")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(254), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    token_hash = Column(String(64), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )


from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
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

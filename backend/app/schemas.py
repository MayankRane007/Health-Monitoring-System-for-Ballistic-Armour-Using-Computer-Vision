
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class PanelCreate(BaseModel):
    panel_id: str = Field(min_length=1, max_length=50)
    material: Optional[str] = None
    manufacturer: Optional[str] = None
    manufacture_date: Optional[str] = None


class PanelResponse(BaseModel):
    id: int
    panel_id: str
    material: Optional[str] = None
    manufacturer: Optional[str] = None
    manufacture_date: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime
from typing import Optional


class InspectionCreate(BaseModel):
    panel_id: str
    inspector_name: Optional[str] = None


class InspectionResponse(BaseModel):
    id: int
    panel_id: str
    inspector_name: Optional[str] = None
    inspection_date: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)

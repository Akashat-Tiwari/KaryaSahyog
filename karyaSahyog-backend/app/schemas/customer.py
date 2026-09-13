from pydantic import BaseModel
from typing import Optional

class BookingCreate(BaseModel):
    customer_id: int
    service_type: str
    latitude: float
    longitude: float
    address: str

class BookingResponse(BaseModel):
    booking_id: int
    service_type: str
    status: str
    address: str
    assigned_worker_name: Optional[str] = None
    estimated_cost: float

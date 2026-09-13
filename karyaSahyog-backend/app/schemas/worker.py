from pydantic import BaseModel

class WorkerStatusResponse(BaseModel):
    worker_id: int
    name: str
    rating: float
    service_category: str
    verification_status: str
    insurance_active: bool
    current_lat: float
    current_lng: float

class JobActionRequest(BaseModel):
    booking_id: int
    worker_id: int
    action: str  # "ACCEPT" or "REJECT"

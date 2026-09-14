from pydantic import BaseModel
from typing import Optional, Union

class WorkerStatusResponse(BaseModel):
    worker_id: Union[int, str]
    name: str
    rating: float
    service_category: str
    verification_status: str
    insurance_active: bool
    current_lat: float
    current_lng: float

class JobActionRequest(BaseModel):
    booking_id: Optional[Union[int, str]] = None
    job_id: Optional[Union[int, str]] = None
    worker_id: Union[int, str]
    action: str  # "ACCEPT" or "REJECT"


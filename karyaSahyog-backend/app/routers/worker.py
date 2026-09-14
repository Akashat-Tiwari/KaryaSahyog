from fastapi import APIRouter
from typing import List, Union
from app.schemas.worker import WorkerStatusResponse, JobActionRequest

router = APIRouter()

@router.get("/{worker_id}/status", response_model=WorkerStatusResponse)
def get_worker_status(worker_id: Union[int, str]):
    return {
        "worker_id": worker_id,
        "name": "Ramesh Kumar",
        "rating": 4.9,
        "service_category": "Electrician",
        "verification_status": "Verified (Aadhaar Linked)",
        "insurance_active": True,
        "current_lat": 34.0837,
        "current_lng": 74.7973
    }

@router.get("/nearby", response_model=List[WorkerStatusResponse])
def get_nearby_workers(lat: float, lng: float):
    return [
        {
            "worker_id": 101,
            "name": "Ramesh Kumar",
            "rating": 4.9,
            "service_category": "Electrician",
            "verification_status": "Verified",
            "insurance_active": True,
            "current_lat": lat + 0.001,
            "current_lng": lng + 0.001
        },
        {
            "worker_id": 102,
            "name": "Abdul Hassan",
            "rating": 4.7,
            "service_category": "Plumber",
            "verification_status": "Verified",
            "insurance_active": True,
            "current_lat": lat - 0.002,
            "current_lng": lng - 0.001
        }
    ]

@router.post("/job-action")
def respond_to_job(action: JobActionRequest):
    identifier = action.job_id or action.booking_id or "unknown"
    return {
        "status": "success",
        "message": f"Job {identifier} has been {action.action.lower()}ed."
    }


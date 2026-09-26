from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Union

from app.database import get_db
from app import models
from app.schemas.worker import WorkerStatusResponse, JobActionRequest

router = APIRouter()

@router.get("/{worker_id}/status", response_model=WorkerStatusResponse)
def get_worker_status(worker_id: int, db: Session = Depends(get_db)):
    worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
        
    return {
        "worker_id": worker.id,
        "name": worker.user.name if worker.user else "Unknown",
        "rating": worker.rating,
        "service_category": worker.category,
        "verification_status": "Verified", 
        "insurance_active": True, 
        "current_lat": worker.latitude,
        "current_lng": worker.longitude
    }

@router.get("/nearby", response_model=List[WorkerStatusResponse])
def get_nearby_workers(lat: float, lng: float, db: Session = Depends(get_db)):
    lat_min, lat_max = lat - 0.1, lat + 0.1
    lng_min, lng_max = lng - 0.1, lng + 0.1
    
    # Query only available workers within the bounding box
    workers = db.query(models.Worker).filter(
        models.Worker.latitude >= lat_min,
        models.Worker.latitude <= lat_max,
        models.Worker.longitude >= lng_min,
        models.Worker.longitude <= lng_max,
        models.Worker.status == "available"
    ).all()
    
    response = []
    for w in workers:
        response.append({
            "worker_id": w.id,
            "name": w.user.name if w.user else "Unknown",
            "rating": w.rating,
            "service_category": w.category,
            "verification_status": "Verified",
            "insurance_active": True,
            "current_lat": w.latitude,
            "current_lng": w.longitude
        })
        
    return response

@router.post("/job-action")
def respond_to_job(action: JobActionRequest, db: Session = Depends(get_db)):
    identifier = action.job_id or action.booking_id
    
    booking = db.query(models.Booking).filter(models.Booking.id == identifier).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = action.action.lower()
    db.commit()
    
    return {
        "status": "success",
        "message": f"Job {identifier} has been updated to {booking.status}."
    }

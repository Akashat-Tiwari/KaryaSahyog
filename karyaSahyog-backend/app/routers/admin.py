from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models
from src.predict import predict_demand

router = APIRouter()

class DemandForecastRequest(BaseModel):
    day_of_week: str
    zone_id: str
    zone_density_tier: str
    service_type: str
    price_tier: str
    weather_condition: str
    is_weekend: int
    month: int
    is_holiday_or_festival: int
    temperature_c: float
    num_available_workers: int
    avg_zone_worker_rating: float
    promo_active: int
    past_7day_avg_bookings: float
    avg_response_time_min: float
    cancellation_rate: float
    lag_1: float
    lag_7: float
    rolling_14: float
    rolling_30: float
    worker_demand_ratio: float

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    active_workers = db.query(models.Worker).filter(models.Worker.status == "available").count()
    completed_bookings = db.query(models.Booking).filter(models.Booking.status == "completed").count()
    
    revenue_result = db.query(func.sum(models.Booking.amount)).filter(models.Booking.status == "completed").scalar()
    revenue_inr = float(revenue_result) if revenue_result is not None else 0.0
    
    return {
        "total_users": total_users,
        "active_workers": active_workers,
        "completed_bookings": completed_bookings,
        "revenue_inr": revenue_inr
    }

@router.post("/demand-forecast")
def get_demand_forecast(payload: DemandForecastRequest):
    try:
        data_dict = payload.model_dump()
        predicted_value = predict_demand(data_dict)
        return {
            "status": "success",
            "predicted_demand": predicted_value,
            "unit": "estimated_bookings"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

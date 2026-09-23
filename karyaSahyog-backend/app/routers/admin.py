from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
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
def get_admin_stats():
    return {
        "total_users": 1250,
        "active_workers": 340,
        "completed_bookings": 8920,
        "revenue_inr": 450000.00
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

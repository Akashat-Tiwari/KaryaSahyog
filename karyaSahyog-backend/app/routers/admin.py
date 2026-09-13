from fastapi import APIRouter

router = APIRouter()

@router.get("/stats")
def get_admin_stats():
    return {
        "total_active_workers": 128,
        "total_jobs_completed": 1420,
        "cooperative_federation_earnings": 345000.00,
        "worker_welfare_fund_pool": 69000.00
    }

@router.get("/demand-forecast")
def get_demand_forecast():
    return {
        "high_demand_region": "Zone 3 - Downtown",
        "predicted_service_surge": "AC Repair & Maintenance",
        "recommended_worker_shifts": 35,
        "confidence_score": 0.89
    }

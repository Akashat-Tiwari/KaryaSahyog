from fastapi import APIRouter
from typing import List
from app.schemas.customer import BookingCreate, BookingResponse

router = APIRouter()

@router.post("/bookings", response_model=BookingResponse)
def create_booking(booking: BookingCreate):
    return {
        "booking_id": 901,
        "service_type": booking.service_type,
        "status": "Assigned",
        "address": booking.address,
        "assigned_worker_name": "Ramesh Kumar",
        "estimated_cost": 450.00
    }

@router.get("/bookings/{customer_id}", response_model=List[BookingResponse])
def get_customer_bookings(customer_id: int):
    return [
        {
            "booking_id": 901,
            "service_type": "Electrical Repair",
            "status": "Completed",
            "address": "NIT Srinagar Campus",
            "assigned_worker_name": "Ramesh Kumar",
            "estimated_cost": 450.00
        }
    ]

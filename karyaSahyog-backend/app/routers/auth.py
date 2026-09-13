from fastapi import APIRouter
from app.schemas.auth import UserRegister, UserLogin, UserResponse

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user: UserRegister):
    return {
        "id": 1,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "token": "mock-jwt-token-12345"
    }

@router.post("/login", response_model=UserResponse)
def login(credentials: UserLogin):
    return {
        "id": 1,
        "full_name": "Demo User",
        "email": credentials.email,
        "role": "customer",
        "token": "mock-jwt-token-12345"
    }

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import auth, worker, customer, admin

# Build tables automatically in Neon PostgreSQL
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KaryaSahyog API Engine",
    description="Backend API services for KaryaSahyog platform",
    version="1.0.0"
)

# Allow the React (Vite) frontend to call the API from the browser.
# Override with a comma-separated CORS_ORIGINS env var when deploying.
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(worker.router, prefix="/api/v1/worker", tags=["Worker Operations"])
app.include_router(customer.router, prefix="/api/v1/customer", tags=["Customer Operations"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin Operations"])

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "KaryaSahyog API Engine Operational",
        "database": "Connected to Neon PostgreSQL"
    }

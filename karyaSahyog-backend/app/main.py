from fastapi import FastAPI
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

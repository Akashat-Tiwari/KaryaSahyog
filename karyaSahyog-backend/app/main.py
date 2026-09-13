from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, customer, worker, admin

app = FastAPI(
    title="KaryaSahyog API Engine",
    description="Backend REST APIs for KaryaSahyog - Cooperative Gig Services Platform (SIH 2026)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(customer.router, prefix="/api/v1/customer", tags=["Customer Module"])
app.include_router(worker.router, prefix="/api/v1/worker", tags=["Worker Module"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin & AI Module"])

@app.get("/")
def root():
    return {"status": "online", "message": "KaryaSahyog API Engine Operational"}

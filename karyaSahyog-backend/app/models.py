from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # Map Python 'name' to teammate's SQL 'full_name'
    name = Column("full_name", String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, default="customer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    worker_profile = relationship("Worker", back_populates="user", uselist=False)
    bookings = relationship("Booking", back_populates="customer", foreign_keys='Booking.customer_id')

class Worker(Base):
    __tablename__ = "workers"

    # Map Python 'id' to teammate's SQL 'worker_id'
    id = Column("worker_id", Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    name = Column(String, nullable=False)
    
    # Map Python variables to the teammate's SQL column names
    category = Column("service_category", String, nullable=False)
    rating = Column(Float, default=0.0)
    status = Column("availability_status", String, default="offline")
    latitude = Column("current_lat", Float, nullable=True)
    longitude = Column("current_lng", Float, nullable=True)

    user = relationship("User", back_populates="worker_profile")
    bookings = relationship("Booking", back_populates="worker", foreign_keys='Booking.worker_id')

class Booking(Base):
    __tablename__ = "bookings"

    # Map Python 'id' to teammate's SQL 'booking_id'
    id = Column("booking_id", Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.worker_id", ondelete="SET NULL"), nullable=True)
    
    service_type = Column(String, nullable=False)
    status = Column(String, default="pending")
    # Map Python 'amount' to teammate's SQL 'estimated_cost'
    amount = Column("estimated_cost", Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("User", back_populates="bookings", foreign_keys=[customer_id])
    worker = relationship("Worker", back_populates="bookings", foreign_keys=[worker_id])

-- ============================================
-- KaryaSahyog Database Schema
-- PostgreSQL + PostGIS
-- ============================================

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;


-- ============================================
-- USERS
-- Stores customers and workers registered
-- on the KaryaSahyog platform.
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(20),

    role VARCHAR(30) NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'worker')),

    password_hash TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- WORKERS
-- Stores worker profile, verification,
-- availability and geographic location.
-- ============================================

CREATE TABLE IF NOT EXISTS workers (
    worker_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT UNIQUE
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(150) NOT NULL,

    rating NUMERIC(3,2) NOT NULL DEFAULT 0.00
        CHECK (rating >= 0 AND rating <= 5),

    service_category VARCHAR(100),

    verification_status VARCHAR(30) NOT NULL DEFAULT 'pending',

    insurance_active BOOLEAN NOT NULL DEFAULT FALSE,

    availability_status VARCHAR(30) NOT NULL DEFAULT 'offline',

    current_lat NUMERIC(10,7),

    current_lng NUMERIC(10,7),

    -- PostGIS geographic point
    -- SRID 4326 = WGS 84 GPS coordinates
    location GEOGRAPHY(POINT, 4326),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- BOOKINGS
-- Stores customer service bookings and
-- optional worker assignments.
-- ============================================

CREATE TABLE IF NOT EXISTS bookings (
    booking_id BIGSERIAL PRIMARY KEY,

    customer_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    worker_id BIGINT
        REFERENCES workers(worker_id)
        ON DELETE SET NULL,

    service_type VARCHAR(100) NOT NULL,

    latitude NUMERIC(10,7),

    longitude NUMERIC(10,7),

    address TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    estimated_cost NUMERIC(10,2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- STANDARD INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);

CREATE INDEX IF NOT EXISTS idx_workers_service_category
    ON workers(service_category);

CREATE INDEX IF NOT EXISTS idx_workers_availability
    ON workers(availability_status);

CREATE INDEX IF NOT EXISTS idx_bookings_customer
    ON bookings(customer_id);

CREATE INDEX IF NOT EXISTS idx_bookings_worker
    ON bookings(worker_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status
    ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at
    ON bookings(created_at);


-- ============================================
-- POSTGIS SPATIAL INDEX
-- Used for efficient nearest-worker queries.
-- ============================================

CREATE INDEX IF NOT EXISTS idx_workers_location
    ON workers
    USING GIST (location);

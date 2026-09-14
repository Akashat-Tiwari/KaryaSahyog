-- ============================================================
-- KaryaSahyog - PostgreSQL Database Schema
-- ============================================================

-- ============================================================
-- USERS
-- Stores customers and workers registered in the platform.
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(20) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('customer', 'worker')),

    password_hash TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- WORKERS
-- Stores worker profile, verification and current status.
-- ============================================================

CREATE TABLE IF NOT EXISTS workers (
    worker_id BIGSERIAL PRIMARY KEY,

    user_id BIGINT UNIQUE NOT NULL,

    name VARCHAR(150) NOT NULL,

    rating NUMERIC(3,2) NOT NULL DEFAULT 0.00
        CHECK (rating >= 0 AND rating <= 5),

    service_category VARCHAR(100) NOT NULL,

    verification_status VARCHAR(30) NOT NULL DEFAULT 'pending',

    insurance_active BOOLEAN NOT NULL DEFAULT FALSE,

    availability_status VARCHAR(30) NOT NULL DEFAULT 'offline',

    current_lat NUMERIC(10,7),

    current_lng NUMERIC(10,7),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_worker_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- BOOKINGS
-- Stores customer service bookings and worker assignment.
-- ============================================================

CREATE TABLE IF NOT EXISTS bookings (
    booking_id BIGSERIAL PRIMARY KEY,

    customer_id BIGINT NOT NULL,

    worker_id BIGINT,

    service_type VARCHAR(100) NOT NULL,

    latitude NUMERIC(10,7) NOT NULL,

    longitude NUMERIC(10,7) NOT NULL,

    address TEXT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    estimated_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_booking_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_worker
        FOREIGN KEY (worker_id)
        REFERENCES workers(worker_id)
        ON DELETE SET NULL
);


-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);

CREATE INDEX IF NOT EXISTS idx_workers_service_category
    ON workers(service_category);

CREATE INDEX IF NOT EXISTS idx_workers_availability
    ON workers(availability_status);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id
    ON bookings(customer_id);

CREATE INDEX IF NOT EXISTS idx_bookings_worker_id
    ON bookings(worker_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status
    ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at
    ON bookings(created_at);

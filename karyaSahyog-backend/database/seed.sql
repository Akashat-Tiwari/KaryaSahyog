-- ============================================
-- KaryaSahyog Test Seed Data
-- PostgreSQL + PostGIS
-- ============================================

BEGIN;


-- ============================================
-- 1. TEST CUSTOMER
-- ============================================

INSERT INTO users (
    full_name,
    email,
    role
)
VALUES (
    'Amit Sharma',
    'amit@karyasahyog.com',
    'customer'
)
ON CONFLICT (email) DO NOTHING;


-- ============================================
-- 2. TEST WORKER USER
-- ============================================

INSERT INTO users (
    full_name,
    email,
    role
)
VALUES (
    'Rahul Verma',
    'rahul@karyasahyog.com',
    'worker'
)
ON CONFLICT (email) DO NOTHING;


-- ============================================
-- 3. TEST WORKER PROFILE
-- ============================================

INSERT INTO workers (
    user_id,
    name,
    service_category,
    availability_status,
    current_lat,
    current_lng
)
SELECT
    u.id,
    'Rahul Verma',
    'Plumber',
    'available',
    34.0837,
    74.7973
FROM users u
WHERE u.email = 'rahul@karyasahyog.com'
  AND NOT EXISTS (
      SELECT 1
      FROM workers w
      WHERE w.user_id = u.id
  );


-- ============================================
-- 4. TEST COMPLETED BOOKING
-- ============================================

INSERT INTO bookings (
    customer_id,
    worker_id,
    service_type,
    latitude,
    longitude,
    address,
    status,
    estimated_cost
)
SELECT
    customer.id,
    worker.worker_id,
    'Plumber',
    34.0837,
    74.7973,
    'Srinagar, Jammu and Kashmir',
    'completed',
    550.00
FROM users customer
JOIN workers worker
    ON worker.name = 'Rahul Verma'
JOIN users worker_user
    ON worker.user_id = worker_user.id
WHERE customer.email = 'amit@karyasahyog.com'
  AND worker_user.email = 'rahul@karyasahyog.com'
  AND NOT EXISTS (
      SELECT 1
      FROM bookings b
      WHERE b.customer_id = customer.id
        AND b.worker_id = worker.worker_id
        AND b.service_type = 'Plumber'
        AND b.status = 'completed'
        AND b.estimated_cost = 550.00
  );


COMMIT;


-- ============================================
-- 5. VERIFICATION
-- ============================================

SELECT
    id,
    full_name,
    email,
    role
FROM users
WHERE email IN (
    'amit@karyasahyog.com',
    'rahul@karyasahyog.com'
)
ORDER BY id;


SELECT
    worker_id,
    user_id,
    name,
    service_category,
    availability_status,
    current_lat,
    current_lng,
    ST_AsText(location::geometry) AS location
FROM workers
WHERE name = 'Rahul Verma';


SELECT
    b.booking_id,
    customer.full_name AS customer_name,
    worker.name AS worker_name,
    b.service_type,
    b.status,
    b.estimated_cost,
    b.latitude,
    b.longitude,
    b.address
FROM bookings b
JOIN users customer
    ON b.customer_id = customer.id
LEFT JOIN workers worker
    ON b.worker_id = worker.worker_id
WHERE customer.email = 'amit@karyasahyog.com'
ORDER BY b.booking_id;

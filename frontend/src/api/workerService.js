/**
 * KaryaSahyog - Worker API Service
 * Connects frontend dashboard components to the live FastAPI backend engine.
 */

const RAW_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '';
// Strip any trailing slashes from the base URL
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

function getAuthHeaders() {
  const headers = {
    Accept: 'application/json',
  };
  try {
    const token = localStorage.getItem('karyasahyog_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore localStorage access errors
  }
  return headers;
}

/**
 * Normalizes worker ID to handle both string tokens (e.g. 'worker_123')
 * and integer IDs expected by FastAPI endpoints.
 */
function sanitizeWorkerId(workerId) {
  if (typeof workerId === 'number') return workerId;
  const numericOnly = parseInt(String(workerId).replace(/\D/g, ''), 10);
  return isNaN(numericOnly) ? workerId : numericOnly;
}

/**
 * Normalizes job ID to handle both string tokens (e.g. 'JOB-101')
 * and integer IDs for backend booking models.
 */
function sanitizeJobId(jobId) {
  if (typeof jobId === 'number') return jobId;
  const numericOnly = parseInt(String(jobId).replace(/\D/g, ''), 10);
  return isNaN(numericOnly) ? jobId : numericOnly;
}

/**
 * Helper to fetch with dual-path routing support:
 * Checks /api/v1/worker/... and falls back to /worker/...
 */
async function fetchWithFallback(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const authHeaders = getAuthHeaders();
  const mergedOptions = {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  };

  // If base URL already includes /api/v1, use direct URL
  if (BASE_URL.includes('/api/v1')) {
    const res = await fetch(`${BASE_URL}${cleanPath}`, mergedOptions);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API Error (${res.status}): ${errorText || res.statusText}`);
    }
    return await res.json();
  }

  // Prioritize live FastAPI mounted prefix /api/v1/worker, then fallback to /worker
  const endpointsToTry = [
    `${BASE_URL}/api/v1${cleanPath}`,
    `${BASE_URL}${cleanPath}`,
  ];

  let lastError = null;

  for (const url of endpointsToTry) {
    try {
      const res = await fetch(url, mergedOptions);
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 404) {
        // Try next endpoint candidate
        continue;
      }
      let errorBody = '';
      try {
        errorBody = await res.text();
      } catch {
        // ignore
      }
      throw new Error(`API Error (${res.status}): ${errorBody || res.statusText}`);
    } catch (err) {
      lastError = err;
      if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
        break; // Network unreachable, no point trying secondary endpoint
      }
    }
  }

  throw lastError || new Error(`Failed to fetch from endpoints: ${endpointsToTry.join(', ')}`);
}

/**
 * Fetch worker status from backend
 * Endpoint: GET /worker/{worker_id}/status (or /api/v1/worker/{worker_id}/status)
 *
 * @param {string|number} workerId - Worker Identifier (e.g. 'worker_123' or 123)
 * @returns {Promise<Object>} Worker profile & status data
 */
export async function getWorkerStatus(workerId) {
  try {
    const sanitizedId = sanitizeWorkerId(workerId);
    const endpoint = `/worker/${sanitizedId}/status`;
    const data = await fetchWithFallback(endpoint, {
      method: 'GET',
    });

    return data;
  } catch (error) {
    console.error(`[WorkerService] Error fetching worker status for '${workerId}':`, error);
    throw error;
  }
}

/**
 * Respond to an incoming job inquiry
 * Endpoint: POST /worker/job-action (or /api/v1/worker/job-action)
 *
 * @param {string|number} jobId - Job or Booking Identifier
 * @param {string|number} workerId - Worker Identifier
 * @param {'accept'|'reject'|'ACCEPT'|'REJECT'} action - Action taken
 * @returns {Promise<Object>} Action response confirmation
 */

export async function respondToJob(jobId, workerId, action) {
  try {
    const sanitizedId = sanitizeWorkerId(workerId);
    const sanitizedJob = sanitizeJobId(jobId);
    // Payload matches backend schema (includes booking_id)
    const payload = {
      job_id: sanitizedJob,
      booking_id: sanitizedJob,
      worker_id: sanitizedId,
      action: String(action).toUpperCase(),
    };

    // Mock implementation: skip backend call and return a fake success response
    const data = { message: `Job ${String(action).toLowerCase()}ed successfully` };

    // Preserve mock implementation from main for UI state
    const entry = {
      jobId,
      workerId,
      action: String(action).toUpperCase(),
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    existing.push(entry);
    localStorage.setItem('bookingHistory', JSON.stringify(existing));

    return data;
  } catch (error) {
    console.error(`[WorkerService] Error responding to job '${jobId}':`, error);
    throw error;
  }
}

// Helper to retrieve booking history from localStorage
export function getBookingHistory() {
  return JSON.parse(localStorage.getItem('bookingHistory') || '[]');
}

/**
 * Fetch nearby workers for genuine latitude & longitude coordinates
 * Endpoint: GET /worker/nearby?lat={lat}&lng={lng} (or /api/v1/worker/nearby)
 *
 * @param {number} lat - Genuine Latitude
 * @param {number} lng - Genuine Longitude
 * @returns {Promise<Array>} List of nearby workers
 */
export async function getNearbyWorkers(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    throw new Error('Valid numerical coordinates (lat/lng) are required for nearby workers query.');
  }

  try {
    const endpoint = `/worker/nearby?lat=${lat}&lng=${lng}`;
    const data = await fetchWithFallback(endpoint, {
      method: 'GET',
    });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`[WorkerService] Error fetching nearby workers:`, error);
    throw error;
  }
}

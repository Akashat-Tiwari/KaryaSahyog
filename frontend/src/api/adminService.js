/**
 * KaryaSahyog - Admin API Service
 * Connects Admin Dashboard components to the FastAPI backend.
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// Strip trailing slashes
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

/**
 * Helper to fetch with route prefix fallback:
 * Tries direct endpoint (/stats), then /admin/stats, then /api/v1/admin/stats
 */
async function fetchAdminEndpoint(endpointPath, options = {}) {
  const cleanPath = endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`;

  // Candidate paths to try for compatibility with direct or prefixed FastAPI routers
  const candidates = [
    `${BASE_URL}${cleanPath}`,
    `${BASE_URL}/admin${cleanPath}`,
    `${BASE_URL}/api/v1/admin${cleanPath}`,
  ];

  let lastError = null;

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (res.ok) {
        return await res.json();
      }

      // If 404, try next candidate
      if (res.status === 404) {
        continue;
      }

      const errorText = await res.text();
      throw new Error(`API Error (${res.status}): ${errorText || res.statusText}`);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to fetch from ${cleanPath}`);
}

/**
 * Fetch platform admin statistics
 * Endpoint: GET /stats
 *
 * @returns {Promise<Object>} Statistics payload
 */
export async function getStats() {
  try {
    const data = await fetchAdminEndpoint('/stats', {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('[AdminService] Error fetching stats:', error);
    throw error;
  }
}

/**
 * Fetch AI demand forecast and predictive surge data
 * Endpoint: GET /demand-forecast
 *
 * @returns {Promise<Object>} Demand forecast data
 */
export async function getDemandForecast() {
  try {
    const data = await fetchAdminEndpoint('/demand-forecast', {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('[AdminService] Error fetching demand forecast:', error);
    throw error;
  }
}

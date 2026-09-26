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
    `${BASE_URL}/admin${cleanPath}`,
    `${BASE_URL}${cleanPath}`
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
 * Endpoint: POST /demand-forecast (or /api/v1/admin/demand-forecast)
 *
 * @param {Object} [customParams={}] - Optional overrides for prediction features
 * @returns {Promise<Object>} Demand forecast data from XGBoost ML engine
 */
export async function getDemandForecast(customParams = {}) {
  try {
    const payload = {
      day_of_week: 'Monday',
      zone_id: 'Zone_3',
      zone_density_tier: 'High',
      service_type: 'AC Repair',
      price_tier: 'Standard',
      weather_condition: 'Hot',
      is_weekend: 0,
      month: new Date().getMonth() + 1,
      is_holiday_or_festival: 0,
      temperature_c: 32.5,
      num_available_workers: 35,
      avg_zone_worker_rating: 4.8,
      promo_active: 1,
      past_7day_avg_bookings: 120.0,
      avg_response_time_min: 4.5,
      cancellation_rate: 0.03,
      lag_1: 115.0,
      lag_7: 110.0,
      rolling_14: 105.0,
      rolling_30: 98.0,
      worker_demand_ratio: 1.2,
      ...customParams,
    };

    const data = await fetchAdminEndpoint('/demand-forecast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return data;
  } catch (error) {
    console.error('[AdminService] Error fetching demand forecast:', error);
    throw error;
  }
}

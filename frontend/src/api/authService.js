/**
 * KaryaSahyog - Authentication API Service
 * Handles customer and worker login & registration.
 * Connects to live FastAPI backend.
 */

const RAW_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '';
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

/**
 * Login user via backend API
 * @param {Object} credentials - { email, password, role }
 * @returns {Promise<Object>} - User session data with token
 */
export async function loginWithApi({ email, password, role }) {
  const payload = {
    email: String(email).trim(),
    password: String(password),
  };

  const endpoint = `${BASE_URL}/auth/login`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        id: data.id || 1,
        full_name: data.full_name || email.split('@')[0],
        email: data.email || email,
        role: data.role || role || 'customer',
        token: data.token || 'mock-jwt-token-12345',
      };
    }

    // Handle 4xx validation or auth errors (real server response)
    let errorDetail = 'Invalid credentials or validation failed';
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = Array.isArray(errJson.detail)
          ? errJson.detail.map((d) => d.msg || d.message).join(', ')
          : String(errJson.detail);
      }
    } catch {
      // response not JSON
    }
    throw new Error(`Authentication failed (${response.status}): ${errorDetail}`);
  } catch (err) {
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection and ensure the backend server is running.', { cause: err });
    }
    throw err;
  }
}

/**
 * Register new user via backend API
 * @param {Object} userData - { fullName, email, phone, role }
 * @returns {Promise<Object>} - Registered user session data with token
 */
export async function registerWithApi({ fullName, email, phone, role }) {
  const payload = {
    full_name: String(fullName).trim(),
    email: String(email).trim(),
    phone: String(phone || '').trim(),
    role: (role || 'customer').toLowerCase(),
  };

  const endpoint = `${BASE_URL}/auth/register`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        id: data.id || 1,
        full_name: data.full_name || fullName,
        email: data.email || email,
        role: data.role || role || 'customer',
        token: data.token || 'mock-jwt-token-12345',
      };
    }

    let errorDetail = 'Registration validation failed';
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = Array.isArray(errJson.detail)
          ? errJson.detail.map((d) => d.msg || d.message).join(', ')
          : String(errJson.detail);
      }
    } catch {
      // response not JSON
    }
    throw new Error(`Registration failed (${response.status}): ${errorDetail}`);
  } catch (err) {
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection and ensure the backend server is running.', { cause: err });
    }
    throw err;
  }
}

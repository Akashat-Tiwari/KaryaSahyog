/**
 * KaryaSahyog - Customer API & Local Storage State Service
 * Manages customer session, active booking draft context,
 * backend customer booking APIs, customer bookings history, payment state per booking, and in-app notifications.
 */

const RAW_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '';
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

const ROLE_KEY = 'karyasahyog_role';
const USER_KEY = 'karyasahyog_user';
const TOKEN_KEY = 'karyasahyog_token';
const BOOKING_CONTEXT_KEY = 'karyasahyog_booking_context';
const BOOKINGS_KEY = 'karyasahyog_bookings';
const PAYMENTS_KEY = 'karyasahyog_payments';
const NOTIFICATIONS_KEY = 'karyasahyog_notifications';
const SESSION_KEY = 'karyasahyog_dev_session';

try {
  if (typeof sessionStorage !== 'undefined' && typeof localStorage !== 'undefined') {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      localStorage.removeItem(BOOKINGS_KEY);
      sessionStorage.setItem(SESSION_KEY, 'active');
    }
  }
} catch {
  // Ignore quota/access errors
}

const DEFAULT_USER = {
  id: null,
  name: '',
  email: '',
  phone: '',
  address: '',
  avatar: '',
  role: 'customer',
};

const DEFAULT_BOOKING_CONTEXT = {
  service: '',
  serviceId: '',
  serviceCategory: '',
  serviceType: null,
  appliance: null,
  worker: null,
  price: 0,
  latitude: null,
  longitude: null,
  location: '',
  emergencySupported: true,
};

function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore
  }
  return headers;
}

// --- ROLE & AUTH SESSION ---

export function getStoredRole() {
  try {
    return localStorage.getItem(ROLE_KEY) || sessionStorage.getItem(ROLE_KEY) || 'customer';
  } catch {
    return 'customer';
  }
}

export function setStoredRole(role) {
  try {
    const val = role ? String(role).toLowerCase() : 'customer';
    localStorage.setItem(ROLE_KEY, val);
    sessionStorage.setItem(ROLE_KEY, val);
  } catch {
    // Ignore storage quota errors
  }
}

export function persistAuthSession(user, token) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function getCurrentUser() {
  try {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Fall back to default user
  }
  return { ...DEFAULT_USER };
}

export function updateCurrentUser(partialUser) {
  try {
    const current = getCurrentUser();
    const updated = { ...current, ...partialUser };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_USER;
  }
}

export function logoutCustomer() {
  try {
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(BOOKING_CONTEXT_KEY);
    sessionStorage.removeItem(ROLE_KEY);
  } catch {
    // Ignore
  }
}

// --- BOOKING DRAFT CONTEXT ---

export function getBookingContext() {
  try {
    const stored = localStorage.getItem(BOOKING_CONTEXT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Fall back
  }
  return { ...DEFAULT_BOOKING_CONTEXT };
}

export function updateBookingContext(partialContext) {
  try {
    const current = getBookingContext();
    const updated = { ...current, ...partialContext };
    localStorage.setItem(BOOKING_CONTEXT_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_BOOKING_CONTEXT;
  }
}

// --- BACKEND CUSTOMER API INTEGRATIONS ---

/**
 * Creates booking on the FastAPI backend
 * Endpoint: POST /api/v1/customer/bookings
 *
 * @param {Object} bookingPayload - { customer_id, service_type, latitude, longitude, address }
 * @returns {Promise<Object>} Backend BookingResponse
 */
export async function createBookingOnBackend(bookingPayload) {
  const endpoint = `${BASE_URL}/customer/bookings`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      customer_id: Number(bookingPayload.customer_id) || 1,
      service_type: String(bookingPayload.service_type || 'General Service'),
      latitude: Number(bookingPayload.latitude),
      longitude: Number(bookingPayload.longitude),
      address: String(bookingPayload.address || 'Customer Location'),
    }),
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
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
    throw new Error(`Failed to create booking on backend (${response.status}): ${errorDetail}`);
  }

  return await response.json();
}

/**
 * Fetches bookings for a specific customer from the FastAPI backend
 * Endpoint: GET /api/v1/customer/bookings/{customer_id}
 * 
 * @param {number|string} customerId
 * @returns {Promise<Array>} List of BookingResponse objects
 */
export async function fetchBookingHistoryFromBackend(customerId) {
  const safeId = parseInt(String(customerId), 10) || 1;
  const endpoint = `${BASE_URL}/customer/bookings/${safeId}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch booking history from backend (${response.status}): ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// --- BOOKINGS HISTORY & STATE MANAGEMENT ---

export function getCustomerBookings() {
  try {
    const stored = localStorage.getItem(BOOKINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Fall back
  }
  return [];
}

/**
 * Async booking loader: Queries backend first, merges with local state,
 * and surfaces connection errors if the server is unreachable.
 */
export async function getCustomerBookingsAsync(customerId) {
  const localList = getCustomerBookings();

  try {
    const backendBookings = await fetchBookingHistoryFromBackend(customerId || getCurrentUser().id);

    // Map backend response fields to UI format
    const normalizedBackend = backendBookings.map((b) => ({
      id: `KS-${b.booking_id}`,
      backendBookingId: b.booking_id,
      service: b.service_type || 'Service',
      serviceCategory: 'general',
      serviceType: 'Scheduled',
      status: b.status || 'Confirmed',
      address: b.address || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      price: b.estimated_cost || 450,
      worker: {
        id: 'worker-101',
        name: b.assigned_worker_name || 'Assigned Professional',
        trade: b.service_type || 'Service Professional',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        rating: 4.9,
      },
      createdAt: new Date().toISOString(),
      source: 'backend_api',
      isDemoMode: false,
    }));

    // Merge: prioritize local records that match or append backend items
    const merged = [...localList];
    for (const bItem of normalizedBackend) {
      const existsIndex = merged.findIndex(
        (m) => m.id === bItem.id || String(m.backendBookingId) === String(bItem.backendBookingId)
      );
      if (existsIndex === -1) {
        merged.push(bItem);
      } else {
        // Retain local payment and progression status
        const localRec = merged[existsIndex];
        merged[existsIndex] = {
          ...bItem,
          ...localRec,
          status: localRec.status || bItem.status,
          paymentStatus: localRec.paymentStatus,
          isPaid: localRec.isPaid,
          rating: localRec.rating,
        };
      }
    }

    return {
      bookings: merged,
      backendConnected: true,
      error: null,
    };
  } catch (err) {
    throw new Error('Unable to connect to server. Please check your internet connection and ensure the backend server is running.', { cause: err });
  }
}

export function getBookingById(id) {
  if (!id) return null;
  const bookings = getCustomerBookings();
  const target = String(id).trim();
  const cleanTarget = target.replace(/^DEMO-/, '').replace(/^KS-/, '');

  const found = bookings.find((b) => {
    if (!b) return false;
    const bId = String(b.id || '');
    const cleanBId = bId.replace(/^DEMO-/, '').replace(/^KS-/, '');
    const backendId = b.backendBookingId ? String(b.backendBookingId) : '';

    return (
      b.id === id ||
      bId === target ||
      backendId === target ||
      cleanBId === cleanTarget ||
      cleanBId === target ||
      backendId === cleanTarget
    );
  });

  return found || null;
}

/**
 * Saves customer booking after successful backend verification
 * Only persists locally when backend booking creation succeeds.
 */
export async function saveCustomerBooking(bookingData) {
  const user = getCurrentUser();

  // Call the real backend API
  const backendResult = await createBookingOnBackend({
    customer_id: user.id || 1,
    service_type: bookingData.service || 'General Service',
    latitude: bookingData.latitude,
    longitude: bookingData.longitude,
    address: bookingData.location || bookingData.address || user.address || 'Customer Location',
  });

  // Only execute following local persistence upon backend API success
  const bookings = getCustomerBookings();
  const bookingId = backendResult.booking_id ? `KS-${backendResult.booking_id}` : `KS-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBooking = {
    id: bookingId,
    backendBookingId: backendResult.booking_id || null,
    isDemoMode: false,
    source: 'backend_api',
    createdAt: new Date().toISOString(),
    status: 'Booking Confirmed',
    assigned_worker_name: backendResult.assigned_worker_name || bookingData.worker?.name || 'Assigned Worker',
    price: backendResult.estimated_cost || bookingData.price || 450,
    paymentStatus: 'Unpaid',
    isPaid: false,
    ...bookingData,
  };

  const updated = [newBooking, ...bookings.filter((b) => b.id !== newBooking.id)];
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));

  // Add confirmation notification
  addCustomerNotification({
    title: 'Booking Confirmed!',
    message: `Your booking for ${newBooking.service || 'Service'} is confirmed with ${newBooking.assigned_worker_name}.`,
    time: 'Just now',
  });

  return newBooking;
}


export function updateBookingStatus(id, status, extraFields = {}) {
  if (!id) return null;
  try {
    const bookings = getCustomerBookings();
    const target = String(id).trim();
    const cleanTarget = target.replace(/^DEMO-/, '').replace(/^KS-/, '');
    let updatedBooking = null;

    const updated = bookings.map((b) => {
      if (!b) return b;
      const bId = String(b.id || '');
      const cleanBId = bId.replace(/^DEMO-/, '').replace(/^KS-/, '');
      const backendId = b.backendBookingId ? String(b.backendBookingId) : '';

      const isMatch =
        b.id === id ||
        bId === target ||
        backendId === target ||
        cleanBId === cleanTarget ||
        cleanBId === target ||
        backendId === cleanTarget;

      if (isMatch) {
        updatedBooking = {
          ...b,
          ...(status ? { status } : {}),
          ...extraFields,
          updatedAt: new Date().toISOString(),
        };
        return updatedBooking;
      }
      return b;
    });

    if (updatedBooking) {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
    }
    return updatedBooking;
  } catch {
    return null;
  }
}

export function cancelBooking(id, reason = '') {
  return updateBookingStatus(id, 'Cancelled', { cancelReason: reason });
}

// --- PER-BOOKING PAYMENT STATE MANAGEMENT ---

export function getPaymentsMap() {
  try {
    const stored = localStorage.getItem(PAYMENTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return {};
}

/**
 * Checks if a specific booking has already been paid
 * @param {string|number} bookingId
 * @returns {boolean}
 */
export function isBookingPaid(bookingId) {
  if (!bookingId) return false;
  const target = String(bookingId).trim();
  const cleanTarget = target.replace(/^DEMO-/, '').replace(/^KS-/, '');

  // 1. Check dedicated payments registry
  const paymentsMap = getPaymentsMap();
  if (
    paymentsMap[target]?.paid ||
    paymentsMap[`KS-${target}`]?.paid ||
    paymentsMap[`DEMO-KS-${target}`]?.paid ||
    paymentsMap[cleanTarget]?.paid ||
    paymentsMap[`KS-${cleanTarget}`]?.paid
  ) {
    return true;
  }

  // 2. Check in bookings array
  const booking = getBookingById(bookingId);
  if (booking) {
    const isPaid =
      booking.paymentStatus === 'Paid' ||
      booking.paymentStatus === 'paid' ||
      booking.isPaid === true;
    if (isPaid) return true;
  }

  return false;
}

/**
 * Retrieves payment details for a specific booking
 * @param {string|number} bookingId
 * @returns {Object|null}
 */
export function getBookingPayment(bookingId) {
  if (!bookingId) return null;
  const target = String(bookingId).trim();
  const cleanTarget = target.replace(/^DEMO-/, '').replace(/^KS-/, '');

  const paymentsMap = getPaymentsMap();
  const foundPayment =
    paymentsMap[target] ||
    paymentsMap[`KS-${target}`] ||
    paymentsMap[`DEMO-KS-${target}`] ||
    paymentsMap[cleanTarget] ||
    paymentsMap[`KS-${cleanTarget}`];

  if (foundPayment) {
    return foundPayment;
  }

  const booking = getBookingById(bookingId);
  if (booking && (booking.paymentStatus === 'Paid' || booking.isPaid)) {
    return {
      paid: true,
      bookingId: booking.id,
      method: booking.paymentMethod || 'UPI',
      amount: booking.price || 450,
      paidAt: booking.paidAt || booking.updatedAt || new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Records successful payment for a specific booking without duplicating or resetting
 * @param {string|number} bookingId
 * @param {Object} paymentInfo - { method, amount }
 * @returns {Object} Updated booking
 */
export function recordBookingPayment(bookingId, { method = 'UPI', amount } = {}) {
  const target = String(bookingId).trim();
  const cleanTarget = target.replace(/^DEMO-/, '').replace(/^KS-/, '');

  // 1. Update booking object with paymentStatus: 'Paid' and isPaid: true
  const updatedBooking = updateBookingStatus(bookingId, 'Service Completed', {
    paymentMethod: method,
    paymentStatus: 'Paid',
    isPaid: true,
    paidAt: new Date().toISOString(),
  });

  // 2. Persist in karyasahyog_payments registry across all ID permutations
  try {
    const paymentsMap = getPaymentsMap();
    const paymentRecord = {
      paid: true,
      bookingId: updatedBooking?.id || bookingId,
      method,
      amount: amount || updatedBooking?.price || 450,
      paidAt: new Date().toISOString(),
    };

    paymentsMap[target] = paymentRecord;
    paymentsMap[cleanTarget] = paymentRecord;
    if (updatedBooking?.id) {
      paymentsMap[updatedBooking.id] = paymentRecord;
    }
    if (updatedBooking?.backendBookingId) {
      paymentsMap[String(updatedBooking.backendBookingId)] = paymentRecord;
      paymentsMap[`KS-${updatedBooking.backendBookingId}`] = paymentRecord;
    }

    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(paymentsMap));
  } catch {
    // Ignore storage quota errors
  }

  // 3. Add customer notifications
  addCustomerNotification({
    title: 'Payment Successful',
    message: `₹${amount || updatedBooking?.price || 450} paid via ${method}.`,
    type: 'payment',
  });
  addCustomerNotification({
    title: 'Review Reminder',
    message: `Rate ${updatedBooking?.worker?.name || 'your worker'} for ${updatedBooking?.service || 'your service'}.`,
    type: 'review',
  });

  return updatedBooking;
}

// --- NOTIFICATIONS ---

export async function syncCustomerNotifications() {
  const localBookings = getCustomerBookings();
  let alertSource;

  if (localBookings && localBookings.length > 0) {
    alertSource = localBookings;
  } else {
    try {
      const backendBookings = await fetchBookingHistoryFromBackend(getCurrentUser().id || 1);
      alertSource = backendBookings.map((b) => ({
        id: `KS-${b.booking_id}`,
        backendBookingId: b.booking_id,
        service: b.service_type || 'Service',
        status: b.status || 'Confirmed',
        price: b.estimated_cost || 450,
        worker: { name: b.assigned_worker_name || 'Assigned Worker' },
        assigned_worker_name: b.assigned_worker_name || 'Assigned Worker',
        paymentMethod: 'UPI'
      }));
    } catch {
      alertSource = [];
    }
  }

  const existing = getCustomerNotifications();
  const readIds = new Set(existing.filter(n => !n.unread).map(n => n.id));

  const generated = [];
  alertSource.forEach((b) => {
    const cid = `notif-${b.id}-confirm`;
    generated.push({
      id: cid,
      unread: !readIds.has(cid),
      title: 'Booking Confirmed!',
      message: `Your booking for ${b.service || 'Service'} is confirmed with ${b.worker?.name || b.assigned_worker_name || 'Assigned Worker'}.`,
      time: b.date || 'Just now',
    });

    const isPaid = isBookingPaid(b.id) || b.paymentStatus === 'Paid' || b.isPaid;
    if (isPaid) {
      const pid = `notif-${b.id}-payment`;
      generated.push({
        id: pid,
        unread: !readIds.has(pid),
        title: 'Payment Successful',
        message: `₹${b.price || 450} paid via ${b.paymentMethod || 'UPI'}.`,
        type: 'payment',
        time: 'Just now',
      });
      const rid = `notif-${b.id}-review`;
      generated.push({
        id: rid,
        unread: !readIds.has(rid),
        title: 'Review Reminder',
        message: `Rate ${b.worker?.name || b.assigned_worker_name || 'your worker'} for ${b.service || 'your service'}.`,
        type: 'review',
        time: 'Just now',
      });
    }
  });

  const finalAlerts = generated.reverse();
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(finalAlerts));
  return finalAlerts;
}

export function getCustomerNotifications() {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Fall back
  }
  return [];
}

export function markNotificationRead(id) {
  try {
    const notifs = getCustomerNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, unread: false } : n));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function markAllNotificationsRead() {
  try {
    const notifs = getCustomerNotifications();
    const updated = notifs.map((n) => ({ ...n, unread: false }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function addCustomerNotification(notification) {
  try {
    const notifs = getCustomerNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      unread: true,
      time: 'Just now',
      ...notification,
    };
    const updated = [newNotif, ...notifs];
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

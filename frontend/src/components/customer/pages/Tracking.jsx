import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  Phone,
  ShieldCheck,
  X,
  XCircle,
  Play,
  CheckCircle2,
} from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import ProfessionalTrackerMap from '../components/ProfessionalTrackerMap';
import {
  addCustomerNotification,
  cancelBooking,
  getBookingById,
  updateBookingStatus,
  isBookingPaid,
  getBookingPayment,
} from '../../../api/customerService';
import { getWorkerStatus } from '../../../api/workerService';

const STEPS = [
  'Worker Assigned',
  'Worker Accepted',
  'Booking Confirmed',
  'Worker On the Way',
  'Service In Progress',
  'Service Completed',
];

const STEP_NOTES = {
  'Worker Assigned': 'A verified worker has been assigned.',
  Assigned: 'A verified worker has been assigned.',
  'Worker Accepted': 'The worker has accepted the request.',
  Accepted: 'The worker has accepted the request.',
  'Booking Confirmed': 'Your booking is confirmed.',
  Confirmed: 'Your booking is confirmed.',
  'Worker On the Way': 'The worker is on the way to your location.',
  'On The Way': 'The worker is on the way to your location.',
  Arrived: 'The worker has arrived at your location.',
  'Service In Progress': 'The service is in progress.',
  'In Progress': 'The service is in progress.',
  'Service Completed': 'The service is complete. You can proceed to payment.',
  Completed: 'The service is complete. You can proceed to payment.',
  Cancelled: 'This booking has been cancelled.',
};

function getStepIndex(status) {
  if (!status) return 0;
  if (status === 'Worker Assigned' || status === 'Assigned') return 0;
  if (status === 'Worker Accepted' || status === 'Accepted') return 1;
  if (status === 'Booking Confirmed' || status === 'Confirmed') return 2;
  if (status === 'Worker On the Way' || status === 'On The Way' || status === 'Arrived') return 3;
  if (status === 'Service In Progress' || status === 'In Progress') return 4;
  if (status === 'Service Completed' || status === 'Completed') return 5;
  return 0;
}

export default function Tracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(() => getBookingById(id));

  const current = booking?.status || 'Booking Confirmed';
  const isCancelled = current === 'Cancelled';
  const currentIndex = getStepIndex(current);
  const isCompleted = currentIndex === 5 || current === 'Service Completed' || current === 'Completed';

  // Derived polling active flag
  const isPolling = Boolean(booking?.worker?.id && !isCancelled && !isCompleted);

  // Live worker location state from backend API
  const [workerLocation, setWorkerLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Modal state for cancellation confirmation
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Track Professional tab / view toggle
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'timeline'

  // Determine worker assignment timestamp:
  // Uses backend assignment timestamp if available, else assignedAt, else createdAt
  const assignmentTimestamp = useMemo(() => {
    if (!booking) return null;
    return booking.assignedAt || booking.workerAssignedAt || booking.createdAt || null;
  }, [booking]);

  // 1-minute cancellation countdown timer logic
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (!assignmentTimestamp) return 60;
    const assignedTime = new Date(assignmentTimestamp).getTime();
    const elapsedSeconds = Math.floor((Date.now() - assignedTime) / 1000);
    return Math.max(0, 60 - elapsedSeconds);
  });

  // Live 1-second ticker for the 60-second countdown
  useEffect(() => {
    if (isCancelled || isCompleted || remainingSeconds <= 0) return undefined;

    const timer = setInterval(() => {
      const assignedTime = new Date(assignmentTimestamp).getTime();
      const elapsedSeconds = Math.floor((Date.now() - assignedTime) / 1000);
      const next = Math.max(0, 60 - elapsedSeconds);
      setRemainingSeconds(next);
    }, 1000);

    return () => clearInterval(timer);
  }, [assignmentTimestamp, isCancelled, isCompleted, remainingSeconds]);

  // Polling backend for professional location (GET /api/v1/worker/{worker_id}/status)
  // Interval: 12 seconds. Stops on cancel, completion, or unmount.
  useEffect(() => {
    const workerId = booking?.worker?.id;
    if (!workerId || isCancelled || isCompleted) return undefined;

    let isMounted = true;

    const fetchLocation = async () => {
      setLocationLoading(true);
      try {
        const statusData = await getWorkerStatus(workerId);
        if (!isMounted) return;
        setWorkerLocation(statusData);
        setLastUpdated(new Date().toISOString());
        setLocationError(null);
      } catch (err) {
        if (!isMounted) return;
        console.warn('[Tracking] Worker location fetch failed:', err.message);
        setLocationError(err.message || 'Worker location unavailable');
      } finally {
        if (isMounted) setLocationLoading(false);
      }
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 12000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [booking?.worker?.id, isCancelled, isCompleted]);

  const handleManualRefresh = async () => {
    const workerId = booking?.worker?.id;
    if (!workerId || isCancelled || isCompleted) return;
    setLocationLoading(true);
    try {
      const statusData = await getWorkerStatus(workerId);
      setWorkerLocation(statusData);
      setLastUpdated(new Date().toISOString());
      setLocationError(null);
    } catch (err) {
      setLocationError(err.message || 'Worker location unavailable');
    } finally {
      setLocationLoading(false);
    }
  };

  // Handle cancellation execution (strictly allowed only within 1-minute window)
  const handleExecuteCancel = () => {
    if (remainingSeconds <= 0) return;
    const updated = cancelBooking(booking.id, 'Cancelled by customer within 1-minute window');
    setBooking(updated);
    setShowCancelModal(false);
  };

  // PROTOTYPE FALLBACK: No backend booking status update API exists yet.
  // When PATCH /api/v1/customer/bookings/{id}/status becomes available, replace this
  // with the real backend API call. In production, status progression is pushed by
  // the worker via worker app.
  const handleAdvanceStatus = () => {
    if (isCancelled || isCompleted) return;
    const nextIndex = Math.min(currentIndex + 1, STEPS.length - 1);
    const nextStatus = STEPS[nextIndex];
    const updated = updateBookingStatus(id, nextStatus);
    setBooking(updated);

    if (nextStatus === 'Worker Assigned') {
      addCustomerNotification({
        title: 'Worker Assigned',
        message: `${booking.worker?.name || 'A verified worker'} has been assigned to your booking.`,
        type: 'tracking',
      });
    } else if (nextStatus === 'Worker Accepted') {
      addCustomerNotification({
        title: 'Worker Accepted Request',
        message: `${booking.worker?.name || 'Your worker'} has accepted the request.`,
        type: 'tracking',
      });
    } else if (nextStatus === 'Worker On the Way') {
      addCustomerNotification({
        title: 'Worker On The Way',
        message: `${booking.worker?.name || 'Your worker'} is traveling to your location.`,
        type: 'tracking',
      });
    } else if (nextStatus === 'Service In Progress') {
      addCustomerNotification({
        title: 'Service In Progress',
        message: `${booking.worker?.name || 'Your worker'} has started the service.`,
        type: 'tracking',
      });
    } else if (nextStatus === 'Service Completed') {
      addCustomerNotification({
        title: 'Service Completed',
        message: `${booking.service} is complete. Proceed to payment.`,
        type: 'booking',
      });
    }
  };

  if (!booking) {
    return (
      <CustomerLayout title="Track booking">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">This booking could not be found.</p>
          <Link
            to="/customer/history"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Back to Bookings
          </Link>
        </div>
      </CustomerLayout>
    );
  }

  const customerCoords = {
    lat: booking.customerLat || booking.latitude || 34.0837,
    lng: booking.customerLng || booking.longitude || 74.7973,
  };

  return (
    <CustomerLayout
      title="Track Professional"
      subtitle={booking.service}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* View mode toggle */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`rounded-md px-3 py-1 font-semibold transition-colors ${
              activeTab === 'map' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Track Map
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`rounded-md px-3 py-1 font-semibold transition-colors ${
              activeTab === 'timeline' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Status Steps
          </button>
        </div>
      </div>

      {/* Main Status Header Card */}
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                  isCancelled
                    ? 'bg-rose-100 text-rose-800'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {STEPS[currentIndex] || current}
              </span>
              {booking.isDemoMode || booking.id?.startsWith('DEMO-') ? (
                <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                  Demo Mode
                </span>
              ) : (
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                  Backend Connected
                </span>
              )}
            </div>
            <h2 className="mt-2 text-lg font-bold text-slate-900">{booking.service}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{STEP_NOTES[STEPS[currentIndex]] || STEP_NOTES[current] || ''}</p>
          </div>

          {booking.worker && (
            <div className="flex items-center gap-2">
              <a
                href="tel:7006123488"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-slate-50"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                Call Worker
              </a>
            </div>
          )}
        </div>

        {/* Worker quick glance */}
        {booking.worker && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Professional:</span>
              <span className="font-bold text-slate-900">{booking.worker.name}</span>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div className="text-slate-500">
              Scheduled: {booking.date} at {booking.time}
            </div>
          </div>
        )}
      </div>

      {/* Frontend Demo Status Progression Controller */}
      {!isCancelled && !isCompleted && (
        <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">SIH Prototype Demo Flow</p>
              </div>
              <p className="text-xs text-blue-700 mt-0.5">
                Current Status: <span className="font-bold text-blue-900">{STEPS[currentIndex]}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleAdvanceStatus}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              {currentIndex === 4 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Service</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Continue Demo</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Track Professional Map view */}
      {activeTab === 'map' ? (
        <div className="mb-4">
          <ProfessionalTrackerMap
            worker={booking.worker}
            workerLocation={workerLocation}
            customerLocation={customerCoords}
            bookingStatus={STEPS[currentIndex] || current}
            lastUpdated={lastUpdated}
            isLoading={locationLoading}
            error={locationError}
            onRefresh={handleManualRefresh}
            isPolling={isPolling}
          />
        </div>
      ) : (
        /* Timeline View */
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-900">Service Progress</h3>
          <ol className="space-y-4">
            {STEPS.map((step, index) => {
              const done = !isCancelled && index <= currentIndex;
              const active = !isCancelled && index === currentIndex;
              return (
                <li key={step} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isCancelled
                        ? 'bg-slate-200 text-slate-400'
                        : active
                        ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                        : done
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isCancelled
                          ? 'text-slate-400'
                          : active
                          ? 'text-blue-700'
                          : done
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}
                    >
                      {step}
                    </p>
                    <p className="text-xs text-slate-500">{STEP_NOTES[step]}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Cancellation Window & Action Box (Available only within 1 minute of assignment) */}
      {!isCancelled && !isCompleted && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-500" />
                Cancellation Window
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {remainingSeconds > 0
                  ? 'You can cancel this booking within 1 minute of professional assignment.'
                  : 'The 1-minute cancellation window has expired.'}
              </p>
            </div>

            {/* Countdown / Expired Badge */}
            {remainingSeconds > 0 ? (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-mono font-bold text-emerald-800 border border-emerald-200">
                <Clock className="h-3 w-3 animate-spin text-emerald-600" />
                00:{String(remainingSeconds).padStart(2, '0')}
              </span>
            ) : (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 border border-slate-200">
                Expired
              </span>
            )}
          </div>

          <div className="mt-4">
            {remainingSeconds > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium text-emerald-700">
                  Cancel booking available for 00:{String(remainingSeconds).padStart(2, '0')}
                </p>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full rounded-xl border border-rose-600 bg-rose-50/50 py-3 text-xs font-bold text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cancel Booking</span>
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <p className="text-xs font-semibold text-slate-500">
                  Cancellation window has expired.
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Professional has been dispatched. Cancellations are only permitted within 1 minute of assignment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* If already cancelled */}
      {isCancelled && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/70 p-5 text-center">
          <XCircle className="h-8 w-8 text-rose-600 mx-auto" />
          <h3 className="mt-2 text-sm font-bold text-rose-900">Booking Cancelled</h3>
          <p className="mt-1 text-xs text-rose-700">
            This booking was cancelled. No charges have been deducted and live tracking has ceased.
          </p>
          <Link
            to="/customer/services"
            className="mt-4 inline-block rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Explore Other Services
          </Link>
        </div>
      )}

      {/* Completion Action */}
      {isCompleted && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-center shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="mt-2 text-base font-bold text-emerald-950">
            {isBookingPaid(id) || isBookingPaid(booking.id) ? 'Service & Payment Completed' : 'Service Completed!'}
          </h3>
          <p className="mt-1 text-xs text-emerald-700">
            {isBookingPaid(id) || isBookingPaid(booking.id)
              ? `Payment of ₹${getBookingPayment(id)?.amount || getBookingPayment(booking.id)?.amount || booking.price || 450} settled via ${getBookingPayment(id)?.method || getBookingPayment(booking.id)?.method || booking.paymentMethod || 'UPI'}.`
              : 'The service has been completed. You can now proceed to payment.'}
          </p>
          {isBookingPaid(id) || isBookingPaid(booking.id) ? (
            <div className="mt-4 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => navigate(`/customer/review/${booking.id}`)}
                className="rounded-xl bg-emerald-600 text-white px-5 py-3 text-xs font-semibold hover:bg-emerald-700 shadow-sm cursor-pointer"
              >
                Rate & Review Service
              </button>
              <button
                type="button"
                onClick={() => navigate('/customer/history')}
                className="rounded-xl border border-emerald-300 bg-white text-emerald-800 px-5 py-3 text-xs font-semibold hover:bg-emerald-50 cursor-pointer"
              >
                View in Bookings
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/customer/payment/${booking.id}`)}
              className="mt-4 w-full rounded-xl bg-emerald-600 text-white py-3.5 text-sm font-semibold hover:bg-emerald-700 shadow-sm cursor-pointer"
            >
              Continue to Payment (₹{booking.price || 450})
            </button>
          )}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">Confirm Cancellation</h3>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Are you sure you want to cancel this booking with{' '}
              <strong className="text-slate-800">{booking.worker?.name || 'the professional'}</strong>?
              Live GPS tracking will stop immediately and the professional will be notified.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleExecuteCancel}
                className="w-full rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Yes, Cancel Booking
              </button>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

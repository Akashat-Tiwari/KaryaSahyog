import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, AlertCircle } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { getCurrentUser, getCustomerBookingsAsync, isBookingPaid } from '../../../api/customerService';

const TABS = ['All', 'Upcoming', 'Active', 'Completed', 'Cancelled'];
const ACTIVE = [
  'Worker Assigned',
  'Worker Accepted',
  'Worker On the Way',
  'Service In Progress',
  'On The Way',
  'Arrived',
  'In Progress',
  'Assigned',
  'Accepted',
];
const UPCOMING = ['Booking Confirmed', 'Confirmed'];
const COMPLETED = ['Service Completed', 'Completed'];

function matchesTab(booking, tab) {
  if (tab === 'All') return true;
  if (tab === 'Upcoming') return UPCOMING.includes(booking.status);
  if (tab === 'Active') return ACTIVE.includes(booking.status);
  if (tab === 'Completed') return COMPLETED.includes(booking.status);
  if (tab === 'Cancelled') return booking.status === 'Cancelled';
  return true;
}

export default function BookingHistory() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadBookings() {
      setIsLoading(true);
      setBackendError(null);
      const user = getCurrentUser();
      const result = await getCustomerBookingsAsync(user?.id || 1);

      if (!isMounted) return;
      setBookings(result.bookings);
      if (!result.backendConnected) {
        setBackendError(result.error);
      }
      setIsLoading(false);
    }

    loadBookings();
    return () => {
      isMounted = false;
    };
  }, []);

  const list = useMemo(() => bookings.filter((booking) => matchesTab(booking, tab)), [bookings, tab]);

  const open = (booking) => {
    if (booking.status === 'Cancelled') return;
    const isDone = booking.status === 'Completed' || booking.status === 'Service Completed';
    const isPaid = isBookingPaid(booking.id) || booking.paymentStatus === 'Paid' || booking.isPaid;

    if (isDone && isPaid && !booking.rating) {
      navigate(`/customer/review/${booking.id}`);
      return;
    }
    if (isDone && !isPaid) {
      navigate(`/customer/payment/${booking.id}`);
      return;
    }
    navigate(`/customer/tracking/${booking.id}`);
  };

  return (
    <CustomerLayout title="Bookings" subtitle="Open a booking to see details and tracking.">
      {isLoading && (
        <div className="mb-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2.5 rounded-xl">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Synchronizing with backend (GET /api/v1/customer/bookings)...</span>
        </div>
      )}

      {backendError && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Backend sync unavailable ({backendError}). Displaying local bookings.</span>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border ${
              tab === item ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-500">
          {isLoading ? 'Loading bookings...' : 'No bookings in this list.'}
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((booking) => {
            const isPaid = isBookingPaid(booking.id) || booking.paymentStatus === 'Paid' || booking.isPaid;
            const isDone = booking.status === 'Completed' || booking.status === 'Service Completed';

            return (
              <button
                key={booking.id}
                type="button"
                onClick={() => open(booking)}
                className="w-full bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-300 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{booking.service}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{booking.worker?.name || booking.assigned_worker_name || 'Assigned Worker'}</p>
                    <p className="text-xs text-slate-500 mt-1">{booking.date} • {booking.time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded-md">{booking.status}</span>
                    {isPaid ? (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Paid</span>
                    ) : isDone ? (
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Payment Due</span>
                    ) : null}
                    {booking.isDemoMode || booking.id?.startsWith('DEMO-') ? (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Demo Booking</span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </CustomerLayout>
  );
}

import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { getCustomerBookings } from '../../../api/customerService';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const bookings = getCustomerBookings();
  const currentBooking = state?.bookingId ? bookings.find((b) => b.id === state.bookingId) : bookings[0];
  const bookingId = state?.bookingId || currentBooking?.id;
  const isDemo = state?.isDemoMode || currentBooking?.isDemoMode || bookingId?.startsWith('DEMO-');

  return (
    <CustomerLayout>
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 mt-4">Booking confirmed</h2>
        <p className="text-sm text-slate-500 mt-2">Your request is confirmed. You can track the worker from here.</p>
        
        {bookingId && (
          <p className="text-sm font-semibold text-slate-800 mt-4">
            Booking ID {bookingId}
          </p>
        )}

        {isDemo ? (
          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Demo Mode — Local Prototype Booking (Server was unavailable)</span>
          </div>
        ) : (
          <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-800 font-medium">
            Verified with backend API
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate(`/customer/tracking/${bookingId}`)}
          className="mt-6 w-full rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 cursor-pointer"
        >
          Track booking
        </button>
        <button
          type="button"
          onClick={() => navigate('/customer/history')}
          className="mt-3 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 cursor-pointer"
        >
          View bookings
        </button>
      </div>
    </CustomerLayout>
  );
}

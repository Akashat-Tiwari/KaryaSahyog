import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Banknote, CreditCard, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { getBookingById, isBookingPaid, getBookingPayment, recordBookingPayment } from '../../../api/customerService';

const METHODS = [
  { id: 'UPI', label: 'UPI', icon: Smartphone },
  { id: 'Card', label: 'Card', icon: CreditCard },
  { id: 'Cash', label: 'Cash', icon: Banknote },
];

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const booking = getBookingById(id);
  const isPaidAlready = isBookingPaid(id);
  const paymentDetails = getBookingPayment(id);

  const [method, setMethod] = useState('UPI');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  if (!booking) {
    return (
      <CustomerLayout title="Payment">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center max-w-md mx-auto">
          <p className="text-sm text-slate-500">Booking not found.</p>
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

  // If this specific booking has already been paid, show the Paid confirmation screen
  if (isPaidAlready) {
    return (
      <CustomerLayout title="Payment status" subtitle={booking.service}>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-lg mx-auto text-center shadow-xs">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mt-4">Payment Completed</h2>
          <p className="text-xs text-slate-500 mt-1">
            This booking has already been settled. Payment is not required again.
          </p>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Service</span>
              <span className="font-semibold text-slate-900">{booking.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid</span>
              <span className="font-bold text-slate-900">₹{paymentDetails?.amount || booking.price || 450}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-semibold text-slate-900">{paymentDetails?.method || booking.paymentMethod || 'UPI'}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
              <span className="text-slate-500">Payment Status</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold text-[11px]">
                Paid
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              type="button"
              onClick={() => navigate(`/customer/review/${booking.id}`)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-3 text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <span>Rate & Review Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/customer/history')}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              View in Bookings
            </button>
            <button
              type="button"
              onClick={() => navigate(`/customer/tracking/${booking.id}`)}
              className="w-full text-xs text-slate-500 hover:text-slate-700 py-1 cursor-pointer"
            >
              Back to Tracking Details
            </button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  // Normal unpaid flow
  const pay = async () => {
    setStatus('processing');
    setError('');
    // PROTOTYPE FALLBACK: No backend payment verification API exists yet.
    // When POST /api/v1/payments/verify becomes available, replace this block
    // with the real backend API call and remove the client-side simulation.
    await new Promise((resolve) => setTimeout(resolve, 900));
    try {
      recordBookingPayment(id, { method, amount: booking.price });
      setStatus('success');
      navigate(`/customer/review/${id}`);
    } catch {
      setStatus('failure');
      setError('Payment could not be completed.');
    }
  };

  return (
    <CustomerLayout title="Payment" subtitle={`Amount due for ${booking.service}`}>
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-3xl font-bold text-slate-900">₹{booking.price || 450}</p>
        <p className="text-sm text-slate-500 mt-1">Total amount due</p>
        
        <div className="mt-5 space-y-2">
          {METHODS.map((item) => {
            const Icon = item.icon;
            const selected = method === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMethod(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left cursor-pointer transition-colors ${
                  selected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <Icon className="w-5 h-5 text-blue-700" />
                <span className="font-semibold text-slate-900">{item.label}</span>
              </button>
            );
          })}
        </div>

        <p className="text-sm text-slate-500 mt-4">Selected: {method}</p>
        {error && <p className="text-sm text-rose-600 mt-2">{error}</p>}
        {status === 'success' && <p className="text-sm text-emerald-700 mt-2">Payment successful.</p>}
        {status === 'failure' && <p className="text-sm text-rose-600 mt-2">Payment failed.</p>}
        
        <button
          type="button"
          disabled={status === 'processing'}
          onClick={pay}
          className="mt-5 w-full rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 cursor-pointer transition-colors"
        >
          {status === 'processing' ? 'Processing…' : status === 'failure' ? 'Retry payment' : `Pay ₹${booking.price || 450}`}
        </button>
      </div>
    </CustomerLayout>
  );
}

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { getBookingById, updateBookingStatus } from '../../../api/customerService';

export default function Review() {
  const { id } = useParams();
  const navigate = useNavigate();
  const booking = getBookingById(id);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!booking) {
    return <CustomerLayout title="Review"><p className="text-sm text-slate-500">Booking not found.</p></CustomerLayout>;
  }

  const submit = (event) => {
    event.preventDefault();
    if (!rating) {
      setError('Please choose a star rating.');
      return;
    }
    // PROTOTYPE FALLBACK: No backend review/rating API exists yet.
    // When POST /api/v1/reviews becomes available, replace this local status update
    // with the real backend API call.
    updateBookingStatus(id, booking.status, { rating, review: text });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <CustomerLayout>
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">Thank you</h2>
          <p className="text-sm text-slate-500 mt-2">Your review has been submitted.</p>
          <button type="button" onClick={() => navigate('/customer/history')} className="mt-5 w-full rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold">
            Back to bookings
          </button>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title="Rate your service" subtitle={`${booking.worker?.name || 'Worker'} • ${booking.service}`}>
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="p-1"
              aria-label={`${value} star${value > 1 ? 's' : ''}`}
            >
              <Star className={`w-8 h-8 ${value <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>
        <label htmlFor="review-text" className="block text-sm font-medium text-slate-700 mt-4">Review</label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="How did the visit go?"
        />
        {error && <p className="text-sm text-rose-600 mt-2">{error}</p>}
        <button type="submit" className="mt-4 w-full rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700">
          Submit
        </button>
      </form>
    </CustomerLayout>
  );
}

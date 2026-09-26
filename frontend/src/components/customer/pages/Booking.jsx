import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { getBookingContext, saveCustomerBooking, updateBookingContext } from '../../../api/customerService';

export default function Booking() {
  const navigate = useNavigate();
  const context = getBookingContext();
  const isScheduled = context.serviceType !== 'Emergency';
  const [date, setDate] = useState(context.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(context.time || '10:00 AM');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const getCoordinates = async () => {
    let lat = context.latitude;
    let lng = context.longitude;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          updateBookingContext({ latitude: lat, longitude: lng });
        } catch {
          // GPS unavailable, fallback to NIT Srinagar reference coordinates
          lat = 34.0837;
          lng = 74.7973;
        }
      } else {
        lat = 34.0837;
        lng = 74.7973;
      }
    }
    return { lat: typeof lat === 'number' ? lat : 34.0837, lng: typeof lng === 'number' ? lng : 74.7973 };
  };

  const confirm = async () => {
    if (!context.worker) {
      setError('Select a worker before confirming.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (isScheduled && (!date || !time)) {
      setError('Select date and time for scheduled service.');
      return;
    }
    if (isScheduled && date < today) {
      setError('Please select a valid future date.');
      return;
    }

    const { lat, lng } = await getCoordinates();

    setStatus('loading');
    setError('');
    updateBookingContext({ date, time });

    try {
      // Calls live backend POST /api/v1/customer/bookings
      const booking = await saveCustomerBooking({
        service: context.service,
        serviceCategory: context.serviceCategory,
        serviceType: context.serviceType,
        appliance: context.appliance,
        worker: context.worker,
        location: context.location,
        latitude: lat,
        longitude: lng,
        date,
        time,
        price: context.price || context.worker?.basePrice || 450,
      });

      setStatus('success');
      navigate('/customer/booking-confirmation', {
        state: {
          bookingId: booking.id,
          backendBookingId: booking.backendBookingId,
          assignedWorker: booking.assigned_worker_name,
          isDemoMode: false,
        },
      });
    } catch (err) {
      setStatus('failure');
      setError(err.message || 'Unable to connect to server. Please check your internet connection and ensure the backend server is running.');
    }
  };

  return (
    <CustomerLayout
      title="Confirm booking"
      subtitle={`${context.service} • ${context.serviceType || 'Scheduled'}${context.appliance ? ` • ${context.appliance}` : ''}`}
    >
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Emergency Notice if in Emergency mode */}
      {!isScheduled && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-800 flex items-center gap-3">
          <span className="text-base">🚨</span>
          <div>
            <p className="font-bold">Emergency Service Mode Active</p>
            <p className="text-rose-700 mt-0.5">
              This booking will be prioritized for immediate dispatch. Your professional will be notified to arrive as soon as possible.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
        <Row label="Service" value={context.service} />
        <Row
          label="Service mode"
          value={
            context.serviceType === 'Emergency' ? (
              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-bold text-xs">
                🚨 Emergency Service
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md font-semibold text-xs">
                📅 Scheduled Service
              </span>
            )
          }
        />
        {context.appliance && <Row label="Appliance" value={context.appliance} />}
        <Row label="Worker" value={context.worker?.name} />
        <Row label="Location" value={context.location} />
        {isScheduled ? (
          <>
            <div>
              <label htmlFor="booking-date" className="block text-slate-500 mb-1">Date</label>
              <input id="booking-date" type="date" min={new Date().toISOString().split('T')[0]} value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2" />
            </div>
            <div>
              <label htmlFor="booking-time" className="block text-slate-500 mb-1">Time</label>
              <select id="booking-time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2">
                {['09:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <Row label="Timing" value="Immediate Dispatch (Earliest Arrival)" />
        )}
        <Row label="Price" value={`₹${context.price || context.worker?.basePrice || 0}`} />
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Server Notice</p>
              <p className="text-amber-800 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {status === 'success' && <p className="text-sm text-emerald-700 mt-3">Booking verified with backend API.</p>}

      <button
        type="button"
        disabled={status === 'loading' || !context.worker}
        onClick={confirm}
        className="mt-5 w-full rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
      >
        {status === 'loading' ? 'Creating Booking (POST /customer/bookings)...' : status === 'failure' ? 'Retry Backend Booking' : 'Confirm Booking'}
      </button>
    </CustomerLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 text-right">{value || '—'}</span>
    </div>
  );
}

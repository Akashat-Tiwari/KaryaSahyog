import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Loader2, Sparkles } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { getBookingContext, getCurrentUser, updateBookingContext } from '../../../api/customerService';

const SUGGESTED_LOCATIONS = [
  {
    name: 'NIT Srinagar Campus',
    description: 'Hazratbal, Srinagar',
    latitude: 34.0837,
    longitude: 74.7973,
    isPrimary: true,
  },
  {
    name: 'Hazratbal Main Area',
    description: 'Srinagar, Jammu & Kashmir',
    latitude: 34.1290,
    longitude: 74.8430,
  },
  {
    name: 'Lal Chowk City Center',
    description: 'Srinagar, Jammu & Kashmir',
    latitude: 34.0725,
    longitude: 74.8100,
  },
  {
    name: 'Dal Gate Boulevard',
    description: 'Srinagar, Jammu & Kashmir',
    latitude: 34.0850,
    longitude: 74.8300,
  },
];

export default function LocationSelection() {
  const navigate = useNavigate();
  const context = getBookingContext();
  const user = getCurrentUser();
  const [location, setLocation] = useState(context.location || user.address || '');
  const [error, setError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const confirm = (value, coords = null) => {
    const next = (value || location).trim();
    if (!next) {
      setError('Add a service location to continue.');
      return;
    }

    const payload = { location: next };
    if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
      payload.latitude = coords.latitude;
      payload.longitude = coords.longitude;
    } else if (typeof context.latitude !== 'number' || typeof context.longitude !== 'number') {
      // Default to Srinagar NIT reference coordinates
      payload.latitude = 34.0837;
      payload.longitude = 74.7973;
    }

    updateBookingContext(payload);
    navigate('/customer/workers');
  };

  const handleSelectPreset = (item) => {
    const fullText = `${item.name}, ${item.description}`;
    setLocation(fullText);
    confirm(fullText, { latitude: item.latitude, longitude: item.longitude });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      confirm(location || 'NIT Srinagar Campus, Hazratbal', { latitude: 34.0837, longitude: 74.7973 });
      return;
    }

    setIsLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        confirm(location || user.address || 'Detected Live Location', { latitude, longitude });
      },
      (geoError) => {
        setIsLocating(false);
        console.warn('Geolocation query failed or denied:', geoError.message);
        confirm(location || 'NIT Srinagar Campus, Hazratbal', { latitude: 34.0837, longitude: 74.7973 });
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  };

  const handleConfirmInput = () => {
    const trimmed = location.trim();
    if (!trimmed) {
      setError('Add a service location to continue.');
      return;
    }
    const matched = SUGGESTED_LOCATIONS.find(
      (l) => `${l.name}, ${l.description}`.toLowerCase() === trimmed.toLowerCase() || l.name.toLowerCase() === trimmed.toLowerCase()
    );
    const coords = matched
      ? { latitude: matched.latitude, longitude: matched.longitude }
      : (typeof context.latitude === 'number' && typeof context.longitude === 'number')
      ? { latitude: context.latitude, longitude: context.longitude }
      : { latitude: 34.0837, longitude: 74.7973 };

    confirm(trimmed, coords);
  };

  return (
    <CustomerLayout title="Service location" subtitle={`${context.service} • ${context.serviceType || 'Scheduled'}${context.appliance ? ` • ${context.appliance}` : ''}`}>
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <label htmlFor="location" className="block text-sm font-medium text-slate-700">Address</label>
        <div className="relative mt-1">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. NIT Srinagar Campus, Hazratbal"
          />
        </div>
        {error && <p className="text-sm text-rose-600 mt-2">{error}</p>}
        <button
          type="button"
          disabled={isLocating}
          onClick={handleUseCurrentLocation}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-800 disabled:opacity-60 cursor-pointer"
        >
          {isLocating && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLocating ? 'Detecting GPS location...' : 'Use device / GPS location'}
        </button>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Selectable Locations
        </p>
        <div className="space-y-2">
          {SUGGESTED_LOCATIONS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => handleSelectPreset(item)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-left hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
              {item.isPrimary && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3" /> Recommended
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleConfirmInput}
        className="mt-5 w-full rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
      >
        Confirm location
      </button>
    </CustomerLayout>
  );
}

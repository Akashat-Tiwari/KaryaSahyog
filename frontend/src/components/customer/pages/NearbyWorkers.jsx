import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, MapPin, Star, RefreshCw, AlertCircle } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { getBookingContext, updateBookingContext } from '../../../api/customerService';
import { getNearbyWorkers } from '../../../api/workerService';

/** Generic avatar placeholder (neutral person silhouette). */
const GENERIC_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='16' fill='%23e2e8f0'/%3E%3Ccircle cx='50' cy='38' r='16' fill='%2394a3b8'/%3E%3Cellipse cx='50' cy='80' rx='28' ry='22' fill='%2394a3b8'/%3E%3C/svg%3E";

const SORTS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'distance', label: 'Distance' },
  { id: 'rating', label: 'Rating' },
];

/**
 * Maps a backend service_category string (e.g. "Electrician", "Plumber")
 * to the internal category ID used in servicesData.js (e.g. "electrical", "plumbing").
 */
function mapServiceCategory(serviceCategory) {
  const cat = (serviceCategory || '').toLowerCase();
  if (cat.includes('electric')) return 'electrical';
  if (cat.includes('plumb')) return 'plumbing';
  if (cat.includes('clean')) return 'cleaning';
  if (cat.includes('carpent')) return 'carpentry';
  if (cat.includes('appli') || cat.includes('hvac')) return 'appliance';
  if (cat.includes('paint')) return 'painting';
  if (cat.includes('mov') || cat.includes('pack') || cat.includes('pest') || cat.includes('maint')) return 'moving';
  return cat;
}

/**
 * Computes the Haversine distance (km) between two lat/lng coordinate pairs.
 * Returns null if any coordinate is missing.
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => typeof v !== 'number' || isNaN(v))) return null;
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearbyWorkers() {
  const navigate = useNavigate();
  const context = getBookingContext();
  const [sortBy, setSortBy] = useState('recommended');
  const [apiWorkers, setApiWorkers] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState(() => {
    if (typeof context.latitude === 'number' && typeof context.longitude === 'number') {
      return { lat: context.latitude, lng: context.longitude };
    }
    return { lat: 34.0837, lng: 74.7973 };
  });
  const [locationStatus, setLocationStatus] = useState(() => {
    if (typeof context.latitude === 'number' && typeof context.longitude === 'number') {
      return 'available';
    }
    return 'available';
  });
  const [apiError, setApiError] = useState(null);

  const fetchWorkers = useCallback(async (lat, lng) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await getNearbyWorkers(lat, lng);
      if (Array.isArray(data)) {
        const normalized = data.map((bWorker) => {
          const category = mapServiceCategory(bWorker.service_category);
          const dist = haversineKm(lat, lng, bWorker.current_lat, bWorker.current_lng);
          return {
            id: `worker-${bWorker.worker_id}`,
            worker_id: bWorker.worker_id,
            name: bWorker.name || 'Worker',
            trade: bWorker.service_category || 'Service Professional',
            category,
            rating: bWorker.rating != null ? bWorker.rating : null,
            verified: bWorker.verification_status
              ? bWorker.verification_status.includes('Verified')
              : false,
            cooperativeBadge: bWorker.verification_status || '',
            insuranceActive: bWorker.insurance_active ?? false,
            distanceKm: dist != null ? Math.round(dist * 10) / 10 : null,
          };
        });
        setApiWorkers(normalized);
      } else {
        setApiWorkers([]);
      }
    } catch (err) {
      console.warn('[NearbyWorkers] Live API fetch failed:', err.message);
      setApiError(`Failed to fetch nearby workers from backend: ${err.message || 'Server unavailable'}`);
      setApiWorkers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      fetchWorkers(34.0837, 74.7973);
      return;
    }

    setLocationStatus('prompting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationStatus('available');
        updateBookingContext({ latitude, longitude });
        fetchWorkers(latitude, longitude);
      },
      (err) => {
        console.warn('Geolocation permission denied or timed out:', err.message);
        setLocationStatus('denied');
        fetchWorkers(34.0837, 74.7973);
      },
      { timeout: 4000, enableHighAccuracy: true }
    );
  }, [fetchWorkers]);

  useEffect(() => {
    let isCancelled = false;

    const initWorkerSearch = async () => {
      if (coords) {
        if (!isCancelled) {
          await fetchWorkers(coords.lat, coords.lng);
        }
      } else {
        if (!isCancelled) {
          requestLocation();
        }
      }
    };

    void initWorkerSearch();

    return () => {
      isCancelled = true;
    };
  }, [coords, fetchWorkers, requestLocation]);

  const workers = useMemo(() => {
    if (!apiWorkers) return [];
    let list = [...apiWorkers];

    // Strict filter: only show workers matching the customer's selected service category
    if (context.serviceCategory) {
      list = list.filter(
        (w) => w.category === context.serviceCategory.toLowerCase()
      );
    }

    const sorters = {
      distance: (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
      rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
      recommended: (a, b) => {
        const score = (w) =>
          (w.rating ?? 0) * 20 -
          (w.distanceKm ?? 10) * 4 +
          (w.verified ? 6 : 0);
        return score(b) - score(a);
      },
    };

    return list.sort(sorters[sortBy] || sorters.recommended);
  }, [apiWorkers, context.serviceCategory, sortBy]);

  return (
    <CustomerLayout
      title="Nearby workers"
      subtitle={`${context.service || 'Service'} • ${context.serviceType || 'Scheduled'}${context.appliance ? ` • ${context.appliance}` : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {isLoading ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-lg">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Querying live workers (GET /worker/nearby)...
          </span>
        ) : apiWorkers && apiWorkers.length > 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
            Connected to backend
          </span>
        ) : null}
      </div>

      {/* Location Status Banner when GPS is unavailable or denied */}
      {locationStatus === 'denied' && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">GPS location not enabled</p>
              <p className="text-amber-700 mt-0.5">
                Using default coordinates for live worker search. Enable GPS for exact nearby results.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestLocation}
            className="shrink-0 rounded-lg bg-amber-200/80 px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-300"
          >
            Enable GPS
          </button>
        </div>
      )}

      {apiError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{apiError}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchWorkers(coords?.lat || 28.4595, coords?.lng || 77.0266)}
            className="shrink-0 rounded-lg bg-rose-200/80 px-2.5 py-1 font-semibold text-rose-900 hover:bg-rose-300"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {SORTS.map((sort) => (
          <button
            key={sort.id}
            type="button"
            onClick={() => setSortBy(sort.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border ${
              sortBy === sort.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            {sort.label}
          </button>
        ))}
      </div>

      {workers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-500">
          No workers found for this request yet. Try another service or location.
        </div>
      ) : (
        <div className="space-y-3">
          {workers.map((worker) => (
            <button
              key={worker.id || worker.worker_id}
              type="button"
              onClick={() => navigate(`/customer/worker/${worker.worker_id || worker.id}`)}
              className="w-full bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-300 transition-colors cursor-pointer"
            >
              <div className="flex gap-3">
                <img
                  src={GENERIC_AVATAR}
                  alt={worker.name}
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">{worker.name}</p>
                      <p className="text-xs text-slate-500">{worker.trade}</p>
                    </div>
                    {worker.verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                    {worker.rating != null && (
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> {worker.rating}
                      </span>
                    )}
                    {worker.distanceKm != null && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {worker.distanceKm} km away
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}

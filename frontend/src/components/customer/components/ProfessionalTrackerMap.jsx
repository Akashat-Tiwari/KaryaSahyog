import { MapPin, Navigation, RefreshCw, ShieldCheck, User } from 'lucide-react';
import { formatDistance } from '../../../utils/geoUtils';

export default function ProfessionalTrackerMap({
  worker,
  workerLocation,
  customerLocation,
  bookingStatus = 'Confirmed',
  lastUpdated,
  isLoading = false,
  error = null,
  onRefresh,
  isPolling = false,
}) {
  const distanceKm = workerLocation?.distanceKm ?? null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Visual Simulated Map Banner */}
      <div className="relative h-64 bg-slate-900 overflow-hidden flex items-center justify-center">
        {/* Map Grid Pattern background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px), radial-gradient(#60a5fa 1px, #0f172a 1px)`,
            backgroundSize: `20px 20px`,
            backgroundPosition: `0 0, 10px 10px`,
          }}
        />

        {/* Animated Connecting Line */}
        <div className="absolute w-48 h-0.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500 animate-pulse" />

        {/* Customer Pin */}
        <div className="absolute left-16 sm:left-24 flex flex-col items-center" title={customerLocation ? `${customerLocation.lat}, ${customerLocation.lng}` : 'Your location'}>
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg ring-4 ring-blue-500/30 animate-bounce">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="mt-1 text-[11px] font-bold bg-slate-900/90 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
            Your Location
          </span>
        </div>

        {/* Worker Pin */}
        <div className="absolute right-16 sm:right-24 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-500/30">
            <Navigation className="w-5 h-5 transform rotate-45" />
          </div>
          <span className="mt-1 text-[11px] font-bold bg-slate-900/90 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
            {worker?.name || 'Worker'}
          </span>
        </div>

        {/* Live Status Badge on Map */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2 text-white">
          <span className={`w-2 h-2 rounded-full ${isPolling ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
          <span className="text-xs font-semibold">{bookingStatus}</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700 text-white transition-colors"
            title="Refresh location"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Info Card beneath Map */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            {worker?.avatar ? (
              <img src={worker.avatar} alt={worker.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900">{worker?.name || 'Assigned Worker'}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs text-slate-500">{worker?.trade || 'Service Professional'}</p>
          </div>
        </div>

        <div className="text-right">
          {distanceKm !== null && (
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg">
              {formatDistance(distanceKm)} away
            </span>
          )}
          {lastUpdated && (
            <span className="block text-[10px] text-slate-400 mt-1">
              Updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border-t border-rose-200 text-xs text-rose-700">
          {error}
        </div>
      )}
    </div>
  );
}

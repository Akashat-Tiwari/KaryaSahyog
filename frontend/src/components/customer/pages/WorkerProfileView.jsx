import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Star, ShieldCheck, RefreshCw } from 'lucide-react';
import CustomerLayout from '../components/CustomerLayout';
import { getBookingContext, updateBookingContext } from '../../../api/customerService';
import { getWorkerStatus } from '../../../api/workerService';

/** Generic avatar placeholder (neutral person silhouette). */
const GENERIC_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='16' fill='%23e2e8f0'/%3E%3Ccircle cx='50' cy='38' r='16' fill='%2394a3b8'/%3E%3Cellipse cx='50' cy='80' rx='28' ry='22' fill='%2394a3b8'/%3E%3C/svg%3E";

export default function WorkerProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const request = getBookingContext();

  useEffect(() => {
    let isMounted = true;
    async function loadWorkerProfile() {
      setIsLoadingBackend(true);
      setBackendError(false);
      try {
        const liveData = await getWorkerStatus(id);
        if (!isMounted) return;

        if (liveData) {
          const constructedWorker = {
            id: `worker-${liveData.worker_id || id}`,
            worker_id: liveData.worker_id || id,
            name: liveData.name || 'Worker',
            trade: liveData.service_category || 'Service Professional',
            rating: liveData.rating != null ? liveData.rating : null,
            verified: liveData.verification_status
              ? liveData.verification_status.includes('Verified')
              : false,
            cooperativeBadge: liveData.verification_status || '',
            insuranceActive: liveData.insurance_active ?? false,
            liveLat: liveData.current_lat,
            liveLng: liveData.current_lng,
            isBackendSynced: true,
          };
          setWorker(constructedWorker);
        }
      } catch (err) {
        console.warn('[WorkerProfileView] Backend live fetch failed:', err.message);
        if (!isMounted) return;
        setBackendError(true);
      } finally {
        if (isMounted) setIsLoadingBackend(false);
      }
    }

    loadWorkerProfile();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!worker) {
    return (
      <CustomerLayout title="Worker Profile">
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md mx-auto">
          {isLoadingBackend ? (
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-sm font-semibold text-slate-700">Loading worker profile from backend...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500">
                {backendError
                  ? 'Could not load this worker profile. The backend may be unavailable.'
                  : 'The requested worker profile could not be found.'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/customer/workers')}
                className="mt-4 rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-semibold hover:bg-blue-700"
              >
                Back to Nearby Workers
              </button>
            </>
          )}
        </div>
      </CustomerLayout>
    );
  }

  const bookNow = () => {
    updateBookingContext({
      worker,
      price: request.price || 0,
    });
    navigate('/customer/booking');
  };

  return (
    <CustomerLayout>
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {isLoadingBackend ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-lg">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying worker status...
          </span>
        ) : worker.isBackendSynced ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
            Live status verified
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <img src={GENERIC_AVATAR} alt="" className="w-20 h-20 rounded-xl object-cover bg-slate-100" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{worker.name}</h2>
                {worker.verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <BadgeCheck className="w-3.5 h-3.5" /> {worker.cooperativeBadge}
                  </span>
                )}
                {worker.insuranceActive && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5" /> Insured
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">{worker.trade}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                {worker.rating != null && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500" /> {worker.rating}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="bg-white border border-slate-200 rounded-xl p-5 h-fit">
          <h3 className="text-sm font-bold text-slate-900">Your request</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Service</dt><dd className="font-medium text-right">{request.service || '—'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Type</dt><dd className="font-medium text-right">{request.serviceType || 'Scheduled'}</dd></div>
            {request.appliance && <div className="flex justify-between gap-3"><dt className="text-slate-500">Appliance</dt><dd className="font-medium text-right">{request.appliance}</dd></div>}
            <div className="flex justify-between gap-3"><dt className="text-slate-500">Location</dt><dd className="font-medium text-right">{request.location || '—'}</dd></div>
          </dl>
          <button type="button" onClick={bookNow} className="mt-5 w-full rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 cursor-pointer">
            Book Now
          </button>
        </aside>
      </div>
    </CustomerLayout>
  );
}

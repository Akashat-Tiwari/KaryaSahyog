import { useState, useEffect, useCallback } from 'react';
import {
  User,
  ShieldCheck,
  Shield,
  Briefcase,
  MapPin,
  Star,
  Phone,
  Mail,
  Award,
  CheckCircle2,
  Clock,
  Wrench,
  HeartPulse,
  Building2,
  BookmarkCheck,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { getWorkerStatus } from '../../api/workerService';

export default function WorkerProfile() {
  const [isOnline, setIsOnline] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const mapBackendData = (data) => ({
    workerId: data.worker_id || 'worker_123',
    name: data.name || 'Ramesh Kumar',
    trade: data.service_category || 'Certified Electrician',
    rating: data.rating || 4.9,
    reviewCount: 142,
    location: 'Sector 43, South City 1, Gurugram',
    experience: '8+ Years Exp.',
    phone: '+91 98765 43210',
    email: `${(data.name || 'worker').toLowerCase().replace(/\s+/g, '.')}@karyasahyog.in`,
    verificationStatus: data.verification_status || 'Verified (Aadhaar Linked)',
    insuranceStatus: data.insurance_active ? 'Active' : 'Pending',
    insurancePolicy: 'Policy #KS-SEC-9941',
    skills: [
      data.service_category || 'Electrician',
      'Wiring & Rewiring',
      'Appliance Repair',
      'Circuit Breakers (MCB)',
      'Inverter Setup',
      'AC Power Fix',
      'Emergency Electrical',
    ],
    welfareBenefits: [
      {
        id: 'health',
        name: 'Cooperative Health Fund',
        detail: 'Cashless OPD & Hospital Care',
        status: data.insurance_active ? 'Active' : 'Pending',
        statusType: data.insurance_active ? 'success' : 'warning',
      },
      {
        id: 'pf',
        name: 'PF & Pension Status',
        detail: 'UAN: 1014-9821-4401',
        status: String(data.verification_status || '').toLowerCase().includes('verified')
          ? 'Enrolled'
          : 'Pending',
        statusType: 'success',
      },
      {
        id: 'welfare-card',
        name: 'Welfare Board Scheme',
        detail: 'KaryaSahyog Suraksha Card',
        status: 'Registered',
        statusType: 'info',
      },
    ],
    stats: {
      completed: 318,
      onTimeRate: '99.2%',
      responseTime: '< 5 min',
    },
  });

  const getFallbackProfile = () => ({
    workerId: 'worker_123',
    name: 'Ramesh Kumar',
    trade: 'Master Electrician & HVAC Specialist',
    rating: 4.9,
    reviewCount: 142,
    location: 'Sector 43, South City 1, Gurugram',
    experience: '8+ Years Exp.',
    phone: '+91 98765 43210',
    email: 'ramesh.kumar@karyasahyog.in',
    verificationStatus: 'Verified (Aadhaar Linked)',
    insuranceStatus: 'Active',
    insurancePolicy: 'Policy #KS-SEC-9941',
    skills: [
      'Electrician',
      'Wiring & Rewiring',
      'Appliance Repair',
      'Circuit Breakers (MCB)',
      'Inverter Setup',
      'AC Power Fix',
      'Emergency Electrical',
    ],
    welfareBenefits: [
      {
        id: 'health',
        name: 'Cooperative Health Fund',
        detail: 'Cashless OPD & Hospital Care',
        status: 'Active',
        statusType: 'success',
      },
      {
        id: 'pf',
        name: 'PF & Pension Status',
        detail: 'UAN: 1014-9821-4401',
        status: 'Enrolled',
        statusType: 'success',
      },
      {
        id: 'welfare-card',
        name: 'Welfare Board Scheme',
        detail: 'KaryaSahyog Suraksha Card',
        status: 'Registered',
        statusType: 'info',
      },
    ],
    stats: {
      completed: 318,
      onTimeRate: '99.2%',
      responseTime: '< 5 min',
    },
  });

  const handleRetry = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const data = await getWorkerStatus('worker_123');
      if (data) {
        setProfile(mapBackendData(data));
      }
    } catch (err) {
      console.warn('[WorkerProfile] Retry failed:', err);
      setFetchError('Backend offline / using local fallback');
      setProfile(getFallbackProfile());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialStatus() {
      try {
        const data = await getWorkerStatus('worker_123');
        if (isMounted && data) {
          setProfile(mapBackendData(data));
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[WorkerProfile] Backend fetch failed, falling back to local profile:', err);
          setFetchError('Backend offline / using local fallback');
          setProfile(getFallbackProfile());
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitialStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col gap-6 animate-pulse">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-slate-200 mb-4" />
          <div className="h-6 w-36 bg-slate-200 rounded-md mb-2" />
          <div className="h-4 w-48 bg-slate-100 rounded-md mb-3" />
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-slate-100 rounded-full" />
            <div className="h-5 w-24 bg-slate-100 rounded-full" />
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="h-16 bg-slate-100 rounded-xl" />

        <div className="space-y-2">
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 py-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Syncing with FastAPI Backend (/worker/worker_123/status)...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col gap-6">
      {/* Backend Sync Indicator Banner if fallback */}
      {fetchError && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <span>{fetchError}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-1 font-bold text-blue-700 hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Profile Header & Avatar */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {/* Photo placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-700">
                <User className="w-12 h-12 text-slate-500 stroke-[1.5]" />
              </div>
            </div>
          </div>
          {/* Online status indicator dot on avatar */}
          <span
            className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm transition-colors ${
              isOnline ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          />
        </div>

        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{profile.name}</h2>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            ID: {profile.workerId}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-blue-600">
          <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{profile.trade}</span>
        </div>

        {/* Rating and Experience Badges */}
        <div className="flex items-center gap-2 mt-2.5">
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{profile.rating}</span>
            <span className="text-amber-600/80 font-normal">({profile.reviewCount})</span>
          </div>
          <div className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-slate-500" />
            <span>{profile.experience}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{profile.location}</span>
        </div>
      </div>

      {/* Skills Section (Pill-shaped tags directly below profile details) */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            <span>Worker Skills & Expertise</span>
          </div>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {profile.skills.length} Certified
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center text-xs font-medium bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 px-3 py-1 rounded-full border border-slate-200 shadow-xs transition-colors cursor-default"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Availability Toggle Switch */}
      <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Availability Status
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className={`text-sm font-semibold ${isOnline ? 'text-emerald-700' : 'text-slate-600'}`}>
              {isOnline ? 'Online & Ready' : 'Offline / On Break'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isOnline ? 'Receiving real-time job dispatches' : 'Lead reception paused'}
          </p>
        </div>

        {/* Accessible Custom Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isOnline}
          onClick={() => setIsOnline(!isOnline)}
          className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        >
          <span className="sr-only">Toggle availability status</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              isOnline ? 'translate-x-7' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Compliance & Badges Section */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Compliance & Verification
        </h3>

        {/* Verification Status Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-emerald-800 font-medium">Aadhaar & Police Verification</div>
              <div className="text-sm font-bold text-emerald-950 flex items-center gap-1">
                {profile.verificationStatus}
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-emerald-200/60 text-emerald-800 px-2.5 py-0.5 rounded-full">
            Govt. ID Approved
          </span>
        </div>

        {/* Insurance Status Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-blue-800 font-medium">Worker Accidental Cover</div>
              <div className="text-sm font-bold text-blue-950 flex items-center gap-1">
                {profile.insuranceStatus}
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-blue-200/60 text-blue-800 px-2.5 py-0.5 rounded-full">
            ₹5,00,000 Coverage
          </span>
        </div>
      </div>

      {/* Welfare & Benefits Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Welfare & Benefits
          </h3>
          <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
            Cooperative Member
          </span>
        </div>

        <div className="space-y-2">
          {profile.welfareBenefits.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                item.id === 'health'
                  ? 'bg-purple-50/60 border-purple-100 text-purple-950'
                  : item.id === 'pf'
                  ? 'bg-amber-50/60 border-amber-100 text-amber-950'
                  : 'bg-sky-50/60 border-sky-100 text-sky-950'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.id === 'health'
                      ? 'bg-purple-100 text-purple-700'
                      : item.id === 'pf'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {item.id === 'health' && <HeartPulse className="w-4 h-4" />}
                  {item.id === 'pf' && <Building2 className="w-4 h-4" />}
                  {item.id === 'welfare-card' && <BookmarkCheck className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold">{item.name}</div>
                  <div className="text-[11px] opacity-80 font-medium">{item.detail}</div>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  item.status === 'Active' || item.status === 'Enrolled'
                    ? 'text-emerald-700 bg-emerald-100'
                    : 'text-blue-700 bg-blue-100'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
        <div className="p-1">
          <div className="text-xs text-slate-500 font-medium">Completed</div>
          <div className="text-base font-bold text-slate-800">{profile.stats.completed}</div>
        </div>
        <div className="p-1 border-x border-slate-200">
          <div className="text-xs text-slate-500 font-medium">On-Time</div>
          <div className="text-base font-bold text-emerald-600">{profile.stats.onTimeRate}</div>
        </div>
        <div className="p-1">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Response</span>
          </div>
          <div className="text-base font-bold text-slate-800">{profile.stats.responseTime}</div>
        </div>
      </div>

      {/* Contact Snippet */}
      <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>{profile.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-slate-400 truncate" />
          <span className="truncate">{profile.email}</span>
        </div>
      </div>
    </div>
  );
}

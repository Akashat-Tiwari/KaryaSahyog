import { useState } from 'react';
import {
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Wrench,
} from 'lucide-react';

const STEPS = [
  { id: 'start', label: 'Start Journey', subtitle: 'Heading to customer location' },
  { id: 'arrived', label: 'Arrived', subtitle: 'At customer doorstep' },
  { id: 'progress', label: 'Job in Progress', subtitle: 'Repair / service ongoing' },
  { id: 'completed', label: 'Mark Completed', subtitle: 'Job done & payment release' },
];

export default function ActiveJobStatus({
  job,
  onCompleteJob,
  onCancelJob,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // If no job passed, provide a fallback safe default
  const activeJob = job || {
    id: 'JOB-ACTIVE',
    customerName: 'Pooja Sharma',
    customerPhone: '+91 98112 34567',
    serviceNeeded: 'MCB Trip & Main Electrical Panel Repair',
    category: 'Emergency Electrical',
    distance: '1.8 km away',
    payout: 450,
    estimatedPayout: '₹450',
    addressSnippet: 'House #42, Sector 56, Huda Colony, Gurugram',
    instructions: 'Power keeps tripping in the master bedroom and kitchen.',
  };

  const handleNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Step 3 -> Mark Completed
      if (onCompleteJob) {
        onCompleteJob(activeJob);
      }
    }
  };

  const stepButtonLabels = [
    'Start Journey',
    'Mark as Arrived',
    'Start Work (In Progress)',
    'Confirm Job Completed',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col gap-5">
      {/* Header with Live Status Pulse */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Ongoing Job</h2>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>
            <p className="text-xs text-slate-500">Live service progress tracker</p>
          </div>
        </div>

        {/* Payout Tag */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Guaranteed Payout
          </span>
          <span className="text-base font-black text-emerald-600">
            ₹{activeJob.payout ? activeJob.payout.toLocaleString('en-IN') : '450'}
          </span>
        </div>
      </div>

      {/* Customer Information Card */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
              {activeJob.category || 'Service Request'}
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              {activeJob.serviceNeeded}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={`tel:${activeJob.customerPhone || '+919811234567'}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              title="Call Customer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Message Customer"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-600 flex flex-col gap-1.5 pt-2 border-t border-slate-200/60">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Customer Name:</span>
            <span className="font-bold text-slate-800">{activeJob.customerName}</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <span className="text-slate-500 shrink-0">Address:</span>
            <span className="font-medium text-slate-800 text-right flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 inline" />
              {activeJob.addressSnippet}
            </span>
          </div>

          {activeJob.instructions && (
            <div className="bg-amber-50/60 border border-amber-200/70 p-2.5 rounded-lg text-[11px] text-amber-900 mt-1">
              <span className="font-bold">Customer Note: </span>
              {activeJob.instructions}
            </div>
          )}
        </div>
      </div>

      {/* Map Location Placeholder Card */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
        {/* Stylized Mock Map Visual */}
        <div className="h-40 w-full bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-200 relative flex items-center justify-center p-4">
          {/* Mock Road Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#475569" strokeWidth="3" />
            <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#475569" strokeWidth="2" />
            <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#475569" strokeWidth="3" />
            {/* Route path */}
            <path d="M 40 110 Q 120 70 220 50 T 320 40" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
          </svg>

          {/* Worker location pin */}
          <div className="absolute left-8 bottom-6 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-blue-400/40 animate-pulse">
              <Navigation className="w-3.5 h-3.5 fill-white rotate-45" />
            </div>
            <span className="text-[10px] font-bold text-blue-900 bg-white/90 px-1.5 py-0.5 rounded shadow-xs mt-1">
              You
            </span>
          </div>

          {/* Customer destination pin */}
          <div className="absolute right-10 top-5 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-rose-400/40">
              <MapPin className="w-4 h-4 fill-white" />
            </div>
            <span className="text-[10px] font-bold text-rose-900 bg-white/90 px-1.5 py-0.5 rounded shadow-xs mt-1">
              Customer
            </span>
          </div>

          {/* ETA Floating Capsule */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs border border-slate-200/80 rounded-lg px-2.5 py-1 text-xs shadow-sm flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold text-slate-800">ETA: 8 mins</span>
            <span className="text-slate-400 font-normal">({activeJob.distance || '1.8 km'})</span>
          </div>
        </div>

        {/* Map Actions Footer */}
        <div className="bg-white p-2.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Sector 56 &bull; Fastest route via Golf Course Ext.</span>
          <button
            type="button"
            onClick={() => alert(`Opening GPS navigation to: ${activeJob.addressSnippet}`)}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            <span>Open in Maps</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Status Stepper Tracker */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Service Progress Stepper
          </span>
          <span className="text-xs font-bold text-blue-600">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step.id} className="flex flex-col gap-1.5">
                {/* Bar Segment */}
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-blue-600 animate-pulse'
                      : 'bg-slate-200'
                  }`}
                />
                {/* Step Label */}
                <span
                  className={`text-[11px] font-semibold truncate ${
                    isCompleted
                      ? 'text-emerald-700'
                      : isCurrent
                      ? 'text-blue-600'
                      : 'text-slate-400'
                  }`}
                  title={step.label}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current Step Status Description */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-950">
                Current Status: {STEPS[currentStepIndex].label}
              </div>
              <div className="text-[11px] text-blue-700">
                {STEPS[currentStepIndex].subtitle}
              </div>
            </div>
          </div>

          <span className="text-[11px] font-semibold bg-white border border-blue-200 px-2 py-0.5 rounded-md text-blue-700">
            Live
          </span>
        </div>

        {/* Prominent Action Button for Status Progression */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleNextStep}
            className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer ${
              currentStepIndex === STEPS.length - 1
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            {currentStepIndex === STEPS.length - 1 ? (
              <Sparkles className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>{stepButtonLabels[currentStepIndex]}</span>
          </button>

          {/* Secondary Actions: Emergency & Cancel */}
          <div className="flex items-center justify-between text-xs pt-2">
            <button
              type="button"
              onClick={() => setIsEmergencyOpen(!isEmergencyOpen)}
              className="text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Need help / Emergency</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to cancel this job?')) {
                  if (onCancelJob) onCancelJob(activeJob);
                }
              }}
              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Cancel Job
            </button>
          </div>

          {/* Emergency Helper Info Drawer */}
          {isEmergencyOpen && (
            <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col gap-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>KaryaSahyog Worker Helpline & Safety Desk</span>
              </div>
              <p className="text-[11px] text-amber-800">
                In case of emergency or customer dispute, call our 24x7 cooperative dispatch support:
              </p>
              <a
                href="tel:18001089900"
                className="font-bold text-blue-700 underline text-[11px]"
              >
                1800-108-9900 (Toll Free)
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

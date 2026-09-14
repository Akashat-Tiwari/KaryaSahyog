import { useState } from 'react';
import {
  MapPin,
  Clock,
  Check,
  X,
  AlertCircle,
  Briefcase,
  RotateCcw,
  Sparkles,
  Flame,
  Loader2,
} from 'lucide-react';
import { respondToJob } from '../../api/workerService';

const INITIAL_JOB_REQUESTS = [
  {
    id: 'JOB-101',
    customerName: 'Pooja Sharma',
    customerPhone: '+91 98112 34567',
    serviceNeeded: 'MCB Trip & Main Electrical Panel Repair',
    category: 'Emergency Electrical',
    distance: '1.8 km away',
    payout: 450,
    estimatedPayout: '₹450',
    postedTime: '4 mins ago',
    urgent: true,
    addressSnippet: 'House #42, Sector 56, Huda Colony, Gurugram',
    instructions: 'Power keeps tripping in the master bedroom and kitchen.',
  },
  {
    id: 'JOB-102',
    customerName: 'Amitabh Verma',
    customerPhone: '+91 98711 88990',
    serviceNeeded: 'Ceiling Fan & 3 Switchboards Installation',
    category: 'Home Fixtures',
    distance: '3.2 km away',
    payout: 850,
    estimatedPayout: '₹850',
    postedTime: '12 mins ago',
    urgent: false,
    addressSnippet: 'Flat 302, DLF Phase 4, Block B, Gurugram',
    instructions: 'New fan delivered, need mounting and new modular switchboard wiring.',
  },
  {
    id: 'JOB-103',
    customerName: 'Sneha Roy',
    customerPhone: '+91 99100 22334',
    serviceNeeded: 'Inverter Battery Backup Troubleshooting',
    category: 'Power Backup',
    distance: '4.5 km away',
    payout: 1200,
    estimatedPayout: '₹1,200',
    postedTime: '25 mins ago',
    urgent: false,
    addressSnippet: 'Villa 18, Sushant Lok 1, C-Block, Gurugram',
    instructions: 'Inverter making beeping alarm and not holding charge during power cuts.',
  },
  {
    id: 'JOB-104',
    customerName: 'Rohan Malhotra',
    customerPhone: '+91 98990 77112',
    serviceNeeded: 'Split AC Power Socket Replacement & Earthing Fix',
    category: 'Heavy Appliance Wiring',
    distance: '2.1 km away',
    payout: 600,
    estimatedPayout: '₹600',
    postedTime: '38 mins ago',
    urgent: true,
    addressSnippet: 'Apt 12B, Golf Course Road, Tower 6, Gurugram',
    instructions: 'Heavy sparking from 16A power socket when AC compressor kicks in.',
  },
];

export default function JobRequests({ onAcceptJob }) {
  const [requests, setRequests] = useState(INITIAL_JOB_REQUESTS);
  const [notification, setNotification] = useState(null);
  const [processingJobId, setProcessingJobId] = useState(null);

  const handleAccept = async (job) => {
    try {
      setProcessingJobId(job.id);
      // Call FastAPI backend: POST /worker/job-action
      const response = await respondToJob(job.id, 'worker_123', 'accept');

      // On successful API response, remove from local UI list
      setRequests((prev) => prev.filter((item) => item.id !== job.id));

      const confirmationMsg =
        response?.message || `Job accepted for ${job.customerName}! Customer has been notified.`;

      setNotification({
        type: 'success',
        message: confirmationMsg,
      });

      if (onAcceptJob) {
        onAcceptJob(job);
      }

      setTimeout(() => {
        setNotification(null);
      }, 4000);
    } catch (error) {
      console.error('[JobRequests] Error accepting job:', error);
      setNotification({
        type: 'error',
        message: `Failed to accept job: ${error.message || 'Network error'}`,
      });
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleReject = async (job) => {
    try {
      setProcessingJobId(job.id);
      // Call FastAPI backend: POST /worker/job-action
      const response = await respondToJob(job.id, 'worker_123', 'reject');

      // On successful API response, remove from local UI list
      setRequests((prev) => prev.filter((item) => item.id !== job.id));

      const confirmationMsg =
        response?.message || `Declined request from ${job.customerName}.`;

      setNotification({
        type: 'rejected',
        message: confirmationMsg,
      });

      setTimeout(() => {
        setNotification(null);
      }, 3500);
    } catch (error) {
      console.error('[JobRequests] Error rejecting job:', error);
      setNotification({
        type: 'error',
        message: `Failed to decline job: ${error.message || 'Network error'}`,
      });
    } finally {
      setProcessingJobId(null);
    }
  };

  const handleResetRequests = () => {
    setRequests(INITIAL_JOB_REQUESTS);
    setNotification({
      type: 'info',
      message: 'Refreshed incoming mock job requests.',
    });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Job Requests</h2>
            <p className="text-xs text-slate-500">Incoming nearby service inquiries</p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            {requests.length} Pending
          </span>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`text-xs p-3 rounded-xl flex items-center justify-between border transition-all animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : notification.type === 'rejected'
              ? 'bg-slate-100 text-slate-800 border-slate-200'
              : notification.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />}
            {notification.type === 'rejected' && <X className="w-4 h-4 text-slate-500 shrink-0" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {notification.type === 'info' && <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Job Cards List */}
      <div className="space-y-3.5">
        {requests.length > 0 ? (
          requests.map((job) => {
            const isProcessing = processingJobId === job.id;

            return (
              <div
                key={job.id}
                className="group border border-slate-200 rounded-xl p-4 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
              >
                {/* Top info row: Service and Urgency */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                      {job.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      {job.serviceNeeded}
                    </h3>
                  </div>

                  {job.urgent && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full shrink-0">
                      <Flame className="w-3 h-3 text-red-500" />
                      Urgent
                    </span>
                  )}
                </div>

                {/* Customer and Location details */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Customer: {job.customerName}</span>
                    <span className="text-[11px] font-normal text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {job.postedTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.addressSnippet}</span>
                    </span>
                    <span className="font-medium text-slate-700 shrink-0">{job.distance}</span>
                  </div>
                </div>

                {/* Payout & Action Buttons Row (Rupee ₹ Localization + Live API) */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                      Est. Payout
                    </div>
                    <div className="text-lg font-black text-emerald-600 flex items-baseline">
                      <span className="text-base font-bold mr-0.5">₹</span>
                      <span>{job.payout.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Buttons: Accept (Green) and Reject (Red/Gray) with API trigger */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleReject(job)}
                      className={`inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-700 border border-slate-200 hover:border-red-200 transition-colors shadow-xs active:scale-95 ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAccept(job)}
                      className={`inline-flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow transition-all active:scale-95 ${
                        isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                      <span>Accept</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">All requests handled!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              You are all caught up on new lead dispatches. Keep your availability switch active for incoming calls.
            </p>
            <button
              type="button"
              onClick={handleResetRequests}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Mock Requests</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

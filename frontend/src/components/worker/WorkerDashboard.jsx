import { useState, useRef, useEffect } from 'react';
import WorkerProfile from './WorkerProfile';
import JobRequests from './JobRequests';
import ActiveJobStatus from './ActiveJobStatus';
import EarningsHistory from './EarningsHistory';
import {
  Wrench,
  Bell,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Flame,
  HeartPulse,
  CreditCard,
  Building2,
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'High Demand in Your Area!',
    message: 'Surge payout bonus of ₹150 is active for next 2 hours in Sector 56 & DLF Phase 4.',
    time: '5m ago',
    unread: true,
    type: 'surge',
  },
  {
    id: 'notif-2',
    title: 'New Welfare Scheme Available',
    message: 'PM Shram Yogi Maandhan pension enrollment is now open through your KaryaSahyog portal.',
    time: '1h ago',
    unread: true,
    type: 'welfare',
  },
  {
    id: 'notif-3',
    title: 'Insurance Policy Renewed',
    message: 'Your ₹5,00,000 accidental & health cooperative cover has been renewed for 2026-27.',
    time: '1d ago',
    unread: false,
    type: 'insurance',
  },
  {
    id: 'notif-4',
    title: 'Weekly Payout Deposited',
    message: '₹3,450 successfully transferred to your registered UPI / Bank account.',
    time: '2d ago',
    unread: false,
    type: 'payment',
  },
];

export default function WorkerDashboard() {
  // Active ongoing job state (null means idle, receiving job requests)
  const [activeJob, setActiveJob] = useState(null);

  // Global toast banner
  const [toastMessage, setToastMessage] = useState(null);

  // Notification dropdown state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notificationsRef = useRef(null);

  // Earnings & Job History state to reflect completions in real-time
  const [todayEarnings, setTodayEarnings] = useState(2500);
  const [totalEarnings, setTotalEarnings] = useState(48500);
  const [recentJobs, setRecentJobs] = useState([
    {
      id: 'JOB-098',
      customerName: 'Meera Nambiar',
      service: 'Sub-meter & MCB Box Replacement',
      date: 'Today, 2:40 PM',
      amount: '₹850',
      amountNum: 850,
      status: 'Completed',
      paymentMode: 'UPI / Direct Deposit',
    },
    {
      id: 'JOB-097',
      customerName: 'Sunil Aggarwal',
      service: 'Emergency Generator Line Phase Correction',
      date: 'Today, 11:15 AM',
      amount: '₹1,200',
      amountNum: 1200,
      status: 'Completed',
      paymentMode: 'Cash collected',
    },
    {
      id: 'JOB-096',
      customerName: 'Kavita Patel',
      service: 'Exhaust Fan & Kitchen Switch Repair',
      date: 'Today, 9:00 AM',
      amount: '₹450',
      amountNum: 450,
      status: 'Completed',
      paymentMode: 'Online Transfer',
    },
    {
      id: 'JOB-095',
      customerName: 'Vikram Joshi',
      service: 'Commercial 3-Phase Wiring Diagnostic',
      date: 'Yesterday, 5:30 PM',
      amount: '₹0',
      amountNum: 0,
      status: 'Cancelled',
      paymentMode: 'Customer Rescheduled',
    },
    {
      id: 'JOB-094',
      customerName: 'Deepak Chawla',
      service: 'Balcony Waterproof Light Installation',
      date: 'Yesterday, 1:20 PM',
      amount: '₹650',
      amountNum: 650,
      status: 'Completed',
      paymentMode: 'Online Transfer',
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    }
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleDismissNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Called when worker accepts a job in JobRequests
  const handleAcceptJob = (job) => {
    setActiveJob(job);
    setToastMessage(`Job accepted! Active journey tracker started for ${job.customerName}.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Called when worker marks job completed in ActiveJobStatus
  const handleCompleteJob = (completedJob) => {
    const earnedAmount = completedJob.payout || 450;

    // Update earnings
    setTodayEarnings((prev) => prev + earnedAmount);
    setTotalEarnings((prev) => prev + earnedAmount);

    // Add to recent jobs list
    const newCompletedEntry = {
      id: completedJob.id || `JOB-${Date.now().toString().slice(-3)}`,
      customerName: completedJob.customerName,
      service: completedJob.serviceNeeded,
      date: 'Just now',
      amount: `₹${earnedAmount.toLocaleString('en-IN')}`,
      amountNum: earnedAmount,
      status: 'Completed',
      paymentMode: 'Direct UPI Settled',
    };

    setRecentJobs((prev) => [newCompletedEntry, ...prev]);

    // Reset active job back to idle
    setActiveJob(null);

    setToastMessage(
      `Job Completed! ₹${earnedAmount.toLocaleString('en-IN')} has been added to today's earnings.`
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Called when worker cancels active job
  const handleCancelJob = (cancelledJob) => {
    const newCancelledEntry = {
      id: cancelledJob.id || `JOB-${Date.now().toString().slice(-3)}`,
      customerName: cancelledJob.customerName,
      service: cancelledJob.serviceNeeded,
      date: 'Just now',
      amount: '₹0',
      amountNum: 0,
      status: 'Cancelled',
      paymentMode: 'Worker Cancelled',
    };

    setRecentJobs((prev) => [newCancelledEntry, ...prev]);
    setActiveJob(null);

    setToastMessage(`Job cancelled for ${cancelledJob.customerName}. Returned to lead reception.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Portal Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                    KaryaSahyog
                  </h1>
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-md">
                    Worker Portal
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Cooperative Service Partner Dashboard
                </p>
              </div>
            </div>

            {/* Quick Actions & Header Badges */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Fast Dispatch Engine Active</span>
              </div>

              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  aria-label="Toggle notifications"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative p-2 rounded-xl border transition-colors cursor-pointer ${
                    isNotificationsOpen
                      ? 'bg-blue-50 border-blue-200 text-blue-600'
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-fadeIn">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length > 0 ? (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3.5 hover:bg-slate-50 transition-colors flex items-start justify-between gap-2.5 ${
                              item.unread ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Notification Category Icon */}
                              <div className="mt-0.5 shrink-0">
                                {item.type === 'surge' && (
                                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                    <Flame className="w-4 h-4" />
                                  </div>
                                )}
                                {item.type === 'welfare' && (
                                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                    <HeartPulse className="w-4 h-4" />
                                  </div>
                                )}
                                {item.type === 'insurance' && (
                                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <Building2 className="w-4 h-4" />
                                  </div>
                                )}
                                {item.type === 'payment' && (
                                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                    <CreditCard className="w-4 h-4" />
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                    {item.title}
                                  </h4>
                                  {item.unread && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                  {item.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {item.time}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDismissNotif(item.id)}
                              className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0"
                              title="Dismiss"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-xs text-slate-400">
                          No notifications at the moment
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 pt-2 border-t border-slate-100 text-center">
                      <span className="text-[11px] text-slate-400">
                        KaryaSahyog Worker Dispatch Feed &bull; Live
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                title="Help & Support"
                onClick={() => alert('KaryaSahyog Worker Support Desk: Toll Free 1800-108-9900')}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Action Banner / Toast */}
      {toastMessage && (
        <div className="bg-blue-600 text-white px-4 py-2.5 text-center text-xs font-semibold shadow-inner flex items-center justify-center gap-2 transition-all animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Subheading */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Professional Workstation
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Review live nearby leads, track ongoing service journeys, and monitor earnings.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>KaryaSahyog Trust & Safety Guard Enabled</span>
          </div>
        </div>

        {/* Responsive 3-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column (1 span): Worker Profile & Welfare */}
          <section aria-label="Worker Profile" className="w-full">
            <WorkerProfile />
          </section>

          {/* Middle Column (1 span): Conditional Rendering (ActiveJobStatus vs JobRequests) */}
          <section aria-label="Job Flow" className="w-full">
            {activeJob ? (
              <ActiveJobStatus
                job={activeJob}
                onCompleteJob={handleCompleteJob}
                onCancelJob={handleCancelJob}
              />
            ) : (
              <JobRequests onAcceptJob={handleAcceptJob} />
            )}
          </section>

          {/* Right Column (1 span): Earnings & History */}
          <section aria-label="Earnings and Job History" className="w-full">
            <EarningsHistory
              jobs={recentJobs}
              todayEarnings={todayEarnings}
              totalEarnings={totalEarnings}
            />
          </section>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p className="flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>KaryaSahyog Cooperative Network • Verified Partner Portal</span>
        </p>
      </footer>
    </div>
  );
}

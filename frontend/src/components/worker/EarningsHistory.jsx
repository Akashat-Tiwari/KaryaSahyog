import { useState } from 'react';
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Wallet,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

const DEFAULT_RECENT_JOBS = [
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
];

export default function EarningsHistory({
  jobs = DEFAULT_RECENT_JOBS,
  todayEarnings = 2500,
  totalEarnings = 48500,
}) {
  const [filter, setFilter] = useState('All'); // 'All', 'Completed', 'Cancelled'

  const completedCount = jobs.filter((j) => j.status === 'Completed').length;

  const filteredJobs = jobs.filter((job) => {
    if (filter === 'Completed') return job.status === 'Completed';
    if (filter === 'Cancelled') return job.status === 'Cancelled';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col gap-6">
      {/* Module Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Earnings & History</h2>
            <p className="text-xs text-slate-500">Real-time revenue overview</p>
          </div>
        </div>

        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
          <ArrowUpRight className="w-3.5 h-3.5" />
          +14.2% this week
        </span>
      </div>

      {/* Summary Cards: Today's Earnings & Total Earnings (Rupee Localization) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Today's Earnings */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border border-emerald-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Today's Earnings
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
              ₹
            </div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline">
              <span className="text-xl font-bold mr-0.5 text-emerald-700">₹</span>
              <span>{todayEarnings.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-700 font-medium">
              <span>{completedCount} services completed</span>
            </div>
          </div>
        </div>

        {/* Total Earnings */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Total Earnings
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight flex items-baseline">
              <span className="text-xl font-bold mr-0.5 text-blue-700">₹</span>
              <span>{totalEarnings.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-blue-700 font-medium">
              <span>Next payout: Friday (Direct UPI)</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Recent Jobs Section */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Jobs</h3>
            <span className="text-xs text-slate-400 font-normal">({filteredJobs.length})</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
            {['All', 'Completed', 'Cancelled'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filter === item
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* List of Recent Jobs */}
        <div className="space-y-2.5">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-between gap-3"
              >
                {/* Left: Status Icon & Details */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {job.status === 'Completed' ? (
                      <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-rose-100/80 text-rose-600 flex items-center justify-center">
                        <XCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {job.service}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-medium text-slate-700">{job.customerName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {job.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Status Badge (Rupee ₹) */}
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span
                    className={`text-xs font-black ${
                      job.status === 'Completed' ? 'text-slate-900' : 'text-slate-400 line-through'
                    }`}
                  >
                    {job.amount}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      job.status === 'Completed'
                        ? 'bg-emerald-100/80 text-emerald-800'
                        : 'bg-rose-100/80 text-rose-700'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <p className="text-xs text-slate-500">No jobs found under "{filter}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

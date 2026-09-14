import { useState } from 'react';
import AdminStats from './AdminStats';
import AdminCharts from './AdminCharts';
import WorkerVerification from './WorkerVerification';
import BookingManagement from './BookingManagement';
import {
  LayoutDashboard,
  CheckCircle2,
  Users,
  Calendar,
  Layers,
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'verification', 'bookings'

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Portal Branding */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-gray-900 tracking-tight">
                    KaryaSahyog
                  </h1>
                  <span className="text-[11px] font-semibold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                    Admin Console
                  </span>
                </div>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Cooperative Federation Operations & Analytics Engine
                </p>
              </div>
            </div>

            {/* Header Right: Cluster Status & Profile Badge */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* System Health Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>FastAPI Engine &bull; Normal</span>
              </div>

              {/* Admin Profile Badge */}
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 text-gray-700 font-bold flex items-center justify-center text-xs">
                  AD
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-gray-900 leading-tight">Admin Console</div>
                  <div className="text-[10px] text-gray-500">Federation Lead</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Overview Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Executive Management Overview
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Live monitoring of cooperative workers, customer demand velocity, and algorithmic dispatches.
            </p>
          </div>

          {/* Clean Segmented Tab Switcher */}
          <div className="flex items-center gap-1 self-start sm:self-auto bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Suite</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'verification'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>KYC Desk</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Bookings</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: Top KPI Cards */}
        <section aria-label="Key Performance Indicators">
          <AdminStats />
        </section>

        {/* SECTION 2: Analytics & Recharts Data Visualizations */}
        {(activeTab === 'all' || activeTab === 'analytics') && (
          <section aria-label="Analytics and Charts">
            <AdminCharts />
          </section>
        )}

        {/* SECTION 3: Operations Tables */}
        <section aria-label="Operations Management" className="space-y-8">
          {/* Worker Verification Table */}
          {(activeTab === 'all' || activeTab === 'verification') && (
            <div>
              <WorkerVerification />
            </div>
          )}

          {/* Booking Dispatch Table */}
          {(activeTab === 'all' || activeTab === 'bookings') && (
            <div>
              <BookingManagement />
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        <p className="flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>KaryaSahyog Cooperative Federation &bull; SIH 2026 Operational Command &bull; Currency: ₹ (INR)</span>
        </p>
      </footer>
    </div>
  );
}

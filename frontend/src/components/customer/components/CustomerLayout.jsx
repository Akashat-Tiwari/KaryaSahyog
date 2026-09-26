import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, Wrench, Calendar, Bell, User, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCustomerNotifications, syncCustomerNotifications } from '../../../api/customerService';

export default function CustomerLayout({ children, title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState(() => getCustomerNotifications());

  useEffect(() => {
    syncCustomerNotifications().then(setNotifications).catch(() => {});
  }, [location.pathname]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const navItems = [
    { path: '/customer/dashboard', label: 'Home', icon: Home },
    { path: '/customer/services', label: 'Services', icon: Wrench },
    { path: '/customer/history', label: 'Bookings', icon: Calendar },
    { path: '/customer/notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
    { path: '/customer/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans pb-20 sm:pb-0">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Title / Back or Logo */}
            <div className="flex items-center gap-3">
              {title ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
                    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                  </div>
                </>
              ) : (
                <Link to="/customer/dashboard" className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-base font-extrabold text-slate-900 tracking-tight">KaryaSahyog</span>
                    <span className="text-[11px] block text-slate-500 font-medium">Customer Portal</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Desktop Navigation & Header Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <nav className="hidden sm:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {Boolean(item.badge) && (
                        <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <Link
                to="/customer/notifications"
                className="relative p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors sm:hidden"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {Boolean(item.badge) && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center px-0.5">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

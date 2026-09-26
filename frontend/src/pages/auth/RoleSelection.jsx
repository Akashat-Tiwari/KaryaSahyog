import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Check, User, ShieldCheck } from 'lucide-react';
import AuthShell from '../../components/shared/AuthShell';
import { setStoredRole } from '../../api/customerService';

const ROLES = [
  {
    id: 'customer',
    title: 'Customer',
    description: 'Find trusted workers and book services near you.',
    points: ['Book services', 'Find workers', 'Manage bookings'],
    button: 'Continue as Customer',
    icon: User,
  },
  {
    id: 'worker',
    title: 'Worker',
    description: 'Offer your services and connect with customers.',
    points: ['Offer services', 'Manage bookings', 'Manage availability'],
    button: 'Continue as Worker',
    icon: Briefcase,
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Manage workers, view statistics, and monitor bookings.',
    points: ['Verify workers', 'Manage bookings', 'View analytics'],
    button: 'Continue as Admin',
    icon: ShieldCheck,
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [selected, setSelected] = useState(null);

  const continueWith = (roleId, activeMode = mode) => {
    setStoredRole(roleId);
    if (activeMode === 'register') {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  return (
    <AuthShell title="Welcome to Karya Sahyog" subtitle="Choose your mode and role to get started">
      {/* Mode Selector: Login vs Create Account */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 border border-slate-200">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            mode === 'login'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            mode === 'register'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Create Account
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selected === role.id;
          return (
            <div
              key={role.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(role.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setSelected(role.id);
              }}
              className={`rounded-2xl border-2 p-5 text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-lg font-bold text-slate-900">{role.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{role.description}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {role.points.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelected(role.id);
                  continueWith(role.id);
                }}
                className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {mode === 'register' ? `Register as ${role.title}` : role.button}
              </button>
            </div>
          );
        })}
      </div>
    </AuthShell>
  );
}

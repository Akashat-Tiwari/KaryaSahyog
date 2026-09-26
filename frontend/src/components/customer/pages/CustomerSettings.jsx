import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { logoutCustomer } from '../../../api/customerService';

const SECTIONS = [
  { title: 'Account', text: 'Name, email, phone, and address are managed from your profile.' },
  { title: 'Notifications', text: 'Booking, tracking, payment, and review reminders stay on in this prototype.' },
  { title: 'Location', text: 'Saved address is used as a starting point when you book a service.' },
  { title: 'Privacy / Security', text: 'Session details stay on this device. Sign out to clear your local account session.' },
];

export default function CustomerSettings() {
  const navigate = useNavigate();

  const logout = () => {
    logoutCustomer();
    navigate('/role-selection');
  };

  return (
    <CustomerLayout title="Settings">
      <div className="max-w-xl space-y-3">
        {SECTIONS.map((section) => (
          <div key={section.title} className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900">{section.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{section.text}</p>
          </div>
        ))}
        <button
          type="button"
          onClick={logout}
          className="w-full rounded-xl border border-rose-200 bg-rose-50 text-rose-700 py-3 text-sm font-semibold hover:bg-rose-100"
        >
          Logout
        </button>
      </div>
    </CustomerLayout>
  );
}

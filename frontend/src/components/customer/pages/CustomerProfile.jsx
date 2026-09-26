import { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { getCurrentUser, updateCurrentUser } from '../../../api/customerService';

export default function CustomerProfile() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [saved, setSaved] = useState(false);

  const save = (event) => {
    event.preventDefault();
    setUser(updateCurrentUser(user));
    setSaved(true);
  };

  return (
    <CustomerLayout title="Profile" subtitle="Your account details for bookings and contact.">
      <form onSubmit={save} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 max-w-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl font-bold overflow-hidden">
            {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : (user.name || 'C').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user.name || 'Customer account'}</p>
            <p className="text-sm text-slate-500">{user.email || 'No email saved'}</p>
          </div>
        </div>
        <Field label="Name" value={user.name} onChange={(name) => setUser({ ...user, name })} />
        <Field label="Email" type="email" value={user.email} onChange={(email) => setUser({ ...user, email })} />
        <Field label="Phone" value={user.phone} onChange={(phone) => setUser({ ...user, phone })} />
        <Field label="Address" value={user.address} onChange={(address) => setUser({ ...user, address })} />
        <Field label="Profile image URL" value={user.avatar} onChange={(avatar) => setUser({ ...user, avatar })} />
        <div>
          <p className="text-sm font-medium text-slate-700">Account</p>
          <p className="text-sm text-slate-500 mt-1">Role: {user.role || 'customer'}</p>
        </div>
        {saved && <p className="text-sm text-emerald-700">Profile saved.</p>}
        <button type="submit" className="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-blue-700">
          Save changes
        </button>
        <Link to="/customer/settings" className="block text-sm font-semibold text-blue-700">Open settings</Link>
      </form>
    </CustomerLayout>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  const id = label.toLowerCase();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        id={id}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

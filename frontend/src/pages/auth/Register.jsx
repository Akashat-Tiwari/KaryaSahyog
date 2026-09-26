import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/shared/AuthShell';
import { registerWithApi } from '../../api/authService';
import { getStoredRole, persistAuthSession, setStoredRole } from '../../api/customerService';

export default function Register() {
  const navigate = useNavigate();
  const [role] = useState(getStoredRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredRole();
    if (!stored) {
      navigate('/role-selection', { replace: true });
    }
  }, [navigate]);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await registerWithApi({ fullName, email, phone, role });
      const resolvedRole = ['worker', 'customer', 'admin'].includes(result.role) ? result.role : role;
      setStoredRole(resolvedRole);
      persistAuthSession(
        {
          id: result.id,
          name: result.full_name || fullName,
          email: result.email || email,
          phone,
          address: '',
          avatar: '',
          role: resolvedRole,
        },
        result.token
      );
      if (resolvedRole === 'worker') {
        navigate('/worker/dashboard');
      } else if (resolvedRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;
  const roleLabel = role === 'worker' ? 'Worker' : role === 'admin' ? 'Admin' : 'Customer';

  return (
    <AuthShell
      title={`Create ${roleLabel} Account`}
      subtitle="A few details to get you started"
      footer={
        <p className="text-center text-sm text-slate-500 mt-4">
          <Link to="/role-selection" className="font-semibold text-blue-700 hover:text-blue-800">
            Change role
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleRegister}>
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700">Full name</label>
          <input id="reg-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700">Email</label>
          <input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="reg-phone" className="block text-sm font-medium text-slate-700">Phone</label>
          <input id="reg-phone" required value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+91" />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 cursor-pointer">
          {loading ? 'Creating account…' : `Create ${roleLabel} Account`}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-700">
          Continue as {roleLabel}
        </Link>
      </p>
    </AuthShell>
  );
}

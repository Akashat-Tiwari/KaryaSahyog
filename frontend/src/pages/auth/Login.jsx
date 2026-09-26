import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../../components/shared/AuthShell';
import { loginWithApi } from '../../api/authService';
import { getStoredRole, persistAuthSession, setStoredRole } from '../../api/customerService';
import { Eye, EyeOff } from 'lucide-react';
import FormInput from '../../components/shared/FormInput';

export default function Login() {
  const navigate = useNavigate();
  const [role] = useState(getStoredRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const stored = getStoredRole();
    if (!stored) {
      navigate('/role-selection', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await loginWithApi({ email, password, role });
      const resolvedRole = ['worker', 'customer', 'admin'].includes(result.role) ? result.role : role;
      setStoredRole(resolvedRole);
      persistAuthSession(
        {
          id: result.id,
          name: result.full_name || '',
          email: result.email || email,
          phone: '',
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
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;

  const roleLabel = role === 'worker' ? 'Worker' : role === 'admin' ? 'Admin' : 'Customer';

  return (
    <AuthShell
      title={`Continue as ${roleLabel}`}
      subtitle="Sign in to your Karya Sahyog account"
      footer={
        <p className="text-center text-sm text-slate-500 mt-4">
          <Link to="/role-selection" className="font-semibold text-blue-700 hover:text-blue-800">
            Change role
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleLogin}>
        <FormInput
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
        />
        <FormInput
          id="login-password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          endAdornment={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-slate-700 focus:outline-none">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Signing in…' : `Continue as ${roleLabel}`}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">
        New here?{' '}
        <Link to="/register" className="font-semibold text-blue-700">
          Create {roleLabel} Account
        </Link>
      </p>
    </AuthShell>
  );
}

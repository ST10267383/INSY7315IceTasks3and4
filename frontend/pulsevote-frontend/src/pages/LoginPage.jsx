import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { isValidEmail, isStrongPassword } from '../utils/validators';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    const { email, password } = form;

    // ----- Basic checks before calling API -----
    if (!email || !password) {
      setMsg({ type: 'error', text: 'Email and password are required.' });
      return;
    }
    if (!isValidEmail(email)) {
      setMsg({ type: 'error', text: 'Invalid email format.' });
      return;
    }
    // Optional but recommended: enforce strength on login too
    if (!isStrongPassword(password)) {
      setMsg({
        type: 'error',
        text: 'Password must be at least 8 characters and include letters and numbers.',
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      const token = data?.token || data?.jwt;
      if (!token) throw new Error('No token in response');

      localStorage.setItem('token', token);
      if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));

      setMsg({ type: 'success', text: 'Logged in! Redirecting…' });
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      const text =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Login failed';
      setMsg({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h3>Login</h3>
      <form onSubmit={submit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          autoComplete="email"
          required
          disabled={loading}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          autoComplete="current-password"
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>
      </form>

      {msg.text && (
        <p style={{ marginTop: 10, color: msg.type === 'success' ? '#8ab4f8' : 'crimson' }}>
          {msg.text}
        </p>
      )}

      <p style={{ marginTop: 12 }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
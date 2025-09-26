import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { isValidEmail, isStrongPassword } from '../utils/validators';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    const { name, email, password } = form;

    // ----- Basic checks before calling API -----
    if (!name || !email || !password) {
      setMsg({ type: 'error', text: 'Name, email and password are required.' });
      return;
    }
    if (!isValidEmail(email)) {
      setMsg({ type: 'error', text: 'Invalid email format.' });
      return;
    }
    if (!isStrongPassword(password)) {
      setMsg({
        type: 'error',
        text: 'Password must be at least 8 characters and include letters and numbers.',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/register-user', form);
      setMsg({ type: 'success', text: 'Registered successfully. Redirecting to login…' });
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      const text =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Registration failed';
      setMsg({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h3>Register</h3>
      <form onSubmit={submit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={onChange}
          autoComplete="name"
          required
          disabled={loading}
        />
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
          autoComplete="new-password"
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>

      {msg.text && (
        <p style={{ marginTop: 10, color: msg.type === 'success' ? '#8ab4f8' : 'crimson' }}>
          {msg.text}
        </p>
      )}

      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

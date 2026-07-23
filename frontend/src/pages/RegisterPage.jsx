import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, LogIn, Terminal, AlertCircle } from 'lucide-react';

const RegisterPage = ({ onSwitchToLogin }) => {
  const { register, error } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !email.trim() || !password) {
      setLocalError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const res = await register(username, email, password);
    setSubmitting(false);
    if (!res.success) {
      setLocalError(res.error);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="retro-card retro-card-pink" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Terminal size={40} color="#ff007f" style={{ marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.1rem', color: 'var(--neon-pink)' }}>REGISTER_NEW_USER</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Create an account to manage retro tasks
          </p>
        </div>

        {(localError || error) && (
          <div style={{ background: 'rgba(255, 51, 102, 0.2)', border: '1px solid var(--neon-red)', color: 'var(--neon-red)', padding: '0.6rem', marginBottom: '1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="retro-label" style={{ color: 'var(--neon-pink)' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. retro_coder"
              className="retro-input"
              required
            />
          </div>

          <div>
            <label className="retro-label" style={{ color: 'var(--neon-pink)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="retro-input"
              required
            />
          </div>

          <div>
            <label className="retro-label" style={{ color: 'var(--neon-pink)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters..."
              className="retro-input"
              required
            />
          </div>

          <div>
            <label className="retro-label" style={{ color: 'var(--neon-pink)' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password..."
              className="retro-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="retro-btn retro-btn-pink"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <UserPlus size={16} /> {submitting ? 'REGISTERING...' : 'REGISTER_ACCOUNT'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px dashed var(--neon-pink-dark)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Already have an account?
          </p>
          <button onClick={onSwitchToLogin} className="retro-btn retro-btn-sm">
            <LogIn size={14} /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

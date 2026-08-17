import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Terminal, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

const LoginPage = ({ onSwitchToRegister }) => {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const isExpired = window.location.search.includes('expired=1');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!username.trim() || !password) {
      setLocalError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    const res = await login(username, password);
    setSubmitting(false);
    if (!res.success) {
      setLocalError(res.error);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="retro-card" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Terminal size={40} color="#00f3ff" style={{ marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '1.1rem' }}>SYSTEM_AUTHENTICATION</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Enter credentials to access Retro Task Manager
          </p>
        </div>

        {isExpired && (
          <div style={{ background: 'rgba(255, 183, 0, 0.15)', border: '1px solid var(--neon-amber)', color: 'var(--neon-amber)', padding: '0.6rem', marginBottom: '1rem', fontSize: '0.8rem', textAlign: 'center' }}>
            ⚠️ Session expired. Please log in again.
          </div>
        )}

        {(localError || error) && (
          <div style={{ background: 'rgba(255, 51, 102, 0.2)', border: '1px solid var(--neon-red)', color: 'var(--neon-red)', padding: '0.6rem', marginBottom: '1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="retro-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. cyber_pilot"
              className="retro-input"
              required
            />
          </div>

          <div>
            <label className="retro-label">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="retro-input"
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--neon-cyan)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="retro-btn retro-btn-green"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            <LogIn size={16} /> {submitting ? 'AUTHENTICATING...' : 'LOGIN_SYS'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px dashed var(--neon-cyan-dark)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            New user to the grid?
          </p>
          <button onClick={onSwitchToRegister} className="retro-btn retro-btn-pink retro-btn-sm">
            <UserPlus size={14} /> Register New Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

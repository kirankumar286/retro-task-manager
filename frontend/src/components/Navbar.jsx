import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Terminal, User, ShieldCheck } from 'lucide-react';
import XPBar from './XPBar';

const Navbar = () => {
  const { user, profile, logout } = useAuth();

  return (
    <header className="retro-card" style={{ borderRadius: 0, marginBottom: '2rem', padding: '1rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Terminal color="#00f3ff" size={28} />
          <div>
            <h1 style={{ fontSize: '1.2rem', margin: 0 }}>⚡ Tasky 👾</h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--neon-green)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
              <ShieldCheck size={14} /> SYS_STATUS: ONLINE
            </div>
          </div>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <XPBar profile={profile} />

            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('navigate-to-settings'));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#0a0b10',
                padding: '0.4rem 0.8rem',
                border: '1px solid var(--neon-cyan-dark)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                e.currentTarget.style.boxShadow = '0 0 5px var(--neon-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--neon-cyan-dark)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="Open System Settings"
            >
              <User size={16} color="#ff007f" />
              <span style={{ fontSize: '0.85rem', color: 'var(--neon-cyan)' }}>{user.username}</span>
            </button>

            <button 
              onClick={logout} 
              className="retro-btn retro-btn-red retro-btn-sm"
              title="Logout from system"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

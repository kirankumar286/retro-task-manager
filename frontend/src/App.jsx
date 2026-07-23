import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import CRTOverlay from './components/CRTOverlay';
import ParticleTrail from './components/ParticleTrail';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { Gamepad2 } from 'lucide-react';

const MainContent = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-cyan)' }}>
        <div style={{ textAlign: 'center' }}>
          <Gamepad2 size={48} className="crt-glow" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1rem' }}>INITIALIZING_SYSTEM...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        {authView === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
        )}
      </>
    );
  }

  return (
    <>
      <Navbar />
      <DashboardPage />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="crt-container crt-glow">
        <CRTOverlay />
        <ParticleTrail />
        <MainContent />
      </div>
    </AuthProvider>
  );
}

export default App;

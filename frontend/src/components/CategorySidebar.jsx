import React from 'react';
import { Folder, Star, Calendar, AlertTriangle, Sparkles, Inbox } from 'lucide-react';

const CategorySidebar = ({
  selectedCategory,
  onSelectCategory,
  selectedSmartFilter,
  onSelectSmartFilter,
  approvalsCount,
  selectedApprovals,
  onSelectApprovals,
  selectedAchievements,
  onSelectAchievements,
  isOpen,
  onClose
}) => {
  const categories = [
    { key: 'all', label: 'ALL TASKS', icon: '◉' },
    { key: 'work', label: 'WORK', icon: '💼' },
    { key: 'personal', label: 'PERSONAL', icon: '👤' },
    { key: 'groceries', label: 'GROCERIES', icon: '🛒' },
    { key: 'errands', label: 'ERRANDS', icon: '🏃' },
    { key: 'study', label: 'STUDY', icon: '📚' },
    { key: 'health', label: 'HEALTH', icon: '❤️' },
    { key: 'finance', label: 'FINANCE', icon: '💰' },
    { key: 'home', label: 'HOME', icon: '🏠' },
    { key: 'other', label: 'OTHER', icon: '📦' },
  ];

  const smartFilters = [
    { key: 'important', label: 'IMPORTANT', icon: <Star size={14} color="var(--neon-pink)" /> },
    { key: 'due_today', label: 'DUE TODAY', icon: <Calendar size={14} color="var(--neon-cyan)" /> },
    { key: 'overdue', label: 'OVERDUE', icon: <AlertTriangle size={14} color="var(--neon-red)" /> },
  ];

  const handleCategoryClick = (key) => {
    onSelectCategory(key);
    if (onClose) onClose();
  };

  const handleSmartFilterClick = (key) => {
    onSelectSmartFilter(key);
    if (onClose) onClose();
  };

  const handleApprovalsClick = () => {
    onSelectApprovals();
    if (onClose) onClose();
  };

  const handleAchievementsClick = () => {
    onSelectAchievements();
    if (onClose) onClose();
  };

  const sidebarContent = (
    <div className="retro-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Category List */}
      <div>
        <h2 style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', borderBottom: '2px solid var(--neon-cyan-dark)', paddingBottom: '0.4rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Folder size={16} /> 📂 CATEGORIES
        </h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {categories.map((cat) => {
            const isActive = !selectedApprovals && !selectedSmartFilter && selectedCategory === cat.key;
            return (
              <li key={cat.key}>
                <button
                  onClick={() => handleCategoryClick(cat.key)}
                  className={`retro-sidebar-btn ${isActive ? 'active' : ''}`}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: '0.5rem 0.75rem',
                    color: isActive ? 'var(--neon-cyan)' : 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '2px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{cat.icon}</span>
                  <span style={{ textTransform: 'uppercase' }}>{cat.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ borderTop: '1px dashed var(--neon-cyan-dark)', margin: '0.2rem 0' }}></div>

      {/* Smart Filters */}
      <div>
        <h2 style={{ fontSize: '0.8rem', color: 'var(--neon-pink)', borderBottom: '2px solid var(--neon-pink-dark)', paddingBottom: '0.4rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Star size={16} /> ⭐ SMART VIEWS
        </h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          {smartFilters.map((sf) => {
            const isActive = !selectedApprovals && selectedSmartFilter === sf.key;
            return (
              <li key={sf.key}>
                <button
                  onClick={() => handleSmartFilterClick(sf.key)}
                  className={`retro-sidebar-btn ${isActive ? 'active-pink' : ''}`}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: '0.5rem 0.75rem',
                    color: isActive ? 'var(--neon-pink)' : 'var(--text-main)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    borderRadius: '2px',
                    transition: 'all 0.15s'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', width: '20px', justifyContent: 'center' }}>{sf.icon}</span>
                  <span style={{ textTransform: 'uppercase' }}>{sf.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ borderTop: '1px dashed var(--neon-cyan-dark)', margin: '0.2rem 0' }}></div>

      {/* AI Controls */}
      <div>
        <h2 style={{ fontSize: '0.8rem', color: 'var(--neon-pink)', borderBottom: '2px solid var(--neon-pink-dark)', paddingBottom: '0.4rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} /> 👾 AI COMMAND
        </h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <li>
            <button
              onClick={handleApprovalsClick}
              className={`retro-sidebar-btn ${selectedApprovals ? 'active-pink' : ''}`}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '0.5rem 0.75rem',
                color: selectedApprovals ? 'var(--neon-pink)' : 'var(--text-main)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '2px',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Inbox size={14} color="var(--neon-pink)" />
                <span>APPROVALS</span>
              </div>
              {approvalsCount > 0 && (
                <span className="retro-badge" style={{
                  color: 'var(--neon-pink)',
                  borderColor: 'var(--neon-pink)',
                  backgroundColor: 'rgba(255, 0, 127, 0.15)',
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.4rem',
                  marginLeft: '0.5rem',
                  fontWeight: 'bold',
                  boxShadow: 'none'
                }}>
                  {approvalsCount}
                </span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={handleAchievementsClick}
              className={`retro-sidebar-btn ${selectedAchievements ? 'active-amber' : ''}`}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '0.5rem 0.75rem',
                color: selectedAchievements ? 'var(--neon-amber)' : 'var(--text-main)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderRadius: '2px',
                transition: 'all 0.15s'
              }}
            >
              <span>🏆</span> ACHIEVEMENTS
            </button>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar-desktop" style={{ width: '220px', flexShrink: 0 }}>
        {sidebarContent}
      </div>

      {/* Mobile Drawer (Collapsible) */}
      {isOpen && (
        <div
          className="retro-modal-backdrop"
          onClick={onClose}
          style={{ justifyContent: 'flex-start', padding: 0 }}
        >
          <div
            className="retro-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '260px',
              height: '100vh',
              borderRadius: 0,
              borderRight: '4px solid var(--neon-cyan)',
              borderTop: 'none',
              borderBottom: 'none',
              borderLeft: 'none',
              padding: '1.5rem',
              backgroundColor: 'var(--bg-dark)',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button onClick={onClose} className="retro-btn retro-btn-sm" style={{ width: 'auto' }}>
                [ CLOSE ]
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default CategorySidebar;

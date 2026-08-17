import React, { useState } from 'react';
import { Folder, Star, Calendar, AlertTriangle, Sparkles, Inbox, Plus, Pin, Trash2, X } from 'lucide-react';

const CategorySidebar = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedSmartFilter,
  onSelectSmartFilter,
  approvalsCount,
  selectedApprovals,
  onSelectApprovals,
  selectedAchievements,
  onSelectAchievements,
  onAddCategory,
  onDeleteCategory,
  onTogglePinCategory,
  isOpen,
  onClose
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('💼');

  const smartFilters = [
    { key: 'important', label: 'IMPORTANT', icon: <Star size={14} color="var(--neon-pink)" /> },
    { key: 'due_today', label: 'DUE TODAY', icon: <Calendar size={14} color="var(--neon-cyan)" /> },
    { key: 'overdue', label: 'OVERDUE', icon: <AlertTriangle size={14} color="var(--neon-red)" /> },
  ];

  const emojis = ['💼', '👤', '🛒', '📚', '❤️', '💰', '🏠', '📦', '🎮', '🚀', '💪', '🔥', '🎯', '👾', '🎨', '✈️'];

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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const success = await onAddCategory(newCatName.trim(), newCatIcon);
    if (success) {
      setNewCatName('');
      setShowAddForm(false);
    }
  };

  const sidebarContent = (
    <div className="retro-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Category List */}
      <div>
        <h2 style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', borderBottom: '2px solid var(--neon-cyan-dark)', paddingBottom: '0.4rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Folder size={16} /> 📂 CATEGORIES
        </h2>
        
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: 0, margin: 0 }}>
          {/* ALL TASKS Option */}
          <li>
            <button
              onClick={() => handleCategoryClick('all')}
              className={`retro-sidebar-btn ${!selectedApprovals && !selectedAchievements && !selectedSmartFilter && selectedCategory === 'all' ? 'active' : ''}`}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                padding: '0.5rem 0.75rem',
                color: !selectedApprovals && !selectedAchievements && !selectedSmartFilter && selectedCategory === 'all' ? 'var(--neon-cyan)' : 'var(--text-main)',
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
              <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>◉</span>
              <span>ALL TASKS</span>
            </button>
          </li>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isActive = !selectedApprovals && !selectedAchievements && !selectedSmartFilter && selectedCategory === cat.key;
            return (
              <li key={cat.id} className="category-item-row" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <button
                    onClick={() => handleCategoryClick(cat.key)}
                    className={`retro-sidebar-btn ${isActive ? 'active' : ''}`}
                    style={{
                      flex: 1,
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
                    <span style={{ textTransform: 'uppercase', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '110px' }}>{cat.name}</span>
                  </button>

                  {/* Actions (Pin & Delete) */}
                  <div className="category-actions" style={{ display: 'flex', gap: '0.2rem', paddingRight: '0.5rem', zIndex: 5 }}>
                    <button
                      type="button"
                      onClick={() => onTogglePinCategory(cat.id, !cat.is_pinned)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: cat.is_pinned ? 'var(--neon-amber)' : '#555' }}
                      title={cat.is_pinned ? 'Unpin category' : 'Pin category'}
                    >
                      <Pin size={12} style={{ transform: cat.is_pinned ? 'none' : 'rotate(45deg)' }} />
                    </button>
                    {cat.key !== 'other' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#555' }}
                        className="hover-red"
                        title="Delete category"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Add Category Form Toggle */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="retro-btn retro-btn-sm"
            style={{ width: '100%', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
          >
            <Plus size={12} /> ADD CATEGORY
          </button>
        ) : (
          <form onSubmit={handleAddSubmit} style={{ marginTop: '0.75rem', padding: '0.5rem', border: '1px dashed var(--neon-cyan-dark)', backgroundColor: '#05070e' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category Name"
                className="retro-input"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                required
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Icon:</span>
              <select
                value={newCatIcon}
                onChange={(e) => setNewCatIcon(e.target.value)}
                className="retro-select"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', flex: 1 }}
              >
                {emojis.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="retro-btn retro-btn-green retro-btn-sm" style={{ padding: '0.25rem', fontSize: '0.7rem' }}>
                SAVE
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="retro-btn retro-btn-red retro-btn-sm" style={{ padding: '0.25rem', fontSize: '0.7rem' }}>
                <X size={10} />
              </button>
            </div>
          </form>
        )}
      </div>

      <div style={{ borderTop: '1px dashed var(--neon-cyan-dark)', margin: '0.2rem 0' }}></div>

      {/* Smart Filters */}
      <div>
        <h2 style={{ fontSize: '0.8rem', color: 'var(--neon-pink)', borderBottom: '2px solid var(--neon-pink-dark)', paddingBottom: '0.4rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Star size={16} /> ⭐ SMART VIEWS
        </h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: 0, margin: 0 }}>
          {smartFilters.map((sf) => {
            const isActive = !selectedApprovals && !selectedAchievements && selectedSmartFilter === sf.key;
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
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: 0, margin: 0 }}>
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

      <style>{`
        .category-item-row:hover .hover-red {
          color: var(--neon-red) !important;
        }
        .category-actions button:hover {
          transform: scale(1.15);
        }
      `}</style>
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

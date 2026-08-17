import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import FilterBar from '../components/FilterBar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import CategorySidebar from '../components/CategorySidebar';
import AIAssistant from '../components/AIAssistant';
import ApprovalQueue from '../components/ApprovalQueue';
import AchievementsView from '../components/AchievementsView';
import SettingsView from '../components/SettingsView';
import { Gamepad2, AlertCircle, Sparkles, Menu } from 'lucide-react';
import confetti from 'canvas-confetti';

const DashboardPage = () => {
  const { profile, fetchProfile } = useAuth();
  const [levelUpLevel, setLevelUpLevel] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    ordering: '-created_at',
    due_after: '',
    due_before: '',
    category: 'all',
    smartFilter: '',
  });

  // Modal & Sidebar States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [approvalsActive, setApprovalsActive] = useState(false);
  const [achievementsActive, setAchievementsActive] = useState(false);
  const [approvals, setApprovals] = useState([]);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [settingsActive, setSettingsActive] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/api/categories/');
      const data = response.data.results || response.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  const handleAddCategory = async (name, icon) => {
    try {
      await api.post('/api/categories/', { name, icon });
      await fetchCategories();
      return true;
    } catch (err) {
      console.error('Failed to add category', err);
      alert('Error creating category. Make sure it has a unique name.');
      return false;
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/api/categories/${id}/`);
      setFilters(prev => prev.category === 'all' ? prev : { ...prev, category: 'all' });
      await fetchCategories();
      await fetchTasks();
    } catch (err) {
      console.error('Failed to delete category', err);
      alert('Error deleting category.');
    }
  };

  const handleTogglePinCategory = async (id, isPinned) => {
    try {
      await api.patch(`/api/categories/${id}/`, { is_pinned: isPinned });
      await fetchCategories();
    } catch (err) {
      console.error('Failed to toggle pin category', err);
      alert('Error pinning category.');
    }
  };

  // Fetch Tasks with query params
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.ordering) params.append('ordering', filters.ordering);
      if (filters.due_after) params.append('due_after', filters.due_after);
      if (filters.due_before) params.append('due_before', filters.due_before);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.smartFilter) params.append(filters.smartFilter, 'true');

      const response = await api.get(`/api/tasks/?${params.toString()}`);
      const data = response.data.results || response.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load tasks from backend API.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchProposals = useCallback(async () => {
    try {
      const response = await api.get('/api/ai/proposals/');
      const data = response.data.results || response.data;
      setApprovals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load proposals', err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300); // debounce search query
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  useEffect(() => {
    fetchProposals();
    fetchCategories();
  }, [fetchProposals, fetchCategories]);

  useEffect(() => {
    const handleNavSettings = () => {
      handleSelectSettings();
    };
    window.addEventListener('navigate-to-settings', handleNavSettings);
    return () => {
      window.removeEventListener('navigate-to-settings', handleNavSettings);
    };
  }, []);

  const handleXPAward = (xp, leveledUp) => {
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff007f', '#00f3ff', '#00ff66', '#ffb700']
    });
    
    fetchProfile();
    
    if (leveledUp) {
      setLevelUpLevel((prev) => (profile ? profile.level + 1 : 2));
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectCategory = (catKey) => {
    setFilters((prev) => ({
      ...prev,
      category: catKey,
      smartFilter: '',
    }));
    setApprovalsActive(false);
    setAchievementsActive(false);
    setSettingsActive(false);
  };

  const handleSelectSmartFilter = (sfKey) => {
    setFilters((prev) => ({
      ...prev,
      smartFilter: prev.smartFilter === sfKey ? '' : sfKey,
      category: 'all',
    }));
    setApprovalsActive(false);
    setAchievementsActive(false);
    setSettingsActive(false);
  };

  const handleSelectApprovals = () => {
    setApprovalsActive(true);
    setAchievementsActive(false);
    setSettingsActive(false);
  };

  const handleSelectAchievements = () => {
    setAchievementsActive(true);
    setApprovalsActive(false);
    setSettingsActive(false);
  };

  const handleSelectSettings = () => {
    setSettingsActive(true);
    setApprovalsActive(false);
    setAchievementsActive(false);
    setFilters((prev) => ({ ...prev, category: '', smartFilter: '' }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      ordering: '-created_at',
      due_after: '',
      due_before: '',
      category: 'all',
      smartFilter: '',
    });
    setApprovalsActive(false);
    setAchievementsActive(false);
    setSettingsActive(false);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (taskData, id) => {
    try {
      let response;
      if (id) {
        // PUT update
        response = await api.put(`/api/tasks/${id}/`, taskData);
      } else {
        // POST create
        response = await api.post('/api/tasks/', taskData);
      }
      await fetchTasks();
      if (response.data && response.data.xp_awarded) {
        handleXPAward(response.data.xp_awarded, response.data.leveled_up);
      }
      return true;
    } catch (err) {
      const msg = err.response?.data?.due_date?.[0] ||
                  err.response?.data?.title?.[0] ||
                  err.response?.data?.detail ||
                  'Failed to save task. Please check parameters.';
      alert(`API ERROR: ${msg}`);
      return false;
    }
  };

  // Toggle Task Status directly
  const handleStatusToggle = async (task, newStatus) => {
    try {
      const response = await api.patch(`/api/tasks/${task.id}/`, { status: newStatus });
      fetchTasks();
      if (response.data && response.data.xp_awarded) {
        handleXPAward(response.data.xp_awarded, response.data.leveled_up);
      }
    } catch (err) {
      alert('Failed to update task status.');
    }
  };

  // Confirm Delete Task
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/api/tasks/${taskToDelete.id}/`);
      setTaskToDelete(null);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task.');
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    setDragOverColumn(columnStatus);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('taskId');
    const currentStatus = e.dataTransfer.getData('currentStatus');

    if (taskId && currentStatus !== targetStatus) {
      // Optimistic state update
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id.toString() === taskId.toString() ? { ...t, status: targetStatus } : t
        )
      );

      if (targetStatus === 'done') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#00f3ff', '#00ff66', '#ff007f']
        });
      }

      try {
        const response = await api.patch(`/api/tasks/${taskId}/`, { status: targetStatus });
        if (response.data && response.data.xp_awarded) {
          handleXPAward(response.data.xp_awarded, response.data.leveled_up);
        }
      } catch (err) {
        alert('Failed to update task status.');
        fetchTasks();
      }
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>
      
      {/* Mobile Category Sidebar Trigger */}
      <div style={{ display: 'none', marginBottom: '1rem' }} className="mobile-sidebar-trigger-container">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="retro-btn retro-btn-sm"
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Menu size={16} /> <span>CATEGORIES</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', width: '100%' }} className="dashboard-grid">
        
        {/* Left Category Sidebar */}
        <CategorySidebar
          categories={categories}
          selectedCategory={filters.category}
          onSelectCategory={handleSelectCategory}
          selectedSmartFilter={filters.smartFilter}
          onSelectSmartFilter={handleSelectSmartFilter}
          approvalsCount={approvals.filter(a => a.status === 'pending').length}
          selectedApprovals={approvalsActive}
          onSelectApprovals={handleSelectApprovals}
          selectedAchievements={achievementsActive}
          onSelectAchievements={handleSelectAchievements}
          selectedSettings={settingsActive}
          onSelectSettings={handleSelectSettings}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onTogglePinCategory={handleTogglePinCategory}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 0 }} className="board-container">
          
          {/* Centered Filter Bar */}
          {!approvalsActive && !achievementsActive && !settingsActive && (
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              onOpenCreateModal={handleOpenCreateModal}
            />
          )}

          {/* Error Notice */}
          {error && (
            <div style={{ background: 'rgba(255, 51, 102, 0.2)', border: '1px solid var(--neon-red)', color: 'var(--neon-red)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={20} />
              <div>
                <strong>BACKEND_COMM_FAILURE:</strong> {error}
              </div>
            </div>
          )}

          {/* Render Active View */}
          {settingsActive ? (
            <SettingsView />
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--neon-cyan)' }}>
              <Gamepad2 size={48} className="crt-glow" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1rem' }}>LOADING_TASK_MATRIX...</h3>
            </div>
          ) : approvalsActive ? (
            <ApprovalQueue
              proposals={approvals}
              onActionComplete={() => {
                fetchTasks();
                fetchProposals();
              }}
            />
          ) : achievementsActive ? (
            <AchievementsView
              profile={profile}
            />
          ) : tasks.length === 0 ? (
            /* Empty State */
            <div className="retro-card" style={{ textAlign: 'center', padding: '4rem 1.5rem', margin: '2rem 0' }}>
              <Sparkles size={48} color="#ff007f" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1rem', color: 'var(--neon-pink)', marginBottom: '0.5rem' }}>
                NO TASKS FOUND IN GRID!
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                No tasks match your filter parameters... Time to get productive and add your first task! 👾
              </p>
              <button onClick={handleOpenCreateModal} className="retro-btn retro-btn-green">
                ➕ CREATE FIRST TASK
              </button>
            </div>
          ) : (
            /* 3-Column Kanban Board Layout */
            <div className="kanban-board">
              {/* TO DO COLUMN */}
              <div
                onDragOver={(e) => handleDragOver(e, 'todo')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'todo')}
                className="retro-card"
                style={{
                  padding: '1.25rem',
                  background: dragOverColumn === 'todo' ? 'rgba(0, 243, 255, 0.05)' : 'rgba(10, 11, 16, 0.6)',
                  borderColor: dragOverColumn === 'todo' ? 'var(--neon-cyan)' : 'var(--neon-cyan)',
                  borderStyle: dragOverColumn === 'todo' ? 'dashed' : 'solid',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <h3 style={{
                  color: 'var(--neon-cyan)',
                  borderBottom: '2px solid var(--neon-cyan)',
                  paddingBottom: '0.75rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  fontFamily: 'var(--font-header)',
                  textShadow: '0 0 5px var(--neon-cyan)',
                  letterSpacing: '1px'
                }}>
                  TO DO ({tasks.filter(t => t.status === 'todo').length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '150px' }}>
                  {tasks.filter(t => t.status === 'todo').length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem', border: '1px dashed var(--border-dark)', borderRadius: '4px' }}>
                      [EMPTY_SECTOR]
                    </div>
                  ) : (
                    tasks.filter(t => t.status === 'todo').map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleOpenEditModal}
                        onDelete={setTaskToDelete}
                        onStatusToggle={handleStatusToggle}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* IN PROGRESS COLUMN */}
              <div
                onDragOver={(e) => handleDragOver(e, 'in_progress')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'in_progress')}
                className="retro-card"
                style={{
                  padding: '1.25rem',
                  background: dragOverColumn === 'in_progress' ? 'rgba(255, 183, 0, 0.05)' : 'rgba(10, 11, 16, 0.6)',
                  borderColor: dragOverColumn === 'in_progress' ? 'var(--neon-amber)' : 'var(--neon-amber)',
                  borderStyle: dragOverColumn === 'in_progress' ? 'dashed' : 'solid',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <h3 style={{
                  color: 'var(--neon-amber)',
                  borderBottom: '2px solid var(--neon-amber)',
                  paddingBottom: '0.75rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  fontFamily: 'var(--font-header)',
                  textShadow: '0 0 5px var(--neon-amber)',
                  letterSpacing: '1px'
                }}>
                  IN PROGRESS ({tasks.filter(t => t.status === 'in_progress').length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '150px' }}>
                  {tasks.filter(t => t.status === 'in_progress').length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem', border: '1px dashed var(--border-dark)', borderRadius: '4px' }}>
                      [EMPTY_SECTOR]
                    </div>
                  ) : (
                    tasks.filter(t => t.status === 'in_progress').map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleOpenEditModal}
                        onDelete={setTaskToDelete}
                        onStatusToggle={handleStatusToggle}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* COMPLETED COLUMN */}
              <div
                onDragOver={(e) => handleDragOver(e, 'done')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'done')}
                className="retro-card"
                style={{
                  padding: '1.25rem',
                  background: dragOverColumn === 'done' ? 'rgba(0, 255, 102, 0.05)' : 'rgba(10, 11, 16, 0.6)',
                  borderColor: dragOverColumn === 'done' ? 'var(--neon-green)' : 'var(--neon-green)',
                  borderStyle: dragOverColumn === 'done' ? 'dashed' : 'solid',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <h3 style={{
                  color: 'var(--neon-green)',
                  borderBottom: '2px solid var(--neon-green)',
                  paddingBottom: '0.75rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  fontFamily: 'var(--font-header)',
                  textShadow: '0 0 5px var(--neon-green)',
                  letterSpacing: '1px'
                }}>
                  COMPLETED ({tasks.filter(t => t.status === 'done').length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '150px' }}>
                  {tasks.filter(t => t.status === 'done').length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0', fontSize: '0.9rem', border: '1px dashed var(--border-dark)', borderRadius: '4px' }}>
                      [EMPTY_SECTOR]
                    </div>
                  ) : (
                    tasks.filter(t => t.status === 'done').map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleOpenEditModal}
                        onDelete={setTaskToDelete}
                        onStatusToggle={handleStatusToggle}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '2.5rem', flexWrap: 'wrap' }} className="action-buttons-container">
            <button onClick={handleOpenCreateModal} className="retro-btn retro-btn-green" style={{ width: 'auto', minWidth: '200px', fontSize: '0.85rem' }}>
              ➕ ADD TASK
            </button>
            <button onClick={() => setIsAIAssistantOpen(true)} className="retro-btn retro-btn-pink" style={{ width: 'auto', minWidth: '200px', fontSize: '0.85rem' }}>
              👾 AI ASSISTANT
            </button>
          </div>
        </div>
      </div>

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        title="WARNING: DELETE TASK"
        message={`Are you sure you want to delete task "${taskToDelete?.title}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onTaskCreated={() => {
          fetchTasks();
          setIsAIAssistantOpen(false);
        }}
        onMissionPlanned={() => {
          fetchProposals();
          setIsAIAssistantOpen(false);
          setApprovalsActive(true);
        }}
      />

      {/* Level Up Overlay Modal */}
      {levelUpLevel !== null && (
        <div className="retro-modal-backdrop" style={{ zIndex: 9999 }} onClick={() => setLevelUpLevel(null)}>
          <div 
            className="retro-card retro-card-green" 
            style={{ 
              width: '100%', 
              maxWidth: '420px', 
              backgroundColor: '#050711', 
              textAlign: 'center', 
              padding: '2.5rem 1.5rem', 
              boxShadow: '0 0 35px var(--neon-green)',
              animation: 'scaleIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flash-pulse" style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
            <h2 
              className="crt-glow" 
              style={{ 
                fontFamily: 'var(--font-header)', 
                color: 'var(--neon-green)', 
                fontSize: '1.5rem', 
                letterSpacing: '2px', 
                marginBottom: '1rem' 
              }}
            >
              LEVEL UP!
            </h2>
            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Congratulations! You have ascended to:
            </p>
            <div 
              style={{ 
                display: 'inline-block', 
                border: '2px solid var(--neon-green)', 
                padding: '0.75rem 2rem', 
                fontFamily: 'var(--font-header)', 
                fontSize: '1.25rem', 
                color: 'var(--neon-green)', 
                backgroundColor: 'rgba(0, 255, 102, 0.05)',
                marginBottom: '2.5rem'
              }}
            >
              LEVEL_{levelUpLevel.toString().padStart(2, '0')}
            </div>
            <div>
              <button 
                onClick={() => setLevelUpLevel(null)} 
                className="retro-btn retro-btn-green"
                style={{ width: 'auto', padding: '0.5rem 2.5rem' }}
              >
                [ ACCEPT ]
              </button>
            </div>
          </div>
          <style>{`
            @keyframes scaleIn {
              from { transform: scale(0.85); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

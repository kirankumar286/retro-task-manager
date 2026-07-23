import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import FilterBar from '../components/FilterBar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmModal from '../components/ConfirmModal';
import { Gamepad2, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const DashboardPage = () => {
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
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

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

      const response = await api.get(`/api/tasks/?${params.toString()}`);
      const data = response.data.results || response.data;
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load tasks from backend API.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300); // debounce search query
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      ordering: '-created_at',
      due_after: '',
      due_before: '',
    });
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
      if (id) {
        // PUT update
        await api.put(`/api/tasks/${id}/`, taskData);
      } else {
        // POST create
        await api.post('/api/tasks/', taskData);
      }
      await fetchTasks();
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
      await api.patch(`/api/tasks/${task.id}/`, { status: newStatus });
      fetchTasks();
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
        await api.patch(`/api/tasks/${taskId}/`, { status: targetStatus });
      } catch (err) {
        alert('Failed to update task status.');
        fetchTasks();
      }
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>
      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onOpenCreateModal={handleOpenCreateModal}
      />

      {/* Error Notice */}
      {error && (
        <div style={{ background: 'rgba(255, 51, 102, 0.2)', border: '1px solid var(--neon-red)', color: 'var(--neon-red)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} />
          <div>
            <strong>BACKEND_COMM_FAILURE:</strong> {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--neon-cyan)' }}>
          <Gamepad2 size={48} className="crt-glow" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1rem' }}>LOADING_TASK_MATRIX...</h3>
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State with Personality */
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
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

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        title="WARNING: DELETE TASK"
        message={`Are you sure you want to delete task "${taskToDelete?.title}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};

export default DashboardPage;

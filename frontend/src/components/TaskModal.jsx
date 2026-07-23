import React, { useState, useEffect } from 'react';
import { X, Save, AlertOctagon } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        status: taskToEdit.status || 'todo',
        priority: taskToEdit.priority || 'medium',
        due_date: taskToEdit.due_date || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
      });
    }
    setError(null);
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side quick checks
    if (!formData.title.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    if (!taskToEdit && formData.due_date) {
      const selected = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        setError('Due date cannot be in the past on creation.');
        return;
      }
    }

    const success = await onSave(formData, taskToEdit ? taskToEdit.id : null);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="retro-modal-backdrop" onClick={onClose}>
      <div className="retro-card retro-card-pink" style={{ width: '100%', maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '2px solid var(--neon-pink)', paddingBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '0.9rem', color: 'var(--neon-pink)' }}>
            {taskToEdit ? '✏️ EDIT_TASK' : '➕ CREATE_NEW_TASK'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--neon-pink)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 51, 102, 0.2)', border: '1px solid var(--neon-red)', color: 'var(--neon-red)', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="retro-label">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title..."
              className="retro-input"
              required
            />
          </div>

          <div>
            <label className="retro-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional task details..."
              rows={3}
              className="retro-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="retro-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="retro-select"
              >
                <option value="todo">📋 To Do</option>
                <option value="in_progress">⚙️ In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>

            <div>
              <label className="retro-label">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="retro-select"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="retro-label">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="retro-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="retro-btn retro-btn-sm" style={{ opacity: 0.8 }}>
              <X size={14} /> Cancel
            </button>
            <button type="submit" className="retro-btn retro-btn-green retro-btn-sm">
              <Save size={14} /> Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

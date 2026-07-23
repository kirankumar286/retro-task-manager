import React from 'react';
import confetti from 'canvas-confetti';
import { Edit2, Trash2, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusToggle }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        return <span className="retro-badge badge-done"><CheckCircle2 size={12} /> DONE</span>;
      case 'in_progress':
        return <span className="retro-badge badge-in_progress"><Clock size={12} /> IN_PROGRESS</span>;
      case 'todo':
      default:
        return <span className="retro-badge badge-todo"><AlertCircle size={12} /> TO_DO</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="retro-badge badge-prio-high">⚡ HIGH</span>;
      case 'medium':
        return <span className="retro-badge badge-prio-medium">▲ MED</span>;
      case 'low':
      default:
        return <span className="retro-badge badge-prio-low">▼ LOW</span>;
    }
  };

  const handleToggle = () => {
    let nextStatus = 'in_progress';
    if (task.status === 'todo') nextStatus = 'in_progress';
    else if (task.status === 'in_progress') nextStatus = 'done';
    else nextStatus = 'todo';

    if (nextStatus === 'done') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00f3ff', '#00ff66', '#ff007f']
      });
    }

    onStatusToggle(task, nextStatus);
  };

  return (
    <div className={`retro-card ${task.status === 'done' ? 'retro-card-pink' : ''}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
          {task.due_date && (
            <span style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} /> {task.due_date}
            </span>
          )}
        </div>

        <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: task.status === 'done' ? 'var(--text-muted)' : 'var(--neon-cyan)', textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
          {task.title}
        </h3>

        {task.description && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.9, whiteSpace: 'pre-wrap', marginBottom: '1rem', background: '#0a0b10', padding: '0.5rem', borderLeft: '2px solid var(--neon-cyan-dark)' }}>
            {task.description}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--neon-cyan-dark)', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          onClick={handleToggle}
          className={`retro-btn retro-btn-sm ${task.status === 'done' ? 'retro-btn-green' : 'retro-btn'}`}
          title="Toggle status"
        >
          {task.status === 'done' ? '✅ Complete' : task.status === 'in_progress' ? '⚙️ In Progress' : '📋 Start'}
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onEdit(task)} className="retro-btn retro-btn-sm" title="Edit Task">
            <Edit2 size={12} /> Edit
          </button>
          <button onClick={() => onDelete(task)} className="retro-btn retro-btn-red retro-btn-sm" title="Delete Task">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

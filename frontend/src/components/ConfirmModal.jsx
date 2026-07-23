import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="retro-modal-backdrop" onClick={onCancel}>
      <div className="retro-card retro-card-pink" style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <AlertTriangle color="#ff3366" size={44} style={{ margin: '0 auto 0.75rem auto' }} />
        
        <h3 style={{ fontSize: '0.9rem', color: 'var(--neon-red)', marginBottom: '0.5rem' }}>
          {title || 'WARNING: CONFIRM DELETE'}
        </h3>
        
        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1.5rem', opacity: 0.9 }}>
          {message || 'Are you sure you want to delete this task? This action cannot be undone.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onCancel} className="retro-btn retro-btn-sm">
            <X size={14} /> CANCEL [N]
          </button>
          <button onClick={onConfirm} className="retro-btn retro-btn-red retro-btn-sm">
            <Trash2 size={14} /> CONFIRM DELETE [Y]
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

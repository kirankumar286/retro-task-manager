import React, { useState } from 'react';
import { Check, X, Edit, Trash, Calendar, AlertOctagon } from 'lucide-react';
import api from '../services/api';

const ApprovalQueue = ({ proposals, onActionComplete }) => {
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [editingTasks, setEditingTasks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleReview = (proposal) => {
    setSelectedProposal(proposal);
    setEditingTasks(JSON.parse(JSON.stringify(proposal.proposed_tasks || [])));
    setError(null);
  };

  const handleTaskFieldChange = (index, field, value) => {
    setEditingTasks((prev) =>
      prev.map((task, i) => (i === index ? { ...task, [field]: value } : task))
    );
  };

  const handleRemoveTask = (index) => {
    setEditingTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveChanges = async () => {
    if (!selectedProposal) return;
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/api/ai/proposals/${selectedProposal.id}/`, {
        proposed_tasks: editingTasks,
      });
      // Update selected proposal local tasks
      setSelectedProposal((prev) => ({ ...prev, proposed_tasks: editingTasks }));
      alert('Changes saved successfully.');
      onActionComplete();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (proposalId, tasksToApprove = null) => {
    setSaving(true);
    setError(null);
    try {
      if (tasksToApprove) {
        // If we edited tasks, save them first before approving
        await api.patch(`/api/ai/proposals/${proposalId}/`, {
          proposed_tasks: tasksToApprove,
        });
      }
      await api.post(`/api/ai/proposals/${proposalId}/approve/`);
      alert('Mission approved! Tasks added to your Kanban board.');
      setSelectedProposal(null);
      onActionComplete();
    } catch (err) {
      setError(err.response?.data?.detail || 'Approval failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (proposalId) => {
    if (!window.confirm('Are you sure you want to reject this mission proposal?')) return;
    setSaving(true);
    setError(null);
    try {
      await api.post(`/api/ai/proposals/${proposalId}/reject/`);
      alert('Mission proposal rejected.');
      setSelectedProposal(null);
      onActionComplete();
    } catch (err) {
      setError(err.response?.data?.detail || 'Rejection failed.');
    } finally {
      setSaving(false);
    }
  };

  const pendingProposals = proposals.filter((p) => p.status === 'pending');

  if (selectedProposal) {
    return (
      <div className="retro-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px dashed var(--neon-pink)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.95rem', color: 'var(--neon-pink)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📝 REVIEW_MISSION: {selectedProposal.goal}
          </h2>
          <button
            onClick={() => setSelectedProposal(null)}
            className="retro-btn retro-btn-sm"
            style={{ width: 'auto' }}
          >
            [ BACK ]
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 51, 102, 0.2)', border: '1px solid var(--neon-red)', color: 'var(--neon-red)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={16} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {editingTasks.map((task, idx) => (
            <div
              key={idx}
              className="retro-card"
              style={{
                padding: '1rem',
                backgroundColor: '#090a13',
                borderStyle: 'dashed',
                borderColor: 'var(--neon-cyan-dark)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <label className="retro-label">Objective Title</label>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => handleTaskFieldChange(idx, 'title', e.target.value)}
                    className="retro-input"
                    style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                  />
                </div>
                <button
                  onClick={() => handleRemoveTask(idx)}
                  className="retro-btn retro-btn-red retro-btn-sm"
                  style={{ width: 'auto', alignSelf: 'flex-end', height: '34px' }}
                >
                  <X size={14} /> Remove
                </button>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <label className="retro-label">Objective Description</label>
                <textarea
                  value={task.description}
                  onChange={(e) => handleTaskFieldChange(idx, 'description', e.target.value)}
                  className="retro-input"
                  rows={2}
                  style={{ fontSize: '0.85rem', padding: '0.5rem', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label className="retro-label">Category</label>
                  <select
                    value={task.category}
                    onChange={(e) => handleTaskFieldChange(idx, 'category', e.target.value)}
                    className="retro-select"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.5rem' }}
                  >
                    <option value="work">💼 Work</option>
                    <option value="personal">👤 Personal</option>
                    <option value="groceries">🛒 Groceries</option>
                    <option value="errands">🏃 Errands</option>
                    <option value="study">📚 Study</option>
                    <option value="health">❤️ Health</option>
                    <option value="finance">💰 Finance</option>
                    <option value="home">🏠 Home</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>

                <div>
                  <label className="retro-label">Priority</label>
                  <select
                    value={task.priority}
                    onChange={(e) => handleTaskFieldChange(idx, 'priority', e.target.value)}
                    className="retro-select"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.5rem' }}
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                    <option value="urgent">💀 Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="retro-label">Due Date</label>
                  <input
                    type="date"
                    value={task.due_date || ''}
                    onChange={(e) => handleTaskFieldChange(idx, 'due_date', e.target.value)}
                    className="retro-input"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.5rem' }}
                  />
                </div>

                <div>
                  <label className="retro-label">Due Time</label>
                  <input
                    type="time"
                    value={task.due_time || ''}
                    onChange={(e) => handleTaskFieldChange(idx, 'due_time', e.target.value)}
                    className="retro-input"
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.5rem' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Options */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="retro-btn"
            style={{ width: 'auto', minWidth: '130px' }}
          >
            {saving ? 'SAVING...' : '💾 SAVE CHANGES'}
          </button>
          <button
            onClick={() => handleReject(selectedProposal.id)}
            disabled={saving}
            className="retro-btn retro-btn-red"
            style={{ width: 'auto', minWidth: '130px' }}
          >
            [ REJECT ]
          </button>
          <button
            onClick={() => handleApprove(selectedProposal.id, editingTasks)}
            disabled={saving}
            className="retro-btn retro-btn-green"
            style={{ width: 'auto', minWidth: '130px' }}
          >
            {saving ? 'APPROVING...' : '✓ APPROVE MISSION'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-card" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1rem', color: 'var(--neon-pink)', borderBottom: '2px solid var(--neon-pink)', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📥 AI_APPROVAL_QUEUE ({pendingProposals.length})
      </h2>

      {pendingProposals.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem 0' }}>
          [NO_PROPOSALS_PENDING_APPROVAL]
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {pendingProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="retro-card"
              style={{
                padding: '1.25rem',
                backgroundColor: 'rgba(10, 11, 16, 0.5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h3 style={{ color: 'var(--neon-pink)', fontSize: '0.9rem', marginBottom: '0.3rem', fontFamily: 'var(--font-header)' }}>
                  🎯 {proposal.goal}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Objectives detected: {proposal.proposed_tasks?.length || 0}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleReview(proposal)}
                  className="retro-btn retro-btn-sm"
                  style={{ width: 'auto' }}
                >
                  REVIEW
                </button>
                <button
                  onClick={() => handleReject(proposal.id)}
                  className="retro-btn retro-btn-red retro-btn-sm"
                  style={{ width: 'auto' }}
                >
                  REJECT
                </button>
                <button
                  onClick={() => handleApprove(proposal.id)}
                  className="retro-btn retro-btn-green retro-btn-sm"
                  style={{ width: 'auto' }}
                >
                  APPROVE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalQueue;

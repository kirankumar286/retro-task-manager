import React from 'react';
import { Search, Filter, Plus, RotateCcw, ArrowUpDown, Calendar } from 'lucide-react';

const FilterBar = ({ filters, onFilterChange, onReset, onOpenCreateModal }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  return (
    <div className="retro-card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="#00f3ff" /> QUERY_FILTERS
        </h2>
        <button onClick={onOpenCreateModal} className="retro-btn retro-btn-green">
          <Plus size={16} /> Add Task
        </button>
      </div>

      <div className="filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {/* Search */}
        <div>
          <label className="retro-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Search size={12} /> Search
          </label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Title or description..."
            className="retro-input"
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="retro-label">Status</label>
          <select name="status" value={filters.status} onChange={handleChange} className="retro-select">
            <option value="">ALL STATUSES</option>
            <option value="todo">📋 To Do</option>
            <option value="in_progress">⚙️ In Progress</option>
            <option value="done">✅ Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="retro-label">Priority</label>
          <select name="priority" value={filters.priority} onChange={handleChange} className="retro-select">
            <option value="">ALL PRIORITIES</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>

        {/* Ordering */}
        <div>
          <label className="retro-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ArrowUpDown size={12} /> Sort By
          </label>
          <select name="ordering" value={filters.ordering} onChange={handleChange} className="retro-select">
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="due_date">Due Date (Earliest)</option>
            <option value="-due_date">Due Date (Latest)</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {/* Due After */}
        <div>
          <label className="retro-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={12} /> Due After
          </label>
          <input
            type="date"
            name="due_after"
            value={filters.due_after}
            onChange={handleChange}
            className="retro-input"
          />
        </div>

        {/* Due Before */}
        <div>
          <label className="retro-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={12} /> Due Before
          </label>
          <input
            type="date"
            name="due_before"
            value={filters.due_before}
            onChange={handleChange}
            className="retro-input"
          />
        </div>
      </div>

      {/* Reset Filters */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button onClick={onReset} className="retro-btn retro-btn-sm" style={{ opacity: 0.85 }}>
          <RotateCcw size={12} /> Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;

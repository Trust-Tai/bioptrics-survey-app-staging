import React, { useState, useEffect } from 'react';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import DashboardBg from './DashboardBg';
import { useTracker } from 'meteor/react-meteor-data';
import { Goals } from '/imports/api/goals';
import { Meteor } from 'meteor/meteor';

interface SurveyGoal {
  _id?: string;
  title: string;
  description: string;
  color: string;
  createdAt: string;
  targetValue?: number;
  currentValue?: number;
  startDate?: string;
  endDate?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  metrics?: string[];
  relatedSurveys?: string[];
  department?: string;
  site?: string;
}

const DEFAULT_GOALS: Omit<SurveyGoal, '_id' | 'createdAt'>[] = [
  { 
    title: 'Engagement', 
    description: 'Increase employee engagement', 
    color: '#6a5acd',
    targetValue: 85,
    currentValue: 72,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Survey Participation Rate', 'Engagement Score'],
    relatedSurveys: ['Quarterly Pulse', 'Annual Engagement'],
    department: 'All',
    site: 'All'
  },
  { 
    title: 'Leadership', 
    description: 'Develop leadership skills and culture', 
    color: '#2e8b57',
    targetValue: 80,
    currentValue: 65,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Leadership Effectiveness Score', 'Manager Feedback Rating'],
    relatedSurveys: ['Leadership Assessment', 'Manager Feedback'],
    department: 'All',
    site: 'All'
  },
  { 
    title: 'Accountability', 
    description: 'Promote accountability at all levels', 
    color: '#552a47',
    targetValue: 90,
    currentValue: 68,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Accountability Index', 'Goal Completion Rate'],
    relatedSurveys: ['Performance Review', 'Team Effectiveness'],
    department: 'All',
    site: 'All'
  },
  { 
    title: 'Wellness', 
    description: 'Support wellness and well-being', 
    color: '#ff7f50',
    targetValue: 75,
    currentValue: 62,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Well-being Index', 'Work-Life Balance Score'],
    relatedSurveys: ['Wellness Assessment', 'Work-Life Balance'],
    department: 'All',
    site: 'All'
  },
  { 
    title: 'Communication', 
    description: 'Enhance communication and transparency', 
    color: '#3776a8',
    targetValue: 85,
    currentValue: 70,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Communication Effectiveness', 'Information Flow Rating'],
    relatedSurveys: ['Communication Assessment', 'Transparency Index'],
    department: 'All',
    site: 'All'
  },
  { 
    title: 'Safety', 
    description: 'Ensure workplace safety', 
    color: '#e74c3c',
    targetValue: 95,
    currentValue: 88,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Safety Incident Rate', 'Safety Compliance Score'],
    relatedSurveys: ['Safety Assessment', 'Hazard Reporting'],
    department: 'All',
    site: 'All'
  },
  { 
    title: 'Recognition', 
    description: 'Recognize and reward contributions', 
    color: '#e67e22',
    targetValue: 80,
    currentValue: 60,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Recognition Score', 'Employee Satisfaction'],
    relatedSurveys: ['Recognition Assessment', 'Employee Satisfaction'],
    department: 'All',
    site: 'All'
  },
  { 
    title: 'Pride', 
    description: 'Foster pride in the organization', 
    color: '#8e44ad',
    targetValue: 85,
    currentValue: 75,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'in_progress',
    metrics: ['Organizational Pride', 'Employee Net Promoter Score'],
    relatedSurveys: ['Organizational Culture', 'Employee Loyalty'],
    department: 'All',
    site: 'All'
  },
];



// Progress bar component for goal tracking
const GoalProgressBar: React.FC<{ currentValue: number | undefined; targetValue: number | undefined; color: string }> = ({ currentValue = 0, targetValue = 100, color }) => {
  const safeCurrentValue = currentValue || 0;
  const safeTargetValue = targetValue || 100;
  const percentage = Math.min(Math.round((safeCurrentValue / safeTargetValue) * 100), 100);
  
  return (
    <div style={{ width: '100%', backgroundColor: '#f0f0f0', borderRadius: 4, height: 8, marginTop: 8 }}>
      <div 
        style={{ 
          width: `${percentage}%`, 
          backgroundColor: color, 
          borderRadius: 4, 
          height: '100%',
          transition: 'width 0.5s ease-in-out'
        }} 
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6e5a67', marginTop: 4 }}>
        <span>{safeCurrentValue} / {safeTargetValue}</span>
        <span>{percentage}%</span>
      </div>
    </div>
  );
};

// Status badge component
const StatusBadge: React.FC<{ status: string | undefined }> = ({ status = 'not_started' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'not_started': return { bg: '#f8f9fa', text: '#6c757d' };
      case 'in_progress': return { bg: '#e3f2fd', text: '#0d6efd' };
      case 'completed': return { bg: '#d1e7dd', text: '#198754' };
      case 'overdue': return { bg: '#f8d7da', text: '#dc3545' };
      default: return { bg: '#f8f9fa', text: '#6c757d' };
    }
  };
  
  const { bg, text } = getStatusColor();
  const label = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <span style={{ 
      backgroundColor: bg, 
      color: text, 
      padding: '4px 8px', 
      borderRadius: 4, 
      fontSize: 12, 
      fontWeight: 600,
      textTransform: 'capitalize'
    }}>
      {label}
    </span>
  );
};

const SurveyGoalsPage: React.FC = () => {
  const goals = useTracker(() => {
    Meteor.subscribe('goals.all');
    return Goals.find({}, { sort: { createdAt: -1 } }).fetch().map((goal: any) => ({
      ...goal,
      createdAt: goal.createdAt instanceof Date ? goal.createdAt.toISOString() : String(goal.createdAt),
    })) as SurveyGoal[];
  }, []);

  // Pagination and search state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const filteredGoals = goals.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filteredGoals.length / pageSize);
  const paginatedGoals = filteredGoals.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1); // Reset to first page when search changes
  }, [search]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    color: '#6a5acd',
    targetValue: 100,
    currentValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    status: 'not_started',
    metrics: [] as string[],
    relatedSurveys: [] as string[],
    department: 'All',
    site: 'All'
  });
  const [editing, setEditing] = useState<SurveyGoal | null>(null);
  const [viewingGoal, setViewingGoal] = useState<SurveyGoal | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ _id: string; title: string } | null>(null);

  function showSuccess(msg: string) {
    setAlert({ type: 'success', message: msg });
    setTimeout(() => setAlert(null), 3000);
  }
  function showError(msg: string) {
    setAlert({ type: 'error', message: msg });
    setTimeout(() => setAlert(null), 4000);
  }

  function handleViewGoal(goal: SurveyGoal) {
    setViewingGoal(goal);
    setViewModal(true);
  }
  function closeViewModal() {
    setViewModal(false);
    setViewingGoal(null);
  }

  function openAddModal() {
    setForm({ 
      title: '', 
      description: '', 
      color: '#6a5acd',
      targetValue: 100,
      currentValue: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      status: 'not_started',
      metrics: [],
      relatedSurveys: [],
      department: 'All',
      site: 'All'
    });
    setEditing(null);
    setShowModal(true);
  }

  function openEditModal(goal: SurveyGoal) {
    setForm({ 
      title: goal.title, 
      description: goal.description, 
      color: goal.color,
      targetValue: goal.targetValue || 100,
      currentValue: goal.currentValue || 0,
      startDate: goal.startDate || new Date().toISOString().split('T')[0],
      endDate: goal.endDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      status: goal.status || 'not_started',
      metrics: goal.metrics || [],
      relatedSurveys: goal.relatedSurveys || [],
      department: goal.department || 'All',
      site: goal.site || 'All'
    });
    setEditing(goal);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setForm({ 
      title: '', 
      description: '', 
      color: '#6a5acd',
      targetValue: 100,
      currentValue: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      status: 'not_started',
      metrics: [],
      relatedSurveys: [],
      department: 'All',
      site: 'All'
    });
  }

  function handleAddOrUpdate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!form.title.trim()) return;
    // Prevent duplicate titles (case-insensitive)
    const exists = goals.some(g => g.title.toLowerCase() === form.title.trim().toLowerCase() && (!editing || g._id !== editing?._id));
    if (exists) {
      showError('A goal with this title already exists.');
      return;
    }
    if (editing && editing._id) {
      Meteor.call('goals.update', editing._id, { ...form }, (err: any) => {
        if (err) showError('Failed to update goal: ' + err.reason);
        else {
          showSuccess('Goal updated successfully!');
          closeModal();
        }
      });
    } else {
      Meteor.call('goals.insert', { ...form }, (err: any) => {
        if (err) showError('Failed to add goal: ' + err.reason);
        else {
          showSuccess('Goal added successfully!');
          closeModal();
        }
      });
    }
  }

  function handleDelete(_id: string) {
    setConfirmDelete(goals.find(g => g._id === _id) ? { _id, title: goals.find(g => g._id === _id)!.title } : null);
  }

  function confirmDeleteGoal() {
    if (!confirmDelete) return;
    Meteor.call('goals.remove', confirmDelete._id, (err: any) => {
      if (err) showError('Failed to delete goal: ' + err.reason);
      else showSuccess('Goal deleted successfully!');
      setConfirmDelete(null);
    });
  }

  return (
    <AdminLayout>
      <DashboardBg>
        <div>
          <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 26, marginBottom: 24, letterSpacing: 0.2 }}>Survey Goals</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <button
              onClick={openAddModal}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 44, cursor: 'pointer' }}
            >
              <span style={{ fontSize: 20, marginRight: 2 }}>+</span>
              Add
            </button>
            <input
              type="text"
              placeholder="Search goals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                height: 44,
                fontSize: 16,
                padding: '0 16px',
                borderRadius: 8,
                border: '1.5px solid #e5d6c7',
                minWidth: 220,
                color: '#28211e',
                fontWeight: 500,
                outline: 'none',
                background: '#fff',
              }}
            />
          </div>
        {alert && (
          <div
            style={{
              position: 'fixed',
              top: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              minWidth: 280,
              background: alert.type === 'success' ? '#2ecc40' : '#e74c3c',
              color: '#fff',
              borderRadius: 10,
              boxShadow: '0 2px 12px #552a4733',
              padding: '18px 36px 18px 20px',
              fontSize: 17,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span style={{ flex: 1 }}>{alert.message}</span>
            <button
              onClick={() => setAlert(null)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', fontWeight: 700 }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}
        {confirmDelete && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.18)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, minHeight: 120, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Delete Goal</h3>
              <div style={{ fontSize: 16, color: '#28211e', marginBottom: 12, textAlign: 'center' }}>
                Are you sure you want to delete <span style={{ fontWeight: 700 }}>{confirmDelete.title}</span>?
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="button" style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }} onClick={confirmDeleteGoal}>Confirm</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {showModal && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={handleAddOrUpdate} style={{ background: '#fff', borderRadius: 14, padding: 32, width: 700, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>{editing ? 'Edit Goal' : 'Add Goal'}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Title
                    <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }} required />
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Description
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60 }} required />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', display: 'flex', alignItems: 'center', gap: 10 }}>Color
                    <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 48, height: 32, border: 'none', background: 'none', verticalAlign: 'middle' }} />
                    <input
                      type="text"
                      value={form.color}
                      onChange={e => {
                        const val = e.target.value;
                        if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val)) setForm(f => ({ ...f, color: val }));
                      }}
                      maxLength={7}
                      style={{ width: 90, fontSize: 16, border: '1.5px solid #e5d6c7', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }}
                      placeholder="#552a47"
                      required
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Status
                    <select 
                      value={form.status} 
                      onChange={e => setForm(f => ({ ...f, status: e.target.value }))} 
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Target Value
                    <input 
                      type="number" 
                      value={form.targetValue} 
                      onChange={e => setForm(f => ({ ...f, targetValue: parseInt(e.target.value) || 0 }))} 
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                      min="0"
                      max="100"
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Current Value
                    <input 
                      type="number" 
                      value={form.currentValue} 
                      onChange={e => setForm(f => ({ ...f, currentValue: parseInt(e.target.value) || 0 }))} 
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                      min="0"
                      max={form.targetValue}
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Start Date
                    <input 
                      type="date" 
                      value={form.startDate} 
                      onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} 
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>End Date
                    <input 
                      type="date" 
                      value={form.endDate} 
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} 
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Department
                    <input 
                      type="text" 
                      value={form.department} 
                      onChange={e => setForm(f => ({ ...f, department: e.target.value }))} 
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                      placeholder="All or specific department"
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Site
                    <input 
                      type="text" 
                      value={form.site} 
                      onChange={e => setForm(f => ({ ...f, site: e.target.value }))} 
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                      placeholder="All or specific site"
                    />
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Metrics (comma-separated)
                    <input 
                      type="text" 
                      value={form.metrics.join(', ')} 
                      onChange={e => setForm(f => ({ ...f, metrics: e.target.value.split(',').map(m => m.trim()).filter(Boolean) }))} 
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                      placeholder="e.g. Engagement Score, Participation Rate"
                    />
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Related Surveys (comma-separated)
                    <input 
                      type="text" 
                      value={form.relatedSurveys.join(', ')} 
                      onChange={e => setForm(f => ({ ...f, relatedSurveys: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} 
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                      placeholder="e.g. Quarterly Pulse, Annual Engagement"
                    />
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="submit" style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>{editing ? 'Update' : 'Add'}</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={closeModal}>Cancel</button>
              </div>
              <button type="button" onClick={closeModal} style={{ position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', fontSize: 22, fontWeight: 700, color: '#28211e', cursor: 'pointer', opacity: 0.5, padding: 0, lineHeight: 1 }} aria-label="Close">×</button>
            </form>
          </div>
        )}
        {viewingGoal && viewModal && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.35)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(3px)' }}>
            <div style={{ 
              background: '#fff', 
              borderRadius: 16, 
              width: 700, 
              maxWidth: '90vw', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              boxShadow: '0 10px 40px rgba(85, 42, 71, 0.25)', 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              padding: 0
            }}>
              {/* Header section with color bar and title */}
              <div style={{ 
                borderTopLeftRadius: 16, 
                borderTopRightRadius: 16, 
                borderBottom: '1px solid #f0f0f0',
                padding: '16px 32px 20px',
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: 8, 
                  background: viewingGoal.color, 
                  borderTopLeftRadius: 16, 
                  borderTopRightRadius: 16 
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                  <StatusBadge status={viewingGoal.status || 'not_started'} />
                  <button 
                    type="button" 
                    onClick={closeViewModal} 
                    style={{ 
                      background: '#f5f5f5', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: 32, 
                      height: 32, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: 18, 
                      fontWeight: 700, 
                      color: '#666', 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#eee';
                      e.currentTarget.style.color = '#333';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#f5f5f5';
                      e.currentTarget.style.color = '#666';
                    }}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 26, color: '#333' }}>{viewingGoal.title}</h3>
                </div>
              </div>
              
              {/* Main content area */}
              <div style={{ padding: '24px 32px' }}>
                {/* Description */}
                <div style={{ 
                  fontSize: 16, 
                  color: '#444', 
                  marginBottom: 24, 
                  lineHeight: 1.5, 
                  padding: '16px 20px', 
                  background: '#f9f9f9', 
                  borderRadius: 12,
                  border: '1px solid #eee'
                }}>
                  {viewingGoal.description || 'No description provided.'}
                </div>
                
                {/* Progress section */}
                <div style={{ 
                  marginBottom: 18, 
                  background: '#fff', 
                  padding: '28px 20px', 
                  borderRadius: 12, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                  border: '1px solid #f0f0f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h4 style={{ margin: 0, fontSize: 18, color: viewingGoal.color, fontWeight: 700 }}>Progress</h4>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>
                      {viewingGoal.currentValue || 0}/{viewingGoal.targetValue || 100}
                    </div>
                  </div>
                  <GoalProgressBar 
                    currentValue={viewingGoal.currentValue} 
                    targetValue={viewingGoal.targetValue} 
                    color={viewingGoal.color} 
                  />
                </div>
                
                {/* Info grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: 24, 
                  fontSize: 15, 
                  color: '#333',
                  marginBottom: 18
                }}>
                  {/* Timeline card */}
                  <div style={{ 
                    background: '#fff', 
                    padding: '28px 20px', 
                    borderRadius: 12, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                    border: '1px solid #f0f0f0'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: viewingGoal.color, fontWeight: 700 }}>Timeline</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, color: '#555' }}>Start Date:</div>
                      <div>{viewingGoal.startDate || 'Not set'}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 600, color: '#555' }}>End Date:</div>
                      <div>{viewingGoal.endDate || 'Not set'}</div>
                    </div>
                  </div>
                  
                  {/* Location card */}
                  <div style={{ 
                    background: '#fff', 
                    padding: '28px 20px', 
                    borderRadius: 12, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                    border: '1px solid #f0f0f0'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: viewingGoal.color, fontWeight: 700 }}>Location</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, color: '#555' }}>Department:</div>
                      <div>{viewingGoal.department || 'All'}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 600, color: '#555' }}>Site:</div>
                      <div>{viewingGoal.site || 'All'}</div>
                    </div>
                  </div>
                </div>
                
                {/* Metrics and Related Surveys */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                  {/* Metrics card */}
                  <div style={{ 
                    background: '#fff', 
                    padding: '28px 20px', 
                    borderRadius: 12, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                    border: '1px solid #f0f0f0'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: viewingGoal.color, fontWeight: 700 }}>Metrics</h4>
                    {(viewingGoal.metrics && viewingGoal.metrics.length > 0) ? (
                      <ul style={{ margin: 0, paddingLeft: 20, color: '#444' }}>
                        {viewingGoal.metrics.map((metric, index) => (
                          <li key={index} style={{ marginBottom: 6 }}>{metric}</li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ color: '#777', fontStyle: 'italic' }}>No metrics specified</div>
                    )}
                  </div>
                  
                  {/* Related Surveys card */}
                  <div style={{ 
                    background: '#fff', 
                    padding: '28px 20px', 
                    borderRadius: 12, 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                    border: '1px solid #f0f0f0'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: 16, color: viewingGoal.color, fontWeight: 700 }}>Related Surveys</h4>
                    {(viewingGoal.relatedSurveys && viewingGoal.relatedSurveys.length > 0) ? (
                      <ul style={{ margin: 0, paddingLeft: 20, color: '#444' }}>
                        {viewingGoal.relatedSurveys.map((survey, index) => (
                          <li key={index} style={{ marginBottom: 6 }}>{survey}</li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ color: '#777', fontStyle: 'italic' }}>No related surveys</div>
                    )}
                  </div>
                </div>
                
                {/* Created date */}
                <div style={{ fontSize: 13, color: '#8a7a85', marginTop: 24, textAlign: 'right' }}>
                  Created: {new Date(viewingGoal.createdAt).toLocaleString()}
                </div>
              </div>
              
              {/* Footer with buttons */}
              <div style={{ 
                borderTop: '1px solid #f0f0f0', 
                padding: '16px 32px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: '#fafafa',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16
              }}>
                <button 
                  onClick={closeViewModal} 
                  style={{ 
                    background: '#f5f5f5', 
                    color: '#333', 
                    border: '1px solid #ddd', 
                    borderRadius: 8, 
                    fontWeight: 600, 
                    padding: '0 20px', 
                    fontSize: 15, 
                    height: 42, 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#eee'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#f5f5f5'}
                >
                  Close
                </button>
                <button 
                  onClick={() => { closeViewModal(); openEditModal(viewingGoal); }} 
                  style={{ 
                    background: viewingGoal.color, 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 8, 
                    fontWeight: 700, 
                    padding: '0 24px', 
                    fontSize: 15, 
                    height: 42, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: 16 }}>✏️</span> Edit
                </button>
              </div>
              
              {/* No duplicate close button needed */}
            </div>
          </div>
        )}
        {goals.length === 0 ? (
          <div style={{ color: '#8a7a85', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>No goals added yet.</div>
        ) : (
          <>
            <div style={{ padding: '24px 18px' }}>
              {paginatedGoals.length === 0 ? (
                <div style={{ color: '#8a7a85', fontSize: 17, marginTop: 32, textAlign: 'center' }}>No goals found.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', rowGap: '60px' }}>
                  {paginatedGoals.map((g, index) => (
                    <div 
                      key={g._id} 
                      style={{ 
                        background: '#fff', 
                        borderRadius: 14, 
                        boxShadow: '0 4px 12px rgba(85, 42, 71, 0.08)', 
                        padding: '20px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 16,
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid #f4ebf1',
                        height: '100%',
                        // Row gap is handled by the parent grid container
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(85, 42, 71, 0.12)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(85, 42, 71, 0.08)';
                      }}
                    >
                      {/* Color accent at top */}
                      <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        height: '5px', 
                        background: g.color 
                      }} />
                      
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginTop: '5px'
                      }}>
                        <div>
                          <h3 
                            style={{ 
                              margin: 0, 
                              fontSize: '18px', 
                              fontWeight: 700, 
                              color: g.color,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                            onClick={() => handleViewGoal(g)}
                          >
                            {g.title}
                          </h3>
                          <StatusBadge status={g.status || 'not_started'} />
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            onClick={() => handleViewGoal(g)} 
                            style={{ 
                              background: '#f0f7ff', 
                              border: 'none', 
                              color: '#3776a8', 
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                            title="View"
                          >
                            👁️
                          </button>
                          <button 
                            onClick={() => openEditModal(g)} 
                            style={{ 
                              background: '#f9f4f7', 
                              border: 'none', 
                              color: '#552a47', 
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(g._id!)} 
                            style={{ 
                              background: '#fff0f0', 
                              border: 'none', 
                              color: '#c0392b', 
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <p style={{ 
                        margin: '8px 0 0', 
                        color: '#555', 
                        fontSize: 15,
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {g.description || ''}
                      </p>
                      
                      <div style={{ marginTop: 'auto' }}>
                        <GoalProgressBar currentValue={g.currentValue} targetValue={g.targetValue} color={g.color} />
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: 13, 
                        color: '#666', 
                        marginTop: 4,
                        background: '#fafafa',
                        padding: '8px',
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ fontWeight: 600 }}>Timeline:</div>
                          <div style={{ color: '#555' }}>{g.startDate || 'Not set'} to {g.endDate || 'Not set'}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ fontWeight: 600 }}>Department:</div>
                          <div style={{ color: '#555' }}>{g.department || 'All'}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ fontWeight: 600 }}>Site:</div>
                          <div style={{ color: '#555' }}>{g.site || 'All'}</div>
                        </div>
                      </div>
                      
                      {(g.metrics && g.metrics.length > 0) && (
                        <div style={{ 
                          fontSize: 13, 
                          color: '#666',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}>
                          <div style={{ fontWeight: 600 }}>Metrics:</div>
                          <div style={{ 
                            color: '#555',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {g.metrics.join(', ')}
                          </div>
                        </div>
                      )}
                      
                      {(g.relatedSurveys && g.relatedSurveys.length > 0) && (
                        <div style={{ 
                          fontSize: 13, 
                          color: '#666',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}>
                          <div style={{ fontWeight: 600 }}>Related Surveys:</div>
                          <div style={{ 
                            color: '#555',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {g.relatedSurveys.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Pagination Controls */}
            {pageCount > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '24px 0 0 0' }}>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  style={{
                    background: page === 1 ? '#eee' : '#552a47',
                    color: page === 1 ? '#bbb' : '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    padding: '0 18px',
                    fontSize: 16,
                    height: 40,
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.7 : 1,
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: 15, color: '#552a47', fontWeight: 600 }}>
                  Page {page} of {pageCount}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pageCount}
                  style={{
                    background: page === pageCount ? '#eee' : '#552a47',
                    color: page === pageCount ? '#bbb' : '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    padding: '0 18px',
                    fontSize: 16,
                    height: 40,
                    cursor: page === pageCount ? 'not-allowed' : 'pointer',
                    opacity: page === pageCount ? 0.7 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {/* End main content div */}
    </DashboardBg>
  </AdminLayout>
  );
};

export default SurveyGoalsPage;

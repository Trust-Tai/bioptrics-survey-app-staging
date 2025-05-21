import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
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
}

const DEFAULT_GOALS: Omit<SurveyGoal, 'id' | 'createdAt'>[] = [
  { title: 'Engagement', description: 'Increase employee engagement', color: '#6a5acd' }, // purple
  { title: 'Leadership', description: 'Develop leadership skills and culture', color: '#2e8b57' }, // green
  { title: 'Accountability', description: 'Promote accountability at all levels', color: '#552a47' }, // gold
  { title: 'Wellness', description: 'Support wellness and well-being', color: '#ff7f50' }, // coral
  { title: 'Communication', description: 'Enhance communication and transparency', color: '#3776a8' }, // blue
  { title: 'Safety', description: 'Ensure workplace safety', color: '#e74c3c' }, // red
  { title: 'Recognition', description: 'Recognize and reward contributions', color: '#e67e22' }, // orange
  { title: 'Pride', description: 'Foster pride in the organization', color: '#8e44ad' }, // violet
];



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
  const [form, setForm] = useState({ title: '', description: '', color: '#6a5acd' });
  const [editing, setEditing] = useState<SurveyGoal | null>(null);
  const [viewingGoal, setViewingGoal] = useState<SurveyGoal | null>(null);
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
  }
  function closeViewGoal() {
    setViewingGoal(null);
  }

  function openAddModal() {
    setForm({ title: '', description: '', color: '#6a5acd' });
    setEditing(null);
    setShowModal(true);
  }

  function openEditModal(goal: SurveyGoal) {
    setForm({ title: goal.title, description: goal.description, color: goal.color });
    setEditing(goal);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setForm({ title: '', description: '', color: '#6a5acd' });
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
            <form onSubmit={handleAddOrUpdate} style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, minHeight: 270, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>{editing ? 'Edit Goal' : 'Add Goal'}</h3>
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Title
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }} required />
              </label>
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Description
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60 }} required />
              </label>
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
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="submit" style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>{editing ? 'Update' : 'Add'}</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        {viewingGoal && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.18)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, minHeight: 120, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: viewingGoal.color, fontSize: 22 }}>{viewingGoal.title}</h3>
              <div style={{ fontSize: 16, color: '#28211e', marginBottom: 12 }}>{viewingGoal.description}</div>
              <div style={{ fontSize: 13, color: '#8a7a85' }}>Created: {new Date(viewingGoal.createdAt).toLocaleString()}</div>
              <button onClick={closeViewGoal} style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer', marginTop: 14 }}>Close</button>
            </div>
          </div>
        )}
        {goals.length === 0 ? (
          <div style={{ color: '#8a7a85', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>No goals added yet.</div>
        ) : (
          <>
            <ul style={{ listStyle: 'none', padding: '24px 18px', margin: 0, display: 'flex', flexDirection: 'column', gap: 20, background: '#fffef6', borderRadius: 16 }}>
              {paginatedGoals.length === 0 ? (
                <li style={{ color: '#8a7a85', fontSize: 17, marginTop: 32, textAlign: 'center', listStyle: 'none' }}>No goals found.</li>
              ) : (
                paginatedGoals.map(g => (
                  <li key={g._id} style={{ background: '#f9f4f7', borderRadius: 14, boxShadow: '0 2px 8px #f4ebf1', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#28211e', fontWeight: 700, fontSize: 21, display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span
                        style={{
                          background: g.color,
                          color: '#fff',
                          borderRadius: 12,
                          padding: '5px 22px',
                          fontWeight: 800,
                          fontSize: 17,
                          marginRight: 10,
                          letterSpacing: 0.2,
                          display: 'inline-block',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleViewGoal(g)}
                      >
                        {g.title}
                      </span>
                    </span>
                    <span>
                      <button onClick={() => handleViewGoal(g)} style={{ background: 'none', border: 'none', color: '#3776a8', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginRight: 10 }}>View</button>
                      <button onClick={() => openEditModal(g)} style={{ background: 'none', border: 'none', color: '#552a47', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginRight: 10 }}>Edit</button>
                      <button onClick={() => handleDelete(g._id!)} style={{ background: 'none', border: 'none', color: '#c0392b', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Delete</button>
                    </span>
                  </li>
                ))
              )}
            </ul>
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

import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { SurveyThemes } from '/imports/api/surveyThemes';
import { WPSCategories } from '/imports/api/wpsCategories';
import AdminLayout from './AdminLayout';
import DashboardBg from './DashboardBg';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

interface Theme {
  _id?: string;
  name: string;
  color: string;
  description: string;
  createdAt?: string;
  wpsCategoryId?: string;
}

function toTheme(theme: any): Theme {
  return {
    ...theme,
    createdAt:
      theme.createdAt instanceof Date
        ? theme.createdAt.toISOString()
        : theme.createdAt,
  };
}

const SurveyTheme: React.FC = () => {
  // ...existing state...
  const [confirmDelete, setConfirmDelete] = useState<{ _id: string; name: string } | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function showSuccess(msg: string) {
    setAlert({ type: 'success', message: msg });
    setTimeout(() => setAlert(null), 3000);
  }
  function showError(msg: string) {
    setAlert({ type: 'error', message: msg });
    setTimeout(() => setAlert(null), 4000);
  }
  // State declarations...
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string|null>(null);
  const [editName, setEditName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [color, setColor] = useState('#b0802b');
  const [editColor, setEditColor] = useState('#b0802b');
  const [description, setDescription] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [wpsCategoryId, setWpsCategoryId] = useState('');
  const [editWpsCategoryId, setEditWpsCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingTheme, setViewingTheme] = useState<Theme | null>(null);

  // Handler to add a new theme
  const handleAdd = () => {
    if (!name.trim() || !wpsCategoryId) {
      showError('Please fill in all required fields.');
      return;
    }
    Meteor.call('surveyThemes.insert', { name, color, description, wpsCategoryId }, (err: any) => {
      if (!err) {
        setName('');
        setColor('#b0802b');
        setDescription('');
        setWpsCategoryId('');
        showSuccess('Theme added successfully!');
        setShowModal(false);
      } else {
        showError('Failed to add theme: ' + err.reason);
      }
    });
  };

  // Handler to start editing a theme
  const startEdit = (theme: Theme) => {
    setEditId(theme._id!);
    setEditName(theme.name);
    setEditColor(theme.color || '#b0802b');
    setEditDescription(theme.description || '');
    setEditWpsCategoryId(theme.wpsCategoryId || '');
  };

  // Handler to update a theme
  const handleUpdate = () => {
    if (!editId || !editName.trim() || !editDescription.trim() || !editWpsCategoryId) return;
    Meteor.call('surveyThemes.update', editId, { name: editName, color: editColor, description: editDescription, wpsCategoryId: editWpsCategoryId }, (err: any) => {
      if (!err) {
        setEditId(null);
        setEditName('');
        setEditColor('#b0802b');
        setEditDescription('');
        setEditWpsCategoryId('');
        showSuccess('Theme updated successfully!');
      } else {
        showError('Failed to update theme: ' + err.reason);
      }
    });
  };

  // Handler to delete a theme
  const handleDelete = (id: string) => {
    const theme = themes.find((t) => t._id === id);
    if (theme) setConfirmDelete({ _id: id, name: theme.name });
  };

  // Handler to confirm delete theme
  function confirmDeleteTheme() {
    if (!confirmDelete) return;
    Meteor.call('surveyThemes.remove', confirmDelete._id, (err: any) => {
      if (err) showError('Failed to delete theme: ' + err.reason);
      else showSuccess('Theme deleted successfully!');
      setConfirmDelete(null);
    });
  }

  // Subscribe and fetch from MongoDB
  const subscription = useTracker(() => Meteor.subscribe('surveyThemes.all'), []);
  const wpsCategoriesSub = useTracker(() => Meteor.subscribe('wpsCategories'), []);
  const themes = useTracker(() => {
    return subscription.ready()
      ? SurveyThemes.find({}, { sort: { name: 1 } }).fetch()
      : [];
  }, [subscription]);
  const wpsCategories = useTracker(() => {
    return wpsCategoriesSub.ready()
      ? WPSCategories.find({}, { sort: { name: 1 } }).fetch()
      : [];
  }, [wpsCategoriesSub]);
  useEffect(() => {
    if (subscription.ready()) setLoading(false);
  }, [subscription]);

  // The rest of the component logic, UI, and handlers are identical to WPSFramework
  // ...

  return (
    <AdminLayout>
      <DashboardBg>
      <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto'}}>
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Survey Theme</h2>
        {/* Alert message */}
        {alert && (
          <div style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: alert.type === 'success' ? '#2ecc40' : '#e74c3c',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            zIndex: 2000,
            boxShadow: '0 2px 12px #b0802b33',
          }}>
            {alert.message}
          </div>
        )}
        {/* Search and Add Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
  <button
    onClick={() => { setShowModal(true); setEditId(null); setEditName(''); setEditColor('#b0802b'); setEditDescription(''); }}
    style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 44, cursor: 'pointer' }}
  >
    <span style={{ fontSize: 20, marginRight: 2 }}>+</span>
    Add
  </button>
  <input
    type="text"
    placeholder="Search themes..."
    value={search}
    onChange={e => setSearch(e.target.value)}
    style={{ height: 44, fontSize: 16, padding: '0 16px', borderRadius: 8, border: '1.5px solid #e5d6c7', minWidth: 220, color: '#28211e', fontWeight: 500, outline: 'none' }}
  />
</div>
        {/* List, Edit, View, and Delete logic for Themes */}
        {showModal && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, minHeight: 170, boxShadow: '0 4px 32px #b0802b33', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#b0802b', fontSize: 22 }}>Add Theme</h3>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Theme name"
                style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                required
              />
              <select
                value={wpsCategoryId}
                onChange={e => setWpsCategoryId(e.target.value)}
                required
                style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', background: '#fff', boxSizing: 'border-box' }}
                disabled={!wpsCategoriesSub.ready()}
              >
                <option value="">{wpsCategoriesSub.ready() ? 'Select WPS Category' : 'Loading categories...'}</option>
                {wpsCategories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Description (optional)"
                style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60, boxSizing: 'border-box' }}
              />
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', display: 'flex', alignItems: 'center', gap: 10 }}>Color
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  style={{ width: 48, height: 32, border: 'none', background: 'none', verticalAlign: 'middle' }}
                  required
                />
                <input
                  type="text"
                  value={color}
                  onChange={e => {
                    const val = e.target.value;
                    if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val)) setColor(val);
                  }}
                  maxLength={7}
                  style={{ width: 90, fontSize: 16, border: '1.5px solid #e5d6c7', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }}
                  placeholder="#b0802b"
                  required
                />
              </label>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="submit" style={{ background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Add</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        {themes.length === 0 ? (
          <div style={{ color: '#b3a08a', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>No themes found.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: '24px 18px', margin: 0, display: 'flex', flexDirection: 'column', gap: 20, background: '#fffef6', borderRadius: 16 }}>
            {themes.filter(theme => theme.name.toLowerCase().includes(search.toLowerCase())).map(theme => (
              <li key={theme._id} style={{ background: '#fffbe9', borderRadius: 14, boxShadow: '0 2px 8px #f4e6c1', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ flex: 1, fontSize: 17, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, maxWidth: '100%' }}>
                    <span style={{ display: 'inline-block', width: 20, height: 20, background: theme.color, borderRadius: 4, marginRight: 10, border: '1px solid #d2c7b0' }} />
                    <span style={{ maxWidth: '320px', overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'pre-line', display: 'inline-block' }}>{theme.name}</span>
                  </span>
                  {theme.wpsCategoryId && (
                    <span style={{ fontSize: 14, color: '#6e395e' }}>WPS Category: {wpsCategories.find((cat: any) => cat._id === theme.wpsCategoryId)?.name}</span>
                  )}
                </span>
                <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <button onClick={() => setViewingTheme(toTheme(theme))} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} title="View">
                    <FaEye style={{ color: '#b0802b', fontSize: 18 }} />
                  </button>
                  <button onClick={() => startEdit(toTheme(theme))} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} title="Edit">
                    <FaEdit style={{ color: '#b0802b', fontSize: 18 }} />
                  </button>
                  <button onClick={() => handleDelete(theme._id!)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }} title="Delete">
                    <FaTrash style={{ color: '#b0802b', fontSize: 18 }} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        {/* Delete Theme Modal */}
        {confirmDelete && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.18)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, minHeight: 120, boxShadow: '0 4px 32px #b0802b33', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#b0802b', fontSize: 22 }}>Delete Theme</h3>
              <div style={{ fontSize: 16, color: '#28211e', marginBottom: 12, textAlign: 'center' }}>
                Are you sure you want to delete <span style={{ fontWeight: 700 }}>{confirmDelete.name}</span>?
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="button" style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }} onClick={confirmDeleteTheme}>Confirm</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => setConfirmDelete(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {/* View Theme Modal */}
        {viewingTheme && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.18)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, minHeight: 160, boxShadow: '0 4px 32px #b0802b33', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#b0802b', fontSize: 22 }}>Theme Details</h3>
              <div style={{ fontSize: 17, color: '#28211e', fontWeight: 700 }}>{viewingTheme.name}</div>
              <div style={{ fontSize: 15, color: '#28211e', marginBottom: 6 }}>{viewingTheme.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Color:</span>
                <span style={{ display: 'inline-block', width: 24, height: 24, background: viewingTheme.color, borderRadius: 6, border: '1px solid #d2c7b0' }} />
                <span style={{ fontWeight: 500, fontSize: 15, color: '#28211e' }}>{viewingTheme.color}</span>
              </div>
              {viewingTheme.wpsCategoryId && (
                <div style={{ fontSize: 15, color: '#6e395e', marginTop: 4 }}>
                  <span style={{ fontWeight: 600 }}>WPS Category:</span> {wpsCategories.find((cat: any) => cat._id === viewingTheme.wpsCategoryId)?.name || 'N/A'}
                </div>
              )}
              <div style={{ fontSize: 16, color: '#28211e', marginBottom: 12 }}>{viewingTheme.description}</div>
              <div style={{ fontSize: 13, color: '#b3a08a' }}>Created: {viewingTheme.createdAt ? new Date(viewingTheme.createdAt).toLocaleString() : '-'}</div>
              <button onClick={() => setViewingTheme(null)} style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer', marginTop: 14 }}>Close</button>
            </div>
          </div>
        )}
        {/* Edit Theme Modal */}
        {editId && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={e => { e.preventDefault(); handleUpdate(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, minHeight: 270, boxShadow: '0 4px 32px #b0802b33', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#b0802b', fontSize: 22 }}>Edit Theme</h3>
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Name
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }} required />
              </label>
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Description
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60, boxSizing: 'border-box' }} required />
              </label>
              <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', display: 'flex', alignItems: 'center', gap: 10 }}>Color
                <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} style={{ width: 48, height: 32, border: 'none', background: 'none', verticalAlign: 'middle' }} />
                <input
                  type="text"
                  value={editColor}
                  onChange={e => {
                    const val = e.target.value;
                    setEditColor(val);
                  }}
                  maxLength={7}
                  style={{ width: 90, fontSize: 16, border: '1.5px solid #e5d6c7', borderRadius: 6, padding: '4px 8px', marginLeft: 8 }}
                  placeholder="#b0802b"
                  required
                />
              </label>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="submit" style={{ background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Save</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => { setEditId(null); setEditName(''); setEditColor('#b0802b'); setEditDescription(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
      </DashboardBg>
    </AdminLayout>
  );
};

export default SurveyTheme;

import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { SurveyThemes } from '/imports/api/surveyThemes';
import { WPSCategories } from '/imports/api/wpsCategories';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import DashboardBg from './DashboardBg';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

interface Theme {
  _id?: string;
  name: string;
  color: string;
  description: string;
  createdAt?: string;
  wpsCategoryId?: string;
  assignableTo?: string[]; // Can be 'questions', 'surveys', or both
  keywords?: string[];
  priority?: number;
  isActive?: boolean;
}

function toTheme(theme: any): Theme {
  return {
    ...theme,
    createdAt:
      theme.createdAt instanceof Date
        ? theme.createdAt.toISOString()
        : theme.createdAt,
    assignableTo: theme.assignableTo || ['questions', 'surveys'],
    keywords: theme.keywords || [],
    priority: theme.priority || 0,
    isActive: theme.isActive !== false
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
  const [viewModal, setViewModal] = useState(false);
  const [search, setSearch] = useState('');
  const [color, setColor] = useState('#552a47');
  const [editColor, setEditColor] = useState('#552a47');
  const [description, setDescription] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [wpsCategoryId, setWpsCategoryId] = useState('');
  const [editWpsCategoryId, setEditWpsCategoryId] = useState('');
  const [assignableTo, setAssignableTo] = useState<string[]>(['questions', 'surveys']);
  const [editAssignableTo, setEditAssignableTo] = useState<string[]>(['questions', 'surveys']);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [priority, setPriority] = useState<number>(0);
  const [editPriority, setEditPriority] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [viewingTheme, setViewingTheme] = useState<Theme | null>(null);

  // Handler to add a new theme
  const handleAdd = () => {
    if (!name.trim() || !wpsCategoryId) {
      showError('Please fill in all required fields.');
      return;
    }
    Meteor.call('surveyThemes.insert', { 
      name, 
      color, 
      description, 
      wpsCategoryId,
      assignableTo,
      keywords,
      priority,
      isActive
    }, (err: any) => {
      if (!err) {
        setName('');
        setColor('#552a47');
        setDescription('');
        setWpsCategoryId('');
        setAssignableTo(['questions', 'surveys']);
        setKeywords([]);
        setPriority(0);
        setIsActive(true);
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
    setEditColor(theme.color || '#552a47');
    setEditDescription(theme.description || '');
    setEditWpsCategoryId(theme.wpsCategoryId || '');
    setEditAssignableTo(theme.assignableTo || ['questions', 'surveys']);
    setEditKeywords(theme.keywords || []);
    setEditPriority(theme.priority || 0);
    setEditIsActive(theme.isActive !== false); // Default to true if not specified
  };

  // Handler to update a theme
  const handleUpdate = () => {
    if (!editId || !editName.trim() || !editDescription.trim() || !editWpsCategoryId) return;
    Meteor.call('surveyThemes.update', editId, { 
      name: editName, 
      color: editColor, 
      description: editDescription, 
      wpsCategoryId: editWpsCategoryId,
      assignableTo: editAssignableTo,
      keywords: editKeywords,
      priority: editPriority,
      isActive: editIsActive
    }, (err: any) => {
      if (!err) {
        setEditId(null);
        setEditName('');
        setEditColor('#552a47');
        setEditDescription('');
        setEditWpsCategoryId('');
        setEditAssignableTo(['questions', 'surveys']);
        setEditKeywords([]);
        setEditPriority(0);
        setEditIsActive(true);
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

  // Handler to view a theme
  const handleViewTheme = (theme: Theme) => {
    setViewingTheme(theme);
    setViewModal(true);
  };

  // Handler to close view modal
  const closeViewModal = () => {
    setViewModal(false);
    setViewingTheme(null);
  };

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
            boxShadow: '0 2px 12px #552a4733',
          }}>
            {alert.message}
          </div>
        )}
        {/* Search and Add Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
  <button
    onClick={() => { setShowModal(true); setEditId(null); setEditName(''); setEditColor('#552a47'); setEditDescription(''); }}
    style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 44, cursor: 'pointer' }}
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
            <form onSubmit={e => { e.preventDefault(); handleAdd(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, width: 700, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Add Theme</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Theme Name
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Theme Name"
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                      required
                    />
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>WPS Category
                    <select
                      value={wpsCategoryId}
                      onChange={e => setWpsCategoryId(e.target.value)}
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                      required
                    >
                      <option value="">Select WPS Category</option>
                      {wpsCategories.map((cat: any) => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Description
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Description of this theme"
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60, boxSizing: 'border-box' }}
                      required
                    />
                  </label>
                </div>
                
                <div>
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
                      placeholder="#552a47"
                      required
                    />
                  </label>
                </div>
                
                <div>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Priority
                    <input
                      type="number"
                      value={priority}
                      onChange={e => setPriority(parseInt(e.target.value) || 0)}
                      min="0"
                      max="100"
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    />
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>Keywords (comma-separated)
                    <input
                      type="text"
                      value={keywords.join(', ')}
                      onChange={e => setKeywords(e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                      placeholder="e.g. safety, engagement, leadership"
                      style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e', boxSizing: 'border-box' }}
                    />
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', marginBottom: 4, display: 'block' }}>Assignable To</label>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#28211e', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={assignableTo.includes('questions')}
                        onChange={e => {
                          if (e.target.checked) {
                            setAssignableTo([...assignableTo.filter(a => a !== 'questions'), 'questions']);
                          } else {
                            setAssignableTo(assignableTo.filter(a => a !== 'questions'));
                          }
                        }}
                        style={{ width: 18, height: 18 }}
                      />
                      Questions
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#28211e', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={assignableTo.includes('surveys')}
                        onChange={e => {
                          if (e.target.checked) {
                            setAssignableTo([...assignableTo.filter(a => a !== 'surveys'), 'surveys']);
                          } else {
                            setAssignableTo(assignableTo.filter(a => a !== 'surveys'));
                          }
                        }}
                        style={{ width: 18, height: 18 }}
                      />
                      Surveys
                    </label>
                  </div>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: '#28211e', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      style={{ width: 18, height: 18 }}
                    />
                    Active
                  </label>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
                <button type="submit" style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Add</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        {/* Edit Theme Modal */}
        {editId && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={e => { e.preventDefault(); handleUpdate(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, minHeight: 270, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Edit Theme</h3>
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
                  placeholder="#552a47"
                  required
                />
              </label>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="submit" style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Save</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => { setEditId(null); setEditName(''); setEditColor('#552a47'); setEditDescription(''); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        {/* View Theme Modal */}
        {viewingTheme && viewModal && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.18)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, width: 600, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontWeight: 800, color: viewingTheme.color, fontSize: 24 }}>{viewingTheme.name}</h3>
                <span style={{ 
                  backgroundColor: viewingTheme.isActive !== false ? '#d1e7dd' : '#f8d7da', 
                  color: viewingTheme.isActive !== false ? '#198754' : '#dc3545', 
                  padding: '4px 8px', 
                  borderRadius: 4, 
                  fontSize: 12, 
                  fontWeight: 600 
                }}>
                  {viewingTheme.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div style={{ fontSize: 16, color: '#28211e', marginBottom: 8 }}>{viewingTheme.description || ''}</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, fontSize: 15, color: '#333' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#552a47' }}>WPS Category</h4>
                  <div>{wpsCategories.find((cat: any) => cat._id === viewingTheme.wpsCategoryId)?.name || 'None'}</div>
                </div>
                
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#552a47' }}>Priority</h4>
                  <div>{viewingTheme.priority || 0}</div>
                </div>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#552a47' }}>Assignable To</h4>
                <div style={{ display: 'flex', gap: 12 }}>
                  {viewingTheme.assignableTo && viewingTheme.assignableTo.includes('questions') && (
                    <span style={{ backgroundColor: '#e3f2fd', color: '#0d6efd', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Questions</span>
                  )}
                  {viewingTheme.assignableTo && viewingTheme.assignableTo.includes('surveys') && (
                    <span style={{ backgroundColor: '#fff3cd', color: '#fd7e14', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>Surveys</span>
                  )}
                  {(!viewingTheme.assignableTo || viewingTheme.assignableTo.length === 0) && (
                    <span style={{ color: '#6c757d' }}>Not specified</span>
                  )}
                </div>
              </div>
              
              {(viewingTheme.keywords && viewingTheme.keywords.length > 0) && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#552a47' }}>Keywords</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {viewingTheme.keywords.map((keyword, index) => (
                      <span key={index} style={{ backgroundColor: '#f8f9fa', color: '#6c757d', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{keyword}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ fontSize: 13, color: '#8a7a85', marginTop: 8 }}>Created: {new Date(viewingTheme.createdAt || '').toLocaleString()}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button onClick={closeViewModal} style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }}>Close</button>
                <button onClick={() => { closeViewModal(); startEdit(viewingTheme); }} style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Edit</button>
              </div>
              
              <button type="button" onClick={closeViewModal} style={{ position: 'absolute', right: 16, top: 16, background: 'none', border: 'none', fontSize: 22, fontWeight: 700, color: '#28211e', cursor: 'pointer', opacity: 0.5, padding: 0, lineHeight: 1 }} aria-label="Close">×</button>
            </div>
          </div>
        )}
        
        {/* List of themes */}
        {themes.length === 0 ? (
          <div style={{ color: '#8a7a85', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>No themes found.</div>
        ) : (
          <div style={{ 
            padding: '28px 24px', 
            margin: 0
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '24px',
              width: '100%'
            }}>
              {themes.filter(theme => theme.name.toLowerCase().includes(search.toLowerCase())).map((themeData, index) => {
                const theme = toTheme(themeData);
                return (
                <div 
                  key={theme._id} 
                  style={{ 
                    background: '#fff', 
                    borderRadius: 14, 
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', 
                    padding: '24px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 16,
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.2s ease-in-out',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    marginTop: index >= 3 ? '45px' : '0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(85, 42, 71, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Color indicator at top of card */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: theme.color,
                  }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span 
                          style={{ 
                            maxWidth: '100%', 
                            overflowWrap: 'break-word', 
                            wordBreak: 'break-word', 
                            whiteSpace: 'pre-line', 
                            display: 'inline-block', 
                            fontWeight: 700, 
                            fontSize: 18, 
                            cursor: 'pointer',
                            color: theme.color
                          }}
                          onClick={() => handleViewTheme(theme)}
                        >
                          {theme.name}
                        </span>
                        {theme.isActive === false && (
                          <span style={{ 
                            backgroundColor: '#f8d7da', 
                            color: '#dc3545', 
                            padding: '2px 8px', 
                            borderRadius: 4, 
                            fontSize: 11, 
                            fontWeight: 600 
                          }}>Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p style={{ 
                    margin: '4px 0 0 0', 
                    color: '#555', 
                    fontSize: 15,
                    flexGrow: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>{theme.description || ''}</p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 14, color: '#666', marginTop: 'auto' }}>
                    {theme.wpsCategoryId && (
                      <div style={{ 
                        display: 'inline-block', 
                        backgroundColor: '#f2f2f2', 
                        padding: '4px 10px', 
                        borderRadius: 6,
                        fontSize: 13
                      }}>
                        {wpsCategories.find((cat: any) => cat._id === theme.wpsCategoryId)?.name}
                      </div>
                    )}
                  </div>
                  
                  {theme.assignableTo && theme.assignableTo.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      {theme.assignableTo.includes('questions') && (
                        <span style={{ 
                          backgroundColor: '#e3f2fd', 
                          color: '#0d6efd', 
                          padding: '3px 8px', 
                          borderRadius: 4, 
                          fontSize: 12, 
                          fontWeight: 600 
                        }}>Questions</span>
                      )}
                      {theme.assignableTo.includes('surveys') && (
                        <span style={{ 
                          backgroundColor: '#fff3cd', 
                          color: '#fd7e14', 
                          padding: '3px 8px', 
                          borderRadius: 4, 
                          fontSize: 12, 
                          fontWeight: 600 
                        }}>Surveys</span>
                      )}
                    </div>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginTop: 16, 
                    borderTop: '1px solid #f0f0f0', 
                    paddingTop: 12 
                  }}>
                    <button 
                      onClick={() => handleViewTheme(theme)} 
                      style={{ 
                        background: '#f8f9fa', 
                        border: 'none', 
                        color: '#3776a8', 
                        fontWeight: 600, 
                        cursor: 'pointer', 
                        fontSize: 14, 
                        padding: '6px 12px',
                        borderRadius: 6
                      }}
                    >View</button>
                    <div>
                      <button 
                        onClick={() => startEdit(theme)} 
                        style={{ 
                          background: '#f0e6ee', 
                          border: 'none', 
                          color: '#552a47', 
                          fontWeight: 600, 
                          cursor: 'pointer', 
                          fontSize: 14, 
                          marginRight: 10,
                          padding: '6px 12px',
                          borderRadius: 6
                        }}
                      >Edit</button>
                      <button 
                        onClick={() => handleDelete(theme._id!)} 
                        style={{ 
                          background: '#fee5e2', 
                          border: 'none', 
                          color: '#c0392b', 
                          fontWeight: 600, 
                          cursor: 'pointer', 
                          fontSize: 14,
                          padding: '6px 12px',
                          borderRadius: 6
                        }}
                      >Delete</button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Delete Theme Modal */}
        {confirmDelete && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.18)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, minHeight: 120, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Delete Theme</h3>
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
            <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, minHeight: 160, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Theme Details</h3>
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
              <div style={{ fontSize: 13, color: '#8a7a85' }}>Created: {viewingTheme.createdAt ? new Date(viewingTheme.createdAt).toLocaleString() : '-'}</div>
              <button onClick={() => setViewingTheme(null)} style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer', marginTop: 14 }}>Close</button>
            </div>
          </div>
        )}
        {/* Edit Theme Modal */}
        {editId && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form onSubmit={e => { e.preventDefault(); handleUpdate(); }} style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 340, maxWidth: 400, minHeight: 270, boxShadow: '0 4px 32px #552a4733', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', boxSizing: 'border-box' }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#552a47', fontSize: 22 }}>Edit Theme</h3>
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
                  placeholder="#552a47"
                  required
                />
              </label>
              <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                <button type="submit" style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}>Save</button>
                <button type="button" style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }} onClick={() => { setEditId(null); setEditName(''); setEditColor('#552a47'); setEditDescription(''); }}>Cancel</button>
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

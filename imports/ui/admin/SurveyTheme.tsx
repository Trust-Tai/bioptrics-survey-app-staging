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
  };

  // Handler to close view modal
  const closeViewModal = () => {
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
          <div style={{ 
            position: 'fixed', 
            left: 0, 
            top: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(40,33,30,0.25)', 
            backdropFilter: 'blur(4px)',
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <form 
              onSubmit={e => { e.preventDefault(); handleAdd(); }} 
              style={{ 
                background: 'linear-gradient(to bottom right, #fff, #fafafa)',
                borderRadius: 20,
                padding: '32px 36px',
                width: 480,
                maxWidth: '90vw',
                maxHeight: '85vh',
                overflowY: 'auto',
                boxShadow: '0 8px 40px rgba(85,42,71,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                position: 'relative',
                animation: 'slideUp 0.3s ease-out'
              }}>
              <div style={{ marginBottom: 8 }}>
                <h3 style={{ 
                  margin: 0, 
                  fontWeight: 800, 
                  color: '#552a47', 
                  fontSize: 24,
                  letterSpacing: '-0.02em',
                  position: 'relative'
                }}>
                  Add Theme
                  <div style={{ 
                    position: 'absolute', 
                    bottom: -8, 
                    left: 0, 
                    width: 40, 
                    height: 3, 
                    background: '#552a47',
                    borderRadius: 2
                  }} />
                </h3>
              </div>
              
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                backgroundColor: '#fff',
                padding: '16px 20px',
                borderRadius: 16,
                border: '1px solid rgba(85,42,71,0.1)',
                boxShadow: 'inset 0 1px 3px rgba(85,42,71,0.05)'
              }}>
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={{ 
                      display: 'block',
                      fontWeight: 600, 
                      fontSize: 15, 
                      color: '#28211e',
                      marginBottom: 8
                    }}>Theme Name</span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Enter theme name"
                        style={{ 
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: '2px solid #e5d6c7',
                          fontSize: 16,
                          fontWeight: 500,
                          color: '#28211e',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease',
                          backgroundColor: '#fff',
                          '&:focus': {
                            borderColor: '#552a47',
                            boxShadow: '0 0 0 3px rgba(85,42,71,0.1)',
                            outline: 'none'
                          },
                          '&:hover': {
                            borderColor: '#552a47'
                          }
                        }}
                        required
                      />
                    </div>
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={{ 
                      display: 'block',
                      fontWeight: 600, 
                      fontSize: 15, 
                      color: '#28211e',
                      marginBottom: 8
                    }}>WPS Category</span>
                    <div style={{ position: 'relative' }}>
                      <select
                        value={wpsCategoryId}
                        onChange={e => setWpsCategoryId(e.target.value)}
                        style={{ 
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: '2px solid #e5d6c7',
                          fontSize: 16,
                          fontWeight: 500,
                          color: '#28211e',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease',
                          backgroundColor: '#fff',
                          appearance: 'none',
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%23552a47\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 16px center',
                          paddingRight: '40px',
                          cursor: 'pointer',
                          '&:focus': {
                            borderColor: '#552a47',
                            boxShadow: '0 0 0 3px rgba(85,42,71,0.1)',
                            outline: 'none'
                          },
                          '&:hover': {
                            borderColor: '#552a47'
                          }
                        }}
                        required
                      >
                        <option value="">Select WPS Category</option>
                        {wpsCategories.map((cat: any) => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={{ 
                      display: 'block',
                      fontWeight: 600, 
                      fontSize: 15, 
                      color: '#28211e',
                      marginBottom: 8
                    }}>Description</span>
                    <div style={{ position: 'relative' }}>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Enter a detailed description of this theme"
                        style={{ 
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: '2px solid #e5d6c7',
                          fontSize: 16,
                          fontWeight: 500,
                          color: '#28211e',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease',
                          backgroundColor: '#fff',
                          minHeight: 80,
                          resize: 'vertical',
                          lineHeight: '1.5',
                          '&:focus': {
                            borderColor: '#552a47',
                            boxShadow: '0 0 0 3px rgba(85,42,71,0.1)',
                            outline: 'none'
                          },
                          '&:hover': {
                            borderColor: '#552a47'
                          }
                        }}
                        required
                      />
                    </div>
                  </label>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={{ 
                      display: 'block',
                      fontWeight: 600, 
                      fontSize: 15, 
                      color: '#28211e',
                      marginBottom: 8
                    }}>Theme Color</span>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12,
                      backgroundColor: '#fff',
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '2px solid #e5d6c7',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#552a47'
                      }
                    }}>
                      <input
                        type="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        style={{ 
                          width: 42,
                          height: 42,
                          border: 'none',
                          borderRadius: 8,
                          background: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}
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
                        style={{ 
                          width: '100%',
                          fontSize: 16,
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: 8,
                          backgroundColor: '#f8f8f8',
                          color: '#28211e',
                          fontWeight: 500,
                          '&:focus': {
                            outline: 'none',
                            backgroundColor: '#fff',
                            boxShadow: '0 0 0 3px rgba(85,42,71,0.1)'
                          }
                        }}
                        placeholder="#552a47"
                        required
                      />
                    </div>
                  </label>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={{ 
                      display: 'block',
                      fontWeight: 600, 
                      fontSize: 15, 
                      color: '#28211e',
                      marginBottom: 8
                    }}>Priority</span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        value={priority}
                        onChange={e => setPriority(parseInt(e.target.value) || 0)}
                        min="0"
                        max="100"
                        style={{ 
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: '2px solid #e5d6c7',
                          fontSize: 16,
                          fontWeight: 500,
                          color: '#28211e',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease',
                          backgroundColor: '#fff',
                          '&:focus': {
                            borderColor: '#552a47',
                            boxShadow: '0 0 0 3px rgba(85,42,71,0.1)',
                            outline: 'none'
                          },
                          '&:hover': {
                            borderColor: '#552a47'
                          }
                        }}
                      />
                    </div>
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={{ 
                      display: 'block',
                      fontWeight: 600, 
                      fontSize: 15, 
                      color: '#28211e',
                      marginBottom: 8
                    }}>Keywords</span>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={keywords.join(', ')}
                        onChange={e => setKeywords(e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                        placeholder="e.g. safety, engagement, leadership"
                        style={{ 
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: '2px solid #e5d6c7',
                          fontSize: 16,
                          fontWeight: 500,
                          color: '#28211e',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s ease',
                          backgroundColor: '#fff',
                          '&:focus': {
                            borderColor: '#552a47',
                            boxShadow: '0 0 0 3px rgba(85,42,71,0.1)',
                            outline: 'none'
                          },
                          '&:hover': {
                            borderColor: '#552a47'
                          }
                        }}
                      />
                      <div style={{ 
                        fontSize: 13, 
                        color: '#666', 
                        marginTop: 4, 
                        paddingLeft: 4 
                      }}>Separate multiple keywords with commas</div>
                    </div>
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ display: 'block', marginBottom: 16 }}>
                    <span style={{ 
                      display: 'block',
                      fontWeight: 600, 
                      fontSize: 15, 
                      color: '#28211e',
                      marginBottom: 122
                    }}>Assignable To</span>
                    <div style={{ 
                      display: 'flex', 
                      gap: 16, 
                      backgroundColor: '#fff',
                      padding: '16px',
                      borderRadius: 12,
                      border: '2px solid #e5d6c7',
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 10, 
                        fontSize: 15, 
                        color: '#28211e', 
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: 8,
                        backgroundColor: assignableTo.includes('questions') ? 'rgba(85,42,71,0.05)' : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(85,42,71,0.05)'
                        }
                      }}>
                        <div style={{ 
                          width: 20, 
                          height: 20, 
                          border: '2px solid #552a47',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: assignableTo.includes('questions') ? '#552a47' : 'transparent',
                          transition: 'all 0.2s ease'
                        }}>
                          {assignableTo.includes('questions') && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
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
                          style={{ display: 'none' }}
                        />
                        Questions
                      </label>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 10, 
                        fontSize: 15, 
                        color: '#28211e', 
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: 8,
                        backgroundColor: assignableTo.includes('surveys') ? 'rgba(85,42,71,0.05)' : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(85,42,71,0.05)'
                        }
                      }}>
                        <div style={{ 
                          width: 20, 
                          height: 20, 
                          border: '2px solid #552a47',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: assignableTo.includes('surveys') ? '#552a47' : 'transparent',
                          transition: 'all 0.2s ease'
                        }}>
                          {assignableTo.includes('surveys') && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
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
                          style={{ display: 'none' }}
                        />
                        Surveys
                      </label>
                    </div>
                  </label>
                </div>
                
                <div style={{ gridColumn: '1 / 3', marginTop: 8 }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    fontSize: 15, 
                    color: '#28211e', 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    userSelect: 'none'
                  }}>
                    <div style={{ 
                      width: 44,
                      height: 24,
                      backgroundColor: isActive ? '#552a47' : '#e5e5e5',
                      borderRadius: 12,
                      position: 'relative',
                      transition: 'background-color 0.2s ease'
                    }}>
                      <div style={{ 
                        width: 20,
                        height: 20,
                        backgroundColor: '#fff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: 2,
                        left: isActive ? 22 : 2,
                        transition: 'left 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }} />
                    </div>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <span style={{ 
                      opacity: isActive ? 1 : 0.6,
                      transition: 'opacity 0.2s ease'
                    }}>Active</span>
                  </label>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: 14, 
                marginTop: 32,
                padding: '20px 0 0',
                borderTop: '1px solid rgba(85,42,71,0.1)'
              }}>
                <button 
                  type="submit" 
                  style={{ 
                    background: 'linear-gradient(45deg, #552a47, #693658)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    fontWeight: 700,
                    padding: '0 32px',
                    fontSize: 16,
                    height: 48,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(85,42,71,0.15)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(85,42,71,0.2)'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 4px rgba(85,42,71,0.1)'
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Add Theme
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ 
                    background: '#fff',
                    color: '#552a47',
                    border: '2px solid #e5d6c7',
                    borderRadius: 12,
                    fontWeight: 600,
                    padding: '0 24px',
                    fontSize: 15,
                    height: 48,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#552a47',
                      backgroundColor: 'rgba(85,42,71,0.05)'
                    }
                  }}
                >
                  Cancel
                </button>
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
        {viewingTheme && (
          <div style={{ 
            position: 'fixed', 
            left: 0, 
            top: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(40,33,30,0.3)', 
            backdropFilter: 'blur(8px)',
            zIndex: 1100, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <div style={{ 
              background: '#fff', 
              borderRadius: 20, 
              padding: '32px', 
              width: 620, 
              maxWidth: '90vw', 
              maxHeight: '85vh', 
              overflowY: 'auto', 
              boxShadow: '0 12px 50px rgba(85,42,71,0.15)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 28,
              position: 'relative',
              border: '1px solid rgba(85,42,71,0.08)',
              animation: 'modalFadeIn 0.3s ease-out'
            }}>
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: 4,
                position: 'relative'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 16,
                  flex: 1,
                  marginRight: 40
                }}>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 12, 
                    background: viewingTheme.color,
                    boxShadow: `0 4px 12px ${viewingTheme.color}40`,
                    border: '2px solid #fff'
                  }} />
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      fontWeight: 800, 
                      color: viewingTheme.color, 
                      fontSize: 28,
                      letterSpacing: '-0.5px',
                      marginBottom: 6
                    }}>{viewingTheme.name}</h3>
                    <span style={{ 
                      backgroundColor: viewingTheme.isActive !== false ? '#ecf7f0' : '#fef1f1', 
                      color: viewingTheme.isActive !== false ? '#0e6245' : '#be2e3d', 
                      padding: '4px 12px', 
                      borderRadius: 20, 
                      fontSize: 13, 
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: viewingTheme.isActive !== false ? '0 2px 8px #0e624520' : '0 2px 8px #be2e3d20'
                    }}>
                      <span style={{ 
                        width: 6, 
                        height: 6, 
                        borderRadius: '50%', 
                        background: viewingTheme.isActive !== false ? '#0e6245' : '#be2e3d',
                        boxShadow: `0 0 0 2px ${viewingTheme.isActive !== false ? '#dff0ea' : '#fde8e8'}`
                      }} />
                      {viewingTheme.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

              </div>
              
              {/* Description */}
              <div style={{ 
                fontSize: 16, 
                color: '#444', 
                lineHeight: 1.6,
                background: '#fafafa',
                padding: '20px 24px',
                borderRadius: 16,
                border: '1px solid #f0f0f0',
                position: 'relative',
                marginTop: 8
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: -10, 
                  left: 24, 
                  background: '#666', 
                  color: '#fff',
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 600
                }}>Description</div>
                {viewingTheme.description || 'No description provided.'}
              </div>
              
              {/* Info Cards */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 20, 
                fontSize: 15, 
                color: '#333',
                background: '#fff',
                padding: '4px 0'
              }}>
                <div style={{
                  background: '#f8f8f8',
                  borderRadius: 16,
                  padding: '20px',
                  border: '1px solid #f0f0f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  <h4 style={{ 
                    margin: 0,
                    fontSize: 13, 
                    color: '#666',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>WPS Category</h4>
                  <div style={{ 
                    fontSize: 16, 
                    color: '#333', 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: viewingTheme.color,
                      flexShrink: 0
                    }} />
                    {wpsCategories.find((cat: any) => cat._id === viewingTheme.wpsCategoryId)?.name || 'None'}
                  </div>
                </div>
                
                <div style={{
                  background: '#f8f8f8',
                  borderRadius: 16,
                  padding: '20px',
                  border: '1px solid #f0f0f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}>
                  <h4 style={{ 
                    margin: 0,
                    fontSize: 13, 
                    color: '#666',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Priority Level</h4>
                  <div style={{ 
                    fontSize: 16, 
                    color: '#333', 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: viewingTheme.color,
                      flexShrink: 0
                    }} />
                    {viewingTheme.priority || 0}
                  </div>
                </div>
              </div>
              
              {/* Assignable To */}
              <div style={{
                background: '#f8f8f8',
                borderRadius: 16,
                padding: '20px',
                border: '1px solid #f0f0f0'
              }}>
                <h4 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: 13, 
                  color: '#666',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>Assignable To</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  {viewingTheme.assignableTo && viewingTheme.assignableTo.includes('questions') && (
                    <span style={{ 
                      backgroundColor: '#edf6ff', 
                      color: '#0055cc', 
                      padding: '8px 16px', 
                      borderRadius: 24, 
                      fontSize: 13, 
                      fontWeight: 600,
                      border: '1px solid #cce3ff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#0055cc',
                        boxShadow: '0 0 0 2px #e3f0ff'
                      }} />
                      Questions
                    </span>
                  )}
                  {viewingTheme.assignableTo && viewingTheme.assignableTo.includes('surveys') && (
                    <span style={{ 
                      backgroundColor: '#fff8eb', 
                      color: '#b35d00', 
                      padding: '8px 16px', 
                      borderRadius: 24, 
                      fontSize: 13, 
                      fontWeight: 600,
                      border: '1px solid #ffe7ba',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#b35d00',
                        boxShadow: '0 0 0 2px #fff3d9'
                      }} />
                      Surveys
                    </span>
                  )}
                  {(!viewingTheme.assignableTo || viewingTheme.assignableTo.length === 0) && (
                    <span style={{ 
                      color: '#888', 
                      fontStyle: 'italic',
                      fontSize: 14
                    }}>Not specified</span>
                  )}
                </div>
              </div>
              
              {/* Keywords */}
              {(viewingTheme.keywords && viewingTheme.keywords.length > 0) && (
                <div style={{
                  background: '#f8f8f8',
                  borderRadius: 16,
                  padding: '20px',
                  border: '1px solid #f0f0f0'
                }}>
                  <h4 style={{ 
                    margin: '0 0 16px 0', 
                    fontSize: 13, 
                    color: '#666',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Keywords</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {viewingTheme.keywords.map((keyword, index) => (
                      <span 
                        key={index} 
                        style={{ 
                          backgroundColor: '#fff', 
                          color: '#555', 
                          padding: '6px 14px', 
                          borderRadius: 20, 
                          fontSize: 13, 
                          fontWeight: 500,
                          border: '1px solid #eee',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >{keyword}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ 
                marginTop: 8,
                paddingTop: 20,
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ 
                  fontSize: 13, 
                  color: '#888'
                }}>
                  Created: {viewingTheme.createdAt ? new Date(viewingTheme.createdAt).toLocaleString() : '-'}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button 
                    onClick={() => setViewingTheme(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      padding: '8px 16px',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      borderRadius: 8,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >Close</button>
                  <button 
                    onClick={() => { setViewingTheme(null); startEdit(viewingTheme); }}
                    style={{
                      background: '#552a47',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <span style={{ fontSize: 16 }}>✏️</span>
                    Edit Theme
                  </button>
                </div>
              </div>
              

            </div>
          </div>
        )}
        
        {/* List of themes */}
        {themes.length === 0 ? (
          <div style={{ color: '#8a7a85', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>No themes found.</div>
        ) : (
          <div style={{ 
            padding: '28px 24px', 
            margin: 0, 
            background: '#fffef6', 
            borderRadius: 16,
            boxShadow: '0 4px 12px rgba(85, 42, 71, 0.06)'
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

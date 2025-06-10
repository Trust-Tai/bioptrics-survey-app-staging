import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardBg from './DashboardBg';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '../../features/surveys/api/surveys';
import { FaEdit, FaTrash, FaEye, FaTasks, FaSearch, FaPlus, FaCopy, FaExternalLinkAlt, FaClock } from 'react-icons/fa';
import { useOrganization } from '/imports/features/organization/contexts/OrganizationContext';
import TermLabel from '../components/TermLabel';

interface SurveyDisplay {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  createdBy?: string;
  shareToken?: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

const AllSurveys: React.FC = () => {
  const navigate = useNavigate();
  const { getTerminology } = useOrganization();
  
  // Get the customized survey label
  const surveyLabel = getTerminology('surveyLabel');
  const surveyLabelPlural = `${surveyLabel}s`;
  const [confirmDelete, setConfirmDelete] = useState<{ _id: string; title: string } | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const surveys = useTracker(() => {
    Meteor.subscribe('surveys.all');
    return Surveys.find({}, { sort: { updatedAt: -1 } }).fetch().map((s: any) => ({
      ...s,
      createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
      updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : String(s.updatedAt),
    })) as SurveyDisplay[];
  }, []);

  const pageSize = 10;
  const filtered = surveys.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // Optionally, add handlers for edit, preview, and delete here

  return (
    <AdminLayout>
      <DashboardBg>
        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 2px 18px #552a4733',
              padding: '38px 40px 32px 40px',
              minWidth: 340,
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
              position: 'relative',
            }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#28211e' }}>Delete {surveyLabel}</h1>
              <div style={{ fontSize: 16, color: '#222', marginBottom: 12, textAlign: 'center' }}>
                Are you sure you want to delete <span style={{ fontWeight: 700 }}>'{confirmDelete.title}'</span>? This action cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 18 }}>
                <button
                  style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '8px 28px', fontSize: 16, cursor: 'pointer' }}
                  onClick={async () => {
                    try {
                      await Meteor.callAsync('surveys.remove', confirmDelete._id);
                      setNotification({ type: 'success', message: `${surveyLabel} deleted successfully.` });
                    } catch (err: any) {
                      setNotification({ type: 'error', message: `Error deleting ${surveyLabel.toLowerCase()}: ${err.reason || err.message || 'Unknown error'}` });
                    }
                    setConfirmDelete(null);
                  }}
                >
                  Delete
                </button>
                <button
                  style={{ background: '#fff', color: '#552a47', border: '2px solid #552a47', borderRadius: 8, fontWeight: 700, padding: '8px 28px', fontSize: 16, cursor: 'pointer' }}
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <div style={{ 
          width: '100%', 
          maxWidth: 1200, 
          margin: '0 auto', 
          borderRadius: 18, 
          padding: '24px 24px 40px 24px', 
          background: 'transparent',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#28211e' }}>All {surveyLabelPlural}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', minWidth: 280 }}>
              <FaSearch style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#552a47', opacity: 0.6 }} />
              <input
                type="text"
                placeholder={`Search ${surveyLabelPlural.toLowerCase()}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  height: 44,
                  fontSize: 16,
                  padding: '0 16px 0 42px',
                  borderRadius: 8,
                  border: '1.5px solid #e5d6c7',
                  width: '100%',
                  color: '#28211e',
                  fontWeight: 500,
                  outline: 'none',
                  background: '#fff',
                }}
              />
            </div>
            <button
              onClick={() => {
                window.location.href = '/admin/surveys/builder';
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 44, cursor: 'pointer' }}
            >
              <FaPlus style={{ fontSize: 14 }} />
              <span style={{ marginLeft: 6 }}>Add Survey</span>
            </button>
          </div>
          {/* Notification Bar */}
          {notification && (
            <div
              style={{
                position: 'fixed',
                top: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                background: notification.type === 'success' ? '#2ecc40' : '#e74c3c',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 16,
                zIndex: 2000,
                boxShadow: '0 2px 12px #552a4733',
                minWidth: 280,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <span style={{ flex: 1 }}>{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          )}
          {/* Survey List */}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', color: '#6e5a67' }}>No {surveyLabelPlural.toLowerCase()} found.</div>}
          {paginated.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '65px 24px',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden'
            }}>
              {paginated.map((s) => (
                <div
                  key={s._id}
                  style={{
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 4px 16px rgba(85, 42, 71, 0.08)',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                    height: '100%',
                    margin: 0,
                    border: '1px solid #f4ebf1',
                    width: '100%',
                    boxSizing: 'border-box',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(85, 42, 71, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(85, 42, 71, 0.08)';
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    marginTop: 12,
                    marginBottom: 8
                  }}>
                    <div style={{ 
                      background: s.published ? 'linear-gradient(135deg, #e6f8e0, #d7f9c8)' : 'linear-gradient(135deg, #ffe6e6, #ffcece)', 
                      color: s.published ? '#0a8043' : '#c0392b', 
                      borderRadius: 30, 
                      padding: '6px 14px', 
                      fontSize: 13, 
                      fontWeight: 700, 
                      letterSpacing: 0.3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        background: s.published ? '#0a8043' : '#c0392b',
                        marginRight: 2
                      }}></div>
                      {s.published ? 'Published' : 'Draft'}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 6,
                      color: '#777',
                      fontSize: 12,
                      fontWeight: 500,
                    }}>
                      <FaClock style={{ fontSize: 11 }} />
                      {new Date(s.updatedAt).toLocaleDateString()} at {new Date(s.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  <h3 
                    style={{ 
                      color: '#28211e', 
                      fontWeight: 700, 
                      fontSize: 20, 
                      letterSpacing: 0.2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      margin: '0 0 14px 0',
                      paddingRight: '20px',
                      borderLeft: '3px solid #552a47',
                      paddingLeft: '12px',
                      lineHeight: 1.3,
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      width: '100%',
                      boxSizing: 'border-box'
                    }} 
                    onClick={() => navigate(`/admin/surveys/manage/${s._id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#552a47';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#28211e';
                    }}
                    title="Click to manage this survey"
                  >
                    {s.title}
                  </h3>
                  <div style={{ 
                    color: '#6e5a67', 
                    fontSize: 15, 
                    flex: 1, 
                    lineHeight: 1.5,
                    backgroundColor: '#faf7f9',
                    padding: '12px 16px',
                    borderRadius: 8,
                    marginBottom: 16,
                    width: '100%',
                    boxSizing: 'border-box',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}>{truncate(stripHtml(s.description), 120)}</div>
                  {s.shareToken && s.published && (
                    <div style={{ 
                      marginTop: 'auto', 
                      padding: '14px 16px', 
                      borderTop: '1px solid #f4ebf1',
                      backgroundColor: '#f9f4f7',
                      borderRadius: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      width: '100%',
                      boxSizing: 'border-box',
                      maxWidth: '100%'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <span style={{ 
                          fontWeight: 600, 
                          color: '#552a47', 
                          fontSize: 14,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <FaExternalLinkAlt style={{ fontSize: 12 }} /> Public URL
                        </span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/survey/public/${s.shareToken}`);
                            setNotification({ type: 'success', message: 'URL copied to clipboard!' });
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#552a47',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 12px',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <FaCopy style={{ fontSize: 12 }} /> Copy URL
                        </button>
                      </div>
                      <div style={{ 
                        padding: '8px 12px', 
                        background: 'white', 
                        borderRadius: 6, 
                        border: '1px dashed #d7c5d3',
                        fontSize: 13,
                        color: '#552a47',
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}>
                        {`${window.location.origin}/survey/public/${s.shareToken}`}
                      </div>
                    </div>
                  )}
                   <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 'auto', paddingTop: s.shareToken && s.published ? 0 : 12, borderTop: s.shareToken && s.published ? 'none' : '1px solid #f4ebf1' }}>
                    <button
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      onClick={() => {
                        window.open(`/preview/survey/${s._id}?status=preview`, '_blank');
                      }}
                      title="Preview"
                    >
                      <FaEye style={{ color: '#552a47', fontSize: 20 }} />
                    </button>
                    <button
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/surveys/manage/${s._id}`)}
                      title="Manage"
                    >
                      <FaTasks style={{ color: '#552a47', fontSize: 20 }} />
                    </button>
                    <button
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/surveys/builder/${s._id}`)}
                      title="Edit"
                    >
                      <FaEdit style={{ color: '#552a47', fontSize: 20 }} />
                    </button>
                    <button
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      onClick={() => setConfirmDelete({ _id: s._id, title: s.title })}
                      title="Delete"
                    >
                      <FaTrash style={{ color: '#552a47', fontSize: 20 }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  background: page === i + 1 ? '#552a47' : '#f4ebf1',
                  color: page === i + 1 ? '#fff' : '#552a47',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 16px',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: page === i + 1 ? '0 2px 8px #552a4733' : 'none',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </DashboardBg>
    </AdminLayout>
  );
};

export default AllSurveys;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardBg from './DashboardBg';
import AdminLayout from './AdminLayout';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '/imports/api/surveys';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

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
              boxShadow: '0 2px 18px #b0802b33',
              padding: '38px 40px 32px 40px',
              minWidth: 340,
              maxWidth: '90vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
              position: 'relative',
            }}>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#b0802b', marginBottom: 10 }}>Delete Survey</div>
              <div style={{ fontSize: 16, color: '#222', marginBottom: 12, textAlign: 'center' }}>
                Are you sure you want to delete <span style={{ fontWeight: 700 }}>'{confirmDelete.title}'</span>? This action cannot be undone.
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 18 }}>
                <button
                  style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '8px 28px', fontSize: 16, cursor: 'pointer' }}
                  onClick={async () => {
                    try {
                      await Meteor.callAsync('surveys.remove', confirmDelete._id);
                      setNotification({ type: 'success', message: 'Survey deleted successfully.' });
                    } catch (err: any) {
                      setNotification({ type: 'error', message: err?.reason || 'Failed to delete survey.' });
                    }
                    setConfirmDelete(null);
                  }}
                >
                  Delete
                </button>
                <button
                  style={{ background: '#fff', color: '#b0802b', border: '2px solid #b0802b', borderRadius: 8, fontWeight: 700, padding: '8px 28px', fontSize: 16, cursor: 'pointer' }}
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <div style={{ maxWidth: 900, margin: '0 auto', borderRadius: 18, padding: '32px 32px 40px 32px', background: 'transparent' }}>
          <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 26, marginBottom: 24, letterSpacing: 0.2 }}>All Surveys</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Search surveys..."
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
            <button
              onClick={() => {
                window.location.href = '/admin/surveys/builder';
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 44, cursor: 'pointer' }}
            >
              <span style={{ fontSize: 20, marginRight: 2 }}>+</span>
              Add
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
                boxShadow: '0 2px 12px #b0802b33',
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
          {paginated.length === 0 ? (
            <div style={{ color: '#b3a08a', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>No surveys found.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {paginated.map((s) => (
                <div
                  key={s._id}
                  style={{
                    background: '#fffbe9',
                    borderRadius: 14,
                    boxShadow: '0 2px 8px #f4e6c1',
                    padding: '18px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{ background: s.published ? '#e6f8e0' : '#ffe6e6', color: s.published ? '#1da463' : '#e74c3c', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>
                      {s.published ? 'Published' : 'Draft'}
                    </span>
                    <span style={{ background: '#fbe7f6', color: '#a54c8c', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>
                      {new Date(s.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ color: '#28211e', fontWeight: 600, fontSize: 17, letterSpacing: 0.1 }}>
                    {s.title}
                  </div>
                  <div style={{ color: '#6e5a67', fontSize: 15 }}>{truncate(stripHtml(s.description), 120)}</div>
                  {s.shareToken && s.published && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontWeight: 400, color: '#222' }}>Sharable Link:</span>
                      <div style={{ marginTop: 6, wordBreak: 'break-all', fontWeight: 700 }}>
                        <a href={`${window.location.origin}/survey/public/${s.shareToken}`} target="_blank" rel="noopener noreferrer">{`${window.location.origin}/survey/public/${s.shareToken}`}</a>
                      </div>
                    </div>
                  )}
                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14, marginTop: 8 }}>
                    <button
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      onClick={() => {
                        window.open(`/preview/survey/${s._id}?status=preview`, '_blank');
                      }}
                      title="Preview"
                    >
                      <FaEye style={{ color: '#b0802b', fontSize: 18 }} />
                    </button>
                    <button
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/surveys/builder/${s._id}`)}
                      title="Edit"
                    >
                      <FaEdit style={{ color: '#b0802b', fontSize: 18 }} />
                    </button>
                    <button
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      onClick={() => setConfirmDelete({ _id: s._id, title: s.title })}
                      title="Delete"
                    >
                      <FaTrash style={{ color: '#b0802b', fontSize: 18 }} />
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
                  background: page === i + 1 ? '#b0802b' : '#f4e6c1',
                  color: page === i + 1 ? '#fff' : '#b0802b',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 16px',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: page === i + 1 ? '0 2px 8px #b0802b33' : 'none',
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
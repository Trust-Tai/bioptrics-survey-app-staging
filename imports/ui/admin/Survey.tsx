import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import DashboardBg from './DashboardBg';

interface Survey {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

// For demo: use localStorage for persistence
function getAllSurveys(): Survey[] {
  try {
    const data = localStorage.getItem('surveys');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function saveSurveys(surveys: Survey[]) {
  localStorage.setItem('surveys', JSON.stringify(surveys));
}

const SurveyPage: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editSurvey, setEditSurvey] = useState<Survey | null>(null);
  const [form, setForm] = useState({ title: '', description: '' });

  useEffect(() => {
    setSurveys(getAllSurveys());
    // Listen for localStorage changes (e.g., when admin publishes a new survey)
    function handleStorage(e: StorageEvent) {
      if (e.key === 'surveys') {
        setSurveys(getAllSurveys());
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function handleSave() {
    if (!form.title.trim()) return;
    let updated;
    if (editSurvey) {
      updated = surveys.map(s => s.id === editSurvey.id ? { ...editSurvey, ...form } : s);
    } else {
      updated = [
        {
          id: Date.now().toString(),
          title: form.title,
          description: form.description,
          createdAt: new Date().toISOString(),
        },
        ...surveys,
      ];
    }
    saveSurveys(updated);
    setSurveys(updated);
    setShowModal(false);
    setEditSurvey(null);
    setForm({ title: '', description: '' });
  }

  function handleDelete(id: string) {
    const updated = surveys.filter(s => s.id !== id);
    saveSurveys(updated);
    setSurveys(updated);
  }

  function handleEdit(survey: Survey) {
    setEditSurvey(survey);
    setForm({ title: survey.title, description: survey.description });
    setShowModal(true);
  }

  const filtered = surveys.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <DashboardBg>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 0', background: '#fff8ee', borderRadius: 24, minHeight: '100vh' }}>
        {/* Title and Add Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 28, margin: 0, letterSpacing: 0.2 }}>Surveys</h2>
          <button
            style={{
              background: '#fff', color: '#552a47', border: '2px solid #552a47', borderRadius: '50%', width: 44, height: 44, fontWeight: 900, fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #f4ebf1', outline: 'none', transition: 'background 0.2s', marginLeft: 12
            }}
            onClick={() => { setShowModal(true); setEditSurvey(null); setForm({ title: '', description: '' }); }}
            title="Add New Survey"
          >
            <span style={{ fontSize: 32, marginTop: -2 }}>+</span>
          </button>
        </div>
        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 14, top: 11, color: '#8a7a85', fontSize: 18 }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input
              type="text"
              placeholder="Search surveys..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '10px 16px 10px 40px', borderRadius: 12, border: '1.5px solid #e5d6c7', fontSize: 16, background: '#fff', outline: 'none', color: '#28211e', fontWeight: 500
              }}
            />
          </div>
        </div>
        {/* Surveys List */}
        {filtered.length === 0 ? (
          <div style={{ color: '#8a7a85', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>No surveys available.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {filtered.map(s => (
              <div
                key={s.id}
                style={{
                  background: '#f9f4f7',
                  borderRadius: 14,
                  boxShadow: '0 2px 8px #f4ebf1',
                  padding: '18px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  position: 'relative'
                }}
              >
                <div style={{ color: '#28211e', fontWeight: 600, fontSize: 17, letterSpacing: 0.1, marginBottom: 3 }}>
                  {s.title}
                </div>
                <div style={{ color: '#6e5a67', fontSize: 15 }}>{s.description}</div>
                <div style={{ position: 'absolute', right: 18, top: 18, display: 'flex', gap: 10 }}>
                  <button onClick={() => handleEdit(s)} style={{ background: 'none', border: 'none', color: '#552a47', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Edit</button>
                  <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', color: '#c0392b', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Modal for Add/Edit Survey */}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '2rem 2.5rem', minWidth: 340, boxShadow: '0 4px 24px #e5d6c1', position: 'relative' }}>
              <h3 style={{ color: '#552a47', fontWeight: 800, fontSize: 21, marginBottom: 16 }}>{editSurvey ? 'Edit Survey' : 'Add New Survey'}</h3>
              <label style={{ display: 'block', marginBottom: 10, color: '#552a47', fontWeight: 600 }}>
                Title
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, marginTop: 4 }}
                  autoFocus
                />
              </label>
              <label style={{ display: 'block', marginBottom: 20, color: '#552a47', fontWeight: 600 }}>
                Description
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, marginTop: 4, minHeight: 70, resize: 'vertical' }}
                />
              </label>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowModal(false); setEditSurvey(null); }} style={{ background: '#f7f2f5', border: 'none', color: '#552a47', fontWeight: 700, borderRadius: 8, padding: '10px 20px', fontSize: 15, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} style={{ background: '#552a47', border: 'none', color: '#fff', fontWeight: 700, borderRadius: 8, padding: '10px 22px', fontSize: 15, cursor: 'pointer' }}>{editSurvey ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
      </DashboardBg>
    </AdminLayout>
  );
};

export default SurveyPage;

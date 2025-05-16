import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

interface Question {
  text: string;
  theme: string;
  wpsCategory: string;
  queType: string;
}


// For now, we'll use localStorage to persist questions between pages as a simple demo
function getAllQuestions(): Question[] {
  try {
    const data = localStorage.getItem('questions');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Tag color definitions
const TAG_COLORS: Record<string, string> = {
  THEME: '#e6e6fa', // light purple
  WPS: '#e0f7fa',   // light blue
  TYPE: '#fff5e1',  // light orange
};
const TAG_TEXT_COLORS: Record<string, string> = {
  THEME: '#a54c8c',
  WPS: '#3776a8',
  TYPE: '#b0802b',
};


const AllQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    setQuestions(getAllQuestions());
    // Listen for changes from QuestionBank page
    const handler = () => setQuestions(getAllQuestions());
    window.addEventListener('questionsUpdated', handler);
    return () => window.removeEventListener('questionsUpdated', handler);
  }, []);

  // Show all questions (no filtering)
  const filtered = questions;

  // --- Question statistics ---
  const questionCount = questions.length;
  // For demo: count unique question types
  const typeCounts: Record<string, number> = {};
  questions.forEach(q => {
    typeCounts[q.queType] = (typeCounts[q.queType] || 0) + 1;
  });

  return (
    <AdminLayout>
      <div style={{ width: '100%', padding: '32px 0', background: '#fff', borderRadius: 0, minHeight: '100vh', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 18, padding: '32px 32px 40px 32px' }}>
          {/* Title and Add Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 26, marginBottom: 0, letterSpacing: 0.2 }}>Question Bank</h2>
          </div>
          {/* Search Bar + Add Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Search questions..."
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
                flex: 1,
                maxWidth: 350,
              }}
            />
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#fff',
                color: '#b0802b',
                border: '2px solid #b0802b',
                borderRadius: 12,
                height: 44,
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer',
                padding: '0 22px',
                outline: 'none',
                transition: 'background 0.2s',
                marginLeft: 18,
                boxShadow: '0 2px 8px #f4e6c1',
              }}
              onClick={() => navigate('/admin/questions/builder')}
              title="Add New Question"
            >
              <span style={{ fontSize: 28, marginTop: -2, fontWeight: 900 }}>+</span>
              <span style={{ fontSize: 18, fontWeight: 700 }}>Add New Question</span>
            </button>
          </div>
          {/* Questions List */}
          {filtered.length === 0 ? (
            <div style={{ color: '#b3a08a', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>No questions available.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {filtered.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#fffbe9',
                    borderRadius: 14,
                    boxShadow: '0 2px 8px #f4e6c1',
                    padding: '18px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span style={{ background: '#fbe7f6', color: '#a54c8c', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>{q.theme}</span>
                    <span style={{ background: '#e4f0fa', color: '#3776a8', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>{q.wpsCategory}</span>
                    <span style={{ background: '#fff5e1', color: '#b0802b', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>{q.queType}</span>
                  </div>
                  <div style={{ color: '#28211e', fontWeight: 600, fontSize: 17, letterSpacing: 0.1 }}>
                    Q. {q.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AllQuestions;

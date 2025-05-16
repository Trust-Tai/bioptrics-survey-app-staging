import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Questions } from '/imports/api/questions';
import { WPSCategories } from '/imports/api/wpsCategories';
import { SurveyThemes } from '/imports/api/surveyThemes';
import QuestionPreviewModal from './QuestionPreviewModal';

// This interface is for display only, based on the latest version of each question
interface DisplayQuestion {
  _id: string;
  text: string;
  theme: string;
  wpsCategory: string;
  queType: string;
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
  const [search, setSearch] = React.useState('');

  // Fetch all categories and themes
  const wpsCategories = useTracker(() => {
    Meteor.subscribe('wpsCategories.all');
    return WPSCategories.find().fetch();
  }, []);
  const surveyThemes = useTracker(() => {
    Meteor.subscribe('surveyThemes.all');
    return SurveyThemes.find().fetch();
  }, []);

  // Build lookup maps
  const wpsCategoryMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    wpsCategories.forEach((cat: any) => { map[cat._id] = cat.name; });
    return map;
  }, [wpsCategories]);
  const surveyThemeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    surveyThemes.forEach((theme: any) => { map[theme._id] = theme.name; });
    return map;
  }, [surveyThemes]);

  // Subscribe to MongoDB Questions collection
  const questions = useTracker(() => {
    Meteor.subscribe('questions.all');
    // Fetch all questions, map to display format using latest version
    return Questions.find({}, { sort: { createdAt: -1 } }).fetch().map((doc: any) => {
      const latest = doc.versions && doc.versions.length > 0 ? doc.versions[doc.versions.length - 1] : {};
      // Map theme and category IDs to names
      let themeNames = '';
      if (latest.surveyThemes && latest.surveyThemes.length > 0) {
        themeNames = latest.surveyThemes.map((id: string) => surveyThemeMap[id] || id).join(', ');
      }
      let wpsCategoryNames = '';
      if (latest.categoryTags && latest.categoryTags.length > 0) {
        wpsCategoryNames = latest.categoryTags.map((id: string) => wpsCategoryMap[id] || id).join(', ');
      }
      return {
        _id: doc._id,
        text: latest.questionText || '',
        theme: themeNames,
        wpsCategory: wpsCategoryNames,
        queType: latest.responseType || '',
      };
    });
  }, [surveyThemeMap, wpsCategoryMap]);

  // Filter by search
  const filtered = questions.filter(q =>
    q.text.toLowerCase().includes(search.toLowerCase()) ||
    q.theme.toLowerCase().includes(search.toLowerCase()) ||
    q.wpsCategory.toLowerCase().includes(search.toLowerCase()) ||
    q.queType.toLowerCase().includes(search.toLowerCase())
  );

  // --- Question statistics ---
  const questionCount = questions.length;
  // Count unique question types
  const typeCounts: Record<string, number> = {};
  questions.forEach(q => {
    typeCounts[q.queType] = (typeCounts[q.queType] || 0) + 1;
  });

  // Preview modal state
  const [previewQ, setPreviewQ] = React.useState<DisplayQuestion|null>(null);
  // Delete confirmation state
  // Delete confirmation state: null or the question to delete
  const [confirmDelete, setConfirmDelete] = React.useState<{ _id: string; text: string } | null>(null);
  // Alert state for delete
  const [alert, setAlert] = React.useState<{ type: 'success'|'error', message: string }|null>(null);

  function showSuccess(msg: string) {
    setAlert({ type: 'success', message: msg });
    setTimeout(() => setAlert(null), 2500);
  }
  function showError(msg: string) {
    setAlert({ type: 'error', message: msg });
    setTimeout(() => setAlert(null), 3500);
  }

  // Delete handler (open confirm)
  function handleDelete(id: string, text: string) {
    setConfirmDelete({ _id: id, text });
  }

  // Confirm delete action (Meteor callback style)
  function confirmDeleteQuestion() {
    if (!confirmDelete) return;
    Meteor.call('questions.delete', confirmDelete._id, (err: any) => {
      if (err) showError('Failed to delete: ' + (err.reason || err.message || 'Unknown error'));
      else showSuccess('Question deleted');
      setConfirmDelete(null);
    });
  }

  // Edit handler (navigate to builder with id)
  function handleEdit(id: string) {
    navigate(`/admin/questions/builder?edit=${id}`);
  }

  // Preview handler
  function handlePreview(q: DisplayQuestion) {
    setPreviewQ(q);
  }

  return (
    <>
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
                  key={q._id || idx}
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
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button
                      style={{ background: '#f2f2f2', color: '#b0802b', border: '1.5px solid #b0802b', borderRadius: 8, padding: '5px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
                      onClick={() => handleEdit(q._id)}
                      title="Edit"
                    >Edit</button>
                    <button
                      style={{ background: '#fff', color: '#e74c3c', border: '1.5px solid #e74c3c', borderRadius: 8, padding: '5px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
                      onClick={() => handleDelete(q._id, q.text)}
                      title="Delete"
                    >Delete</button>
                    <button
                      style={{ background: '#1da463', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
                      onClick={() => handlePreview(q)}
                      title="Preview"
                    >Preview</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>

    {/* Delete Confirmation Modal (always rendered at root) */}
    {/*
      The modal is only rendered when confirmDelete is not null,
      so it is safe to access confirmDelete.text below.
    */}
    {confirmDelete && (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.22)', zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '38px 36px 28px 36px', minWidth: 320, maxWidth: 400, boxShadow: '0 6px 32px #b0802b33', position: 'relative' }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#b0802b', marginBottom: 14 }}>Delete Question?</div>
          <div style={{ color: '#28211e', marginBottom: 22 }}>
            Are you sure you want to delete this question?<br/>
            <span style={{ fontWeight: 600, color: '#b0802b' }}>
              "{confirmDelete!.text}"
            </span><br/>
            This action cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
            <button
              style={{ background: '#f2f2f2', color: '#28211e', border: '1.5px solid #b3a08a', borderRadius: 8, padding: '6px 22px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
              onClick={() => setConfirmDelete(null)}
            >Cancel</button>
            <button
              style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 22px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
              onClick={confirmDeleteQuestion}
            >Delete</button>
          </div>
        </div>
      </div>
    )}

    {/* Alert */}
    {alert && (
      <div style={{
        position: 'fixed', top: 28, left: '50%', transform: 'translateX(-50%)',
        background: alert.type === 'success' ? '#1da463' : '#e74c3c', color: '#fff',
        padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: 16, zIndex: 20000, boxShadow: '0 2px 12px #b0802b33'
      }}>{alert.message}</div>
    )}
    </>
  );
};

export default AllQuestions;

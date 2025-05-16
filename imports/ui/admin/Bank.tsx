import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useTracker } from 'meteor/react-meteor-data';

interface QuestionVersion {
  version: number;
  questionText: string;
  description: string;
  responseType: string;
  category: string;
  adminNotes?: string;
  answerMetadata?: Record<string, string>;
  updatedAt: string;
  updatedBy: string;
  wpsZones?: string[];
  language?: string;
  surveyThemes?: string[];
}

interface QuestionDoc {
  _id?: string;
  currentVersion: number;
  versions: QuestionVersion[];
  createdAt: string;
  createdBy: string;
}

function getInitialCategories() {
  const stored = localStorage.getItem('categories');
  return stored ? JSON.parse(stored) : ['Engagement', 'Leadership', 'Accountability', 'Wellness', 'Communication', 'Safety', 'Recognition', 'Pride'];
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // You can log error info here
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 24 }}><b>Something went wrong:</b> {String(this.state.error)}</div>;
    }
    return this.props.children;
  }
}

const Bank: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', ...getInitialCategories()];

  // Dynamically import the Questions collection for client-side use
  const [QuestionsCollection, setQuestionsCollection] = useState<any>(null);
  React.useEffect(() => {
    import('../../api/questions').then(mod => {
      setQuestionsCollection(mod.Questions);
    });
  }, []);

  const questions: QuestionDoc[] = useTracker(() => {
    if (!QuestionsCollection) return [];
    Meteor.subscribe('questions.all');
    return QuestionsCollection.find().fetch();
  }, [QuestionsCollection]);

  // Filter questions by selected category
  React.useEffect(() => {
    // Debug: log questions
    // eslint-disable-next-line no-console
    console.log('Bank questions:', questions);
  }, [questions]);

  const filteredQuestions = selectedCategory === 'All'
    ? questions
    : questions.filter(q => {
        const current = q.versions && q.versions.length > 0 ? q.versions[q.versions.length - 1] : null;
        return current && current.category === selectedCategory;
      });

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
          <h2 style={{ fontWeight: 700, color: '#552a47', fontSize: 28, marginBottom: 24 }}>Question Bank</h2>
          <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: selectedCategory === cat ? '2px solid #552a47' : '1px solid #d2d6dc',
                  background: selectedCategory === cat ? '#f7f2f5' : '#fff',
                  color: '#552a47',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  cursor: 'pointer',
                  marginBottom: 4,
                  fontSize: 16,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div>
            {filteredQuestions.length === 0 ? (
              <div style={{ color: '#888', fontStyle: 'italic', marginTop: 24 }}>No questions in this category.</div>
            ) : (
              <div style={{ overflowX: 'auto', marginTop: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, boxShadow: '0 1px 8px rgba(85,42,71,0.04)' }}>
                  <thead>
                    <tr style={{ background: '#f7f2f5' }}>
                      <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, color: '#552a47', fontSize: 16 }}>Questions</th>
                      <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, color: '#552a47', fontSize: 16 }}>Created</th>
                      <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, color: '#552a47', fontSize: 16 }}>Category</th>
                      <th style={{ textAlign: 'left', padding: '12px 10px', fontWeight: 700, color: '#552a47', fontSize: 16 }}>Type</th>
                      <th style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 700, color: '#552a47', fontSize: 16 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuestions.map((q, idx) => (
                      <QuestionItem key={q._id || idx} q={q} categories={categories} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
};

// --- QuestionItem component ---
interface QuestionItemProps {
  q: QuestionDoc;
  categories: string[];
}
const QuestionItem: React.FC<QuestionItemProps> = ({ q, categories }) => {
  const current = q.versions && q.versions.length > 0 ? q.versions[q.versions.length - 1] : null;
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(current?.questionText || '');
  const [editDescription, setEditDescription] = React.useState(current?.description || '');
  const [editCategory, setEditCategory] = React.useState(current?.category || '');
  const [editResponseType, setEditResponseType] = React.useState(current?.responseType || 'Short text');
  const [editOptions, setEditOptions] = React.useState((current as any)?.options || []);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
  // Batch 2: WPS Zone, Survey Theme, Language
  const [editWpsZones, setEditWpsZones] = React.useState<string[]>(current?.wpsZones || []);
  const [editSurveyThemes, setEditSurveyThemes] = React.useState<string[]>(current?.surveyThemes || []);
  const [editLanguage, setEditLanguage] = React.useState<string>(current?.language || 'EN');

  // Format createdAt timestamp
  let createdAtString = '';
  if (q.createdAt) {
    const date = new Date(q.createdAt);
    createdAtString = date.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  if (!current) return null;
  return isEditing ? (
    <tr style={{ background: '#f7f2f5' }}>
      <td colSpan={5} style={{ padding: '18px 12px' }}>
        <form
          onSubmit={async e => {
            e.preventDefault();
            setSaving(true);
            setError('');
            Meteor.call(
              'questions.update',
              q._id,
              {
                questionText: editText,
                description: editDescription.replace(/<[^>]+>/g, ''),
                responseType: editResponseType,
                category: editCategory,
                options: editOptions,
                wpsZones: editWpsZones,
                surveyThemes: editSurveyThemes,
                language: editLanguage,
              },
              localStorage.getItem('admin_jwt'),
              (err: any) => {
                setSaving(false);
                if (err) setError(err.reason || 'Update failed');
                else setIsEditing(false);
              }
            );
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <input value={editText} onChange={e => setEditText(e.target.value)} style={{ fontWeight: 600, fontSize: 16, color: '#552a47', marginBottom: 6 }} required />
          <div style={{ position: 'relative', marginBottom: 6 }}>
            <textarea value={editDescription} maxLength={280} onChange={e => setEditDescription(e.target.value.replace(/<[^>]+>/g, ''))} style={{ fontSize: 14, width: '100%', minHeight: 48, paddingRight: 60 }} />
            <span style={{ position: 'absolute', right: 8, bottom: 6, fontSize: 12, color: editDescription.length > 270 ? '#e74c3c' : '#888' }}>{editDescription.length}/280</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ flex: 1 }}>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select value={editResponseType} onChange={e => setEditResponseType(e.target.value)} style={{ flex: 1 }}>
              {['Short text','Long text','Likert 1-5','Likert 1-7','Yes/No','N-choice (radio)','Multi-select (checkbox)'].map(rt => (
                <option key={rt} value={rt}>{rt}</option>
              ))}
            </select>
          </div>
          {(editResponseType === 'Likert 1-5' || editResponseType === 'Likert 1-7') && (
            <div style={{ marginTop: 8, background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: 6, padding: '8px 12px', fontSize: 14 }}>
              {editResponseType === 'Likert 1-5' && (
                <div>Scale: 1 – 2 – 3 – 4 – 5</div>
              )}
              {editResponseType === 'Likert 1-7' && (
                <div>Scale: 1 – 2 – 3 – 4 – 5 – 6 – 7</div>
              )}
              <div style={{ color: '#888', fontSize: 13 }}>Preview: Please select your level of agreement</div>
            </div>
          )}
          {['Dropdown','Checkboxes','Radio'].includes(editResponseType) && (
            <input
              type="text"
              placeholder="Comma-separated options"
              value={Array.isArray(editOptions) ? editOptions.join(',') : ''}
              onChange={e => setEditOptions(e.target.value.split(',').map(o => o.trim()).filter(Boolean))}
              style={{ marginBottom: 6 }}
            />
          )}
          {/* Batch 2: WPS Zone multi-select */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14, color: '#552a47', minWidth: 100 }}>WPS Zone:</label>
            <select multiple value={editWpsZones} onChange={e => setEditWpsZones(Array.from(e.target.selectedOptions, opt => opt.value))} style={{ flex: 1, minHeight: 36 }}>
              {['Workplace', 'Personal', 'Social'].map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
          {/* Batch 2: Survey Theme multi-select */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14, color: '#552a47', minWidth: 100 }}>Survey Theme:</label>
            <select multiple value={editSurveyThemes} onChange={e => setEditSurveyThemes(Array.from(e.target.selectedOptions, opt => opt.value))} style={{ flex: 1, minHeight: 36 }}>
              {['Safety', 'Engagement', 'Leadership', 'Accountability', 'Wellness', 'Communication', 'Recognition', 'Pride'].map(theme => (
                <option key={theme} value={theme}>{theme}</option>
              ))}
            </select>
          </div>
          {/* Batch 2: Language dropdown */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14, color: '#552a47', minWidth: 100 }}>Language:</label>
            <select value={editLanguage} onChange={e => setEditLanguage(e.target.value)} style={{ flex: 1, minHeight: 36 }}>
              {['EN', 'FR'].map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          {error && <div style={{ color: 'red', fontSize: 13 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
            <button type="submit" disabled={saving} style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600 }}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#eee', color: '#552a47', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600 }}>Cancel</button>
          </div>
        </form>
      </td>
    </tr>
  ) : (
    <tr style={{ borderBottom: '1px solid #f0e7ef' }}>
      <td style={{ padding: '12px 10px', fontWeight: 600, color: '#552a47', fontSize: 16, maxWidth: 320, wordBreak: 'break-word' }}>
        {current.questionText}
        {current.description && (
          <div style={{ color: '#333', fontSize: 13, marginTop: 4, whiteSpace: 'pre-line' }}>{current.description.replace(/<[^>]+>/g, '')}</div>
        )}
      </td>
      <td style={{ padding: '12px 10px', color: '#552a47', fontSize: 15 }}>{createdAtString}</td>
      <td style={{ padding: '12px 10px', color: '#552a47', fontSize: 15 }}>{current.category}</td>
      <td style={{ padding: '12px 10px', color: '#552a47', fontSize: 15 }}>{current.responseType}</td>
      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={() => setIsEditing(true)} style={{ background: '#f6d365', color: '#552a47', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600 }}>Edit</button>
          <button onClick={() => setShowConfirmDelete(true)} style={{ background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600 }}>Delete</button>
        </div>
        {showConfirmDelete && (
          <div style={{ background: '#fffbe0', border: '1px solid #e57373', borderRadius: 6, padding: 12, marginTop: 10, zIndex: 10, position: 'absolute', right: 0, minWidth: 200 }}>
            <div style={{ color: '#e57373', fontWeight: 600, marginBottom: 8 }}>Are you sure you want to delete this question?</div>
            <button
              onClick={() => {
                Meteor.call('questions.delete', q._id, (err: any) => {
                  setShowConfirmDelete(false);
                  if (err) alert(err.reason || 'Delete failed');
                });
              }}
              style={{ background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600, marginRight: 8 }}
            >Yes, Delete</button>
            <button onClick={() => setShowConfirmDelete(false)} style={{ background: '#eee', color: '#552a47', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600 }}>Cancel</button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default Bank;


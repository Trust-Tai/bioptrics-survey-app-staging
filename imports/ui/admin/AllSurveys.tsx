import React, { useState, ChangeEvent, useEffect } from 'react';
import AdminLayout from './AdminLayout';

import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Questions } from '/imports/api/questions';
import { Surveys } from '/imports/api/surveys';
import SurveySectionQuestionDropdown, { QuestionOption } from './SurveySectionQuestionDropdown';
import DraggableQuestionList from './DraggableQuestionList';

interface Survey {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
} // _id for MongoDB

// For demo: use localStorage for persistence
function getAllSurveys(): Survey[] {
  try {
    const data = localStorage.getItem('surveys');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Simple image input with preview and remove button
const ImageInput: React.FC<{
  value: string | null;
  onChange: (file: File | null) => void;
  onRemove: () => void;
  placeholder?: string;
}> = ({ value, onChange, onRemove, placeholder }) => {
  const fileInput = React.useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        style={{
          background: '#e5d6c7',
          color: '#28211e',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          padding: '6px 16px',
          fontSize: 15,
          cursor: 'pointer',
        }}
      >
        {value ? 'Change' : 'Select'} Image
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files && e.target.files[0];
          onChange(file || null);
        }}
      />
      {value && (
        <>
          <img src={value} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #b0802b' }} />
          <button
            type="button"
            onClick={onRemove}
            style={{ marginLeft: 8, color: '#e74c3c', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 15 }}
          >
            Remove
          </button>
        </>
      )}
      {!value && (
        <span style={{ color: '#b3a08a', fontSize: 14 }}>{placeholder}</span>
      )}
    </div>
  );
};

// Demo demographic questions (replace with your actual questions or fetch from DB)
const demoDemographicQuestions = [
  { value: 'age', label: 'Age' },
  { value: 'gender', label: 'Gender' },
  { value: 'ethnicity', label: 'Ethnicity' },
  { value: 'tenure', label: 'Tenure at Company' },
  { value: 'role', label: 'Role/Position' },
];

// ErrorBoundary to catch rendering errors
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
    console.error('AllSurveys ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 24, textAlign: 'center' }}><b>Something went wrong loading the survey list:</b><br/>{String(this.state.error)}</div>;
    }
    return this.props.children;
  }
}

const AllSurveys: React.FC = () => {
  // Fetch all published questions from the Questions collection
  const questions = useTracker(() => {
    Meteor.subscribe('questions.all');
    return Questions.find().fetch();
  }, []);

  // Only show published questions in the dropdown (latest version must have published === true)
  const questionOptions: QuestionOption[] = questions
    .map((q: any) => {
      const latest = q.versions && q.versions.length > 0 ? q.versions[q.versions.length - 1] : null;
      if (latest && latest.published === true && latest.questionText) {
        return { value: q._id, label: latest.questionText };
      }
      return null;
    })
    .filter((opt): opt is QuestionOption => !!opt);

  // Fetch all surveys from MongoDB reactively
  const surveys: Survey[] = useTracker(() => {
    Meteor.subscribe('surveys.all');
    return Surveys.find({}, { sort: { createdAt: -1 } })
      .fetch()
      .map((doc: any) => ({
        ...doc,
        createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
      })) as Survey[];
  }, []);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  // Store selected questions per section
  const [selectedQuestions, setSelectedQuestions] = useState<{ [sectionIdx: number]: QuestionOption[] }>({});
  // Store selected demographic questions (by value)
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([]);

  // Welcome screen image previews
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Handlers for logo
  const handleLogoChange = (file: File | null) => {
    if (!file) {
      setLogoPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };
  const handleLogoRemove = () => setLogoPreview(null);

  // Handlers for featured image
  const handleFeaturedChange = (file: File | null) => {
    if (!file) {
      setFeaturedPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setFeaturedPreview(reader.result as string);
    reader.readAsDataURL(file);
  };
  const handleFeaturedRemove = () => setFeaturedPreview(null);
  const [step, setStep] = useState(0);
  // Define the survey steps as per user requirements
  const steps = [
    { label: 'Welcome Screen' },
    { label: 'Engagement/Manager Relationships' },
    { label: 'Peer/Team Dynamics' },
    { label: 'Feedback & Communication Quality' },
    { label: 'Recognition and Pride' },
    { label: 'Safety & Wellness Indicators' },
    { label: 'Site-specific open text boxes' },
    { label: 'Optional Demographics' },
  ];



  const filtered = surveys.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1); // Reset to first page when search changes
  }, [search]);

  // Fallback if surveys cannot be loaded
  const surveysLoadError = !Array.isArray(surveys);

  return (
    <AdminLayout>
      <div style={{ width: '100%', padding: '32px 32px 32px 32px', background: '#fff8ee', borderRadius: 0, minHeight: '100vh', boxSizing: 'border-box' }}>
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
              setForm({ title: '', description: '' });
              setShowModal(true);
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
        {/* Survey List Table */}
        <div style={{ marginTop: 24 }}>
          <ErrorBoundary>
            {surveysLoadError ? (
              <div style={{ color: 'red', fontWeight: 600, textAlign: 'center', marginTop: 40 }}>
                Unable to load surveys. Please check your database connection or try again later.
              </div>
            ) : paginated.length === 0 ? (
              <div style={{ color: '#b3a08a', fontWeight: 600, textAlign: 'center', marginTop: 40 }}>
                No surveys found.
              </div>
            ) : (
              <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e5d6c7', marginTop: 16 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#b0802b', fontWeight: 800 }}>Title</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#b0802b', fontWeight: 800 }}>Description</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', color: '#b0802b', fontWeight: 800 }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(survey => (
                    <tr key={survey._id}>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>{survey.title}</td>
                      <td style={{ padding: '12px 16px' }}>{survey.description}</td>
                      <td style={{ padding: '12px 16px', color: '#b3a08a' }}>
                        {survey.createdAt
                           ? new Date(survey.createdAt).toLocaleString()
                           : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ErrorBoundary>
        </div>
        {/* Add Survey Modal */}
        {showModal && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(40,33,30,0.15)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (step < steps.length - 1) {
                  setStep(step + 1);
                  return;
                }
                if (!form.title.trim()) {
                  setNotification({ type: 'error', message: 'Title is required to publish the survey.' });
                  return;
                }
                // Combine all selected questions and selected demographic questions
                const questionIds = Object.values(selectedQuestions).flat().map(q => q.value);
                if (questionIds.length === 0) {
                  setNotification({ type: 'error', message: 'You must select at least one real question to publish the survey.' });
                  return;
                }
                const newSurvey = {
                  title: form.title,
                  description: form.description,
                  questions: questionIds // Only valid question IDs
                };
                // Debug: log the survey object being sent
                console.log('Publishing survey:', newSurvey);
                Meteor.call('surveys.insert', newSurvey, (err: any, surveyId: string) => {
                  if (err) {
                    setNotification({ type: 'error', message: 'Failed to publish survey: ' + err.reason });
                    return;
                  }
                  setShowModal(false);
                  setForm({ title: '', description: '' });
                  setStep(0);
                  setNotification({ type: 'success', message: `Survey published! Shareable link: /survey/${surveyId}` });
                  setTimeout(() => setNotification(null), 6000);
                });
              }}
              style={{ background: '#fff', borderRadius: 14, padding: 32, width: '80%', maxWidth: 900, minHeight: 220, boxShadow: '0 4px 32px #b0802b33', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}
            >
              {/* Close Button */}
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'none',
                  border: 'none',
                  color: '#b0802b',
                  fontWeight: 900,
                  fontSize: 26,
                  cursor: 'pointer',
                  zIndex: 1100,
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
              {/* Modal Content (step tabs, fields, etc) */}
              <div style={{
                display: 'flex',
                gap: 0,
                marginBottom: 22,
                justifyContent: 'center',
                borderBottom: '2px solid #e5d6c7',
                overflowX: 'auto',
                background: '#fff8ee',
                borderRadius: 12,
              }}>
                {steps.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStep(i)}
                    style={{
                      background: step === i ? '#fff' : 'transparent',
                      color: step === i ? '#b0802b' : '#b3a08a',
                      border: 'none',
                      borderBottom: step === i ? '4px solid #b0802b' : '4px solid transparent',
                      fontWeight: step === i ? 800 : 600,
                      fontSize: 15,
                      padding: '12px 22px',
                      cursor: step === i ? 'default' : 'pointer',
                      outline: 'none',
                      transition: 'all 0.18s',
                      borderRadius: '12px 12px 0 0',
                    }}
                    disabled={step === i}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#b0802b', fontSize: 22 }}>Add New Survey</h3>
              {step === 0 && (
                <div>
                  <div style={{ color: '#b0802b', textAlign: 'center', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
                    Welcome Screen
                  </div>
                  <div style={{ color: '#6e5a67', textAlign: 'center', fontWeight: 500, fontSize: 15, marginBottom: 20 }}>
                    Enter the survey's welcome details below.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Logo upload with preview */}
                    <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>
                      Logo
                      <ImageInput
                        value={logoPreview}
                        onChange={handleLogoChange}
                        onRemove={handleLogoRemove}
                        placeholder="Upload logo"
                      />
                    </label>
                    {/* Featured Image upload with preview */}
                    <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>
                      Featured Image
                      <ImageInput
                        value={featuredPreview}
                        onChange={handleFeaturedChange}
                        onRemove={handleFeaturedRemove}
                        placeholder="Upload featured image"
                      />
                    </label>
                    <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>
                      Title
                      <input
                        type="text"
                        placeholder="Enter title..."
                        style={{ width: '100%', marginTop: 6, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                      />
                    </label>
                    <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>
                      Welcome Description
                      <textarea
                        placeholder="Enter a welcome message or description..."
                        style={{ width: '100%', marginTop: 6, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60 }}
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                      />
                    </label>
                    <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>
                      Primary Color
                      <input type="color" style={{ marginLeft: 12, width: 36, height: 36, border: 'none', background: 'none', verticalAlign: 'middle' }} />
                    </label>
                  </div>
                </div>
              )}
              {step > 0 && step < steps.length && (
                <div>
                  <div style={{ color: '#b0802b', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>{steps[step].label}</div>
                  <SurveySectionQuestionDropdown
                    sectionLabel={steps[step].label}
                    options={questionOptions}
                    selected={selectedQuestions[step] || []}
                    onChange={opts => setSelectedQuestions(prev => ({ ...prev, [step]: opts }))}
                  />
                  {/* Numbered, draggable selected questions list */}
                  {(selectedQuestions[step] && selectedQuestions[step].length > 0) && (
                    <div style={{ marginTop: 10, marginBottom: 10 }}>
                      <div style={{ fontWeight: 600, color: '#6e5a67', marginBottom: 6 }}>Selected Questions:</div>
                      <DraggableQuestionList
                        questions={selectedQuestions[step]}
                        onReorder={(reordered) => setSelectedQuestions(prev => ({ ...prev, [step]: reordered }))}
                        onRemove={(removeIdx) => setSelectedQuestions(prev => ({
                          ...prev,
                          [step]: prev[step].filter((_, idx) => idx !== removeIdx)
                        }))}
                      />
                    </div>
                  )}
                </div>
              )}
              {step === 1 && (
                <div>
                  <div style={{ color: '#b0802b', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Engagement/Manager Relationships</div>
                  <input
                    type="text"
                    placeholder="Describe engagement/manager relationships..."
                    style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                  />
                </div>
              )}
              {step === 2 && (
                <div>
                  <div style={{ color: '#b0802b', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Peer/Team Dynamics</div>
                  <input
                    type="text"
                    placeholder="Describe peer/team dynamics..."
                    style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                  />
                </div>
              )}
              {step === 3 && (
                <div>
                  <div style={{ color: '#b0802b', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Feedback & Communication Quality</div>
                  <input
                    type="text"
                    placeholder="Describe feedback & communication quality..."
                    style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                  />
                </div>
              )}
              {step === 4 && (
                <div>
                  <div style={{ color: '#b0802b', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Recognition and Pride</div>
                  <input
                    type="text"
                    placeholder="Describe recognition and pride elements..."
                    style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                  />
                </div>
              )}
              {step === 5 && (
                <div>
                  <div style={{ color: '#b0802b', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Safety & Wellness Indicators</div>
                  <input
                    type="text"
                    placeholder="Describe safety & wellness indicators..."
                    style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                  />
                </div>
              )}
              {step === 6 && (
                <div>
                  <div style={{ color: '#b0802b', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Site-specific open text boxes</div>
                  <textarea
                    placeholder="Add any site-specific notes or open text..."
                    style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60 }}
                  />
                </div>
              )}
              {step === 7 && (
                <div>
                  <div style={{ color: '#b0802b', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Optional Demographics</div>
                  <div style={{ marginBottom: 10, fontWeight: 600 }}>Select Demographic Questions:</div>
                  {/* Checklist only, no dropdown */}
                  {demoDemographicQuestions.map((q, idx) => (
                    <label key={q.value} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontWeight: 500 }}>
                      <input
                        type="checkbox"
                        checked={selectedDemographics.includes(q.value)}
                        onChange={e => {
                          setSelectedDemographics(prev =>
                            e.target.checked
                              ? [...prev, q.value]
                              : prev.filter(val => val !== q.value)
                          );
                        }}
                      />
                      {q.label}
                    </label>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 14, marginTop: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  style={{ background: '#eee', color: '#28211e', border: 'none', borderRadius: 8, fontWeight: 600, padding: '0 16px', fontSize: 15, height: 40, cursor: 'pointer' }}
                  onClick={() => {
                    if (step === 0) {
                      setShowModal(false);
                      setStep(0);
                    } else {
                      setStep(step - 1);
                    }
                  }}
                >
                  {step === 0 ? 'Cancel' : 'Back'}
                </button>
                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    style={{ background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}
                    onClick={() => setStep(step + 1)}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    style={{ background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}
                  >
                    Publish
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AllSurveys;

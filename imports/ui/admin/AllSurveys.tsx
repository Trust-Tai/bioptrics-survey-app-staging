import React, { useState, useEffect, ChangeEvent } from 'react';
import AdminLayout from './AdminLayout';

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

const AllSurveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  // Welcome screen image previews
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);

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

  useEffect(() => {
    setSurveys(getAllSurveys());
  }, []);

  const filtered = surveys.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1); // Reset to first page when search changes
  }, [search]);

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
                if (!form.title.trim()) return;
                const newSurvey = {
                  id: Date.now().toString(),
                  title: form.title,
                  description: form.description,
                  createdAt: new Date().toISOString(),
                };
                const updated = [newSurvey, ...surveys];
                localStorage.setItem('surveys', JSON.stringify(updated));
                setSurveys(updated);
                setShowModal(false);
                setForm({ title: '', description: '' });
                setStep(0);
              }}
              style={{ background: '#fff', borderRadius: 14, padding: 32, width: '80%', maxWidth: 900, minHeight: 220, boxShadow: '0 4px 32px #b0802b33', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}
            >
              {/* Step Tabs */}
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
              {/* Step Content */}
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
                      />
                    </label>
                    <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>
                      Welcome Description
                      <textarea
                        placeholder="Enter a welcome message or description..."
                        style={{ width: '100%', marginTop: 6, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 15, fontWeight: 500, color: '#28211e', minHeight: 60 }}
                      />
                    </label>
                    <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e' }}>
                      Primary Color
                      <input type="color" style={{ marginLeft: 12, width: 36, height: 36, border: 'none', background: 'none', verticalAlign: 'middle' }} />
                    </label>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div>
                  <div style={{ color: '#b0802b', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>Engagement/Manager Relationships</div>
                  <input
                    type="text"
                    placeholder="Describe engagement or manager relationship focus..."
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
                  <input
                    type="text"
                    placeholder="Enter optional demographic questions or notes..."
                    style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e5d6c7', fontSize: 16, fontWeight: 500, color: '#28211e' }}
                  />
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
                <button
                  type={step === steps.length - 1 ? 'submit' : 'button'}
                  style={{ background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '0 22px', fontSize: 16, height: 40, cursor: 'pointer' }}
                  onClick={step < steps.length - 1 ? (e => { e.preventDefault(); setStep(step + 1); }) : undefined}
                >
                  {step === steps.length - 1 ? 'Add' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        )}
        {surveys.length === 0 ? (
          <div style={{ color: '#b3a08a', fontStyle: 'italic', textAlign: 'center', marginTop: 48 }}>No surveys added yet.</div>
        ) : (
          <>
            <ul style={{ listStyle: 'none', padding: '24px 18px', margin: 0, display: 'flex', flexDirection: 'column', gap: 20, background: '#fffef6', borderRadius: 16 }}>
              {paginated.length === 0 ? (
                <li style={{ color: '#b3a08a', fontSize: 17, marginTop: 32, textAlign: 'center', listStyle: 'none' }}>No surveys found.</li>
              ) : (
                paginated.map(s => (
                  <li key={s.id} style={{ background: '#fffbe9', borderRadius: 14, boxShadow: '0 2px 8px #f4e6c1', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: '#28211e', fontWeight: 700, fontSize: 21, display: 'flex', alignItems: 'center', gap: 14 }}>
                      {s.title}
                    </span>
                    <span style={{ color: '#b3a08a', fontSize: 15 }}>
                      {s.description}
                    </span>
                    <span style={{ color: '#b3a08a', fontSize: 13 }}>
                      Created: {new Date(s.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))
              )}
            </ul>
            {/* Pagination Controls */}
            {pageCount > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, margin: '24px 0 0 0' }}>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  style={{
                    background: page === 1 ? '#eee' : '#b0802b',
                    color: page === 1 ? '#bbb' : '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    padding: '0 18px',
                    fontSize: 16,
                    height: 40,
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    opacity: page === 1 ? 0.7 : 1,
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: 15, color: '#b0802b', fontWeight: 600 }}>
                  Page {page} of {pageCount}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pageCount}
                  style={{
                    background: page === pageCount ? '#eee' : '#b0802b',
                    color: page === pageCount ? '#bbb' : '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 700,
                    padding: '0 18px',
                    fontSize: 16,
                    height: 40,
                    cursor: page === pageCount ? 'not-allowed' : 'pointer',
                    opacity: page === pageCount ? 0.7 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AllSurveys;

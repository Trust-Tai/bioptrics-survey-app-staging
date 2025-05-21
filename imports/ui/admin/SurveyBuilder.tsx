import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import DashboardBg from './DashboardBg';
import SurveySectionQuestionDropdown, { QuestionOption } from './SurveySectionQuestionDropdown';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Questions } from '/imports/api/questions';
import { SurveyThemes } from '/imports/api/surveyThemes';
import { WPSCategories } from '/imports/api/wpsCategories';
import { Surveys } from '/imports/api/surveys';
import Select, { MultiValue } from 'react-select';

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

interface SurveyForm {
  title: string;
  description: string;
  logo?: string;
  image?: string;
  color?: string;
}

const demographicOptions = [
  { value: 'location', label: 'Location' },
  { value: 'age', label: 'Age' },
  { value: 'gender', label: 'Gender' },
  { value: 'site', label: 'Site' },
  { value: 'shift_hours', label: 'Shift Hours' },
  { value: 'department', label: 'Department' },
  { value: 'education', label: 'Education Level' },
  { value: 'marital_status', label: 'Marital Status' },
  { value: 'job_role', label: 'Job Role' },
  { value: 'ethnicity', label: 'Ethnicity' },
  { value: 'tenure', label: 'Tenure' },
  { value: 'employment_type', label: 'Employment Type' }
];

const AUTOSAVE_KEY = 'survey-builder-autosave';

// Spinner component
const Spinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    width: '100%',
  }}>
    <div style={{
      border: '6px solid #f3e9d7',
      borderTop: '6px solid #b0802b',
      borderRadius: '50%',
      width: 56,
      height: 56,
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`@keyframes spin {0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);}}`}</style>
  </div>
);

// Reusable ImageInput
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

interface SurveyBuilderProps {
  editId?: string;
}

const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ editId }) => {
  // ...rest of hooks and logic...

  // Simple spinner component
  const Spinner = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      width: '100%',
    }}>
      <div style={{
        border: '6px solid #f3e9d7',
        borderTop: '6px solid #b0802b',
        borderRadius: '50%',
        width: 56,
        height: 56,
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`@keyframes spin {0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);}}`}</style>
    </div>
  );

  // ...rest of hooks and logic...

  const navigate = useNavigate();
  const params = useParams<{ surveyId?: string; id?: string }>();
  // Use editId prop if present, otherwise use params
  const surveyIdFromUrl = editId || params.id || params.surveyId;
  const surveysSub = useTracker(() => surveyIdFromUrl ? Meteor.subscribe('surveys.all') : null, [surveyIdFromUrl]);
  const surveysReady = surveysSub ? surveysSub.ready() : true;
  const [loadingSurvey, setLoadingSurvey] = useState(false);
  // --- NEW STATE FOR SAVE/PUBLISH ---
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedLink, setPublishedLink] = useState<string | null>(null);
const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSurveyId, setEditSurveyId] = useState<string | null>(null);

  // Helper to gather all survey data
  const getSurveyData = () => ({
    ...form,
    selectedQuestions,
    siteTextQuestions,
    siteTextQForm,
    selectedDemographics,
  });

  // Save as draft
  const handleSave = async () => {
  setSaving(true);
  try {
    // Save and get the _id of the survey
    const result = await Meteor.callAsync('surveys.saveDraft', getSurveyData());
    let surveyId = result;
    if (result && typeof result === 'object' && result.insertedId) {
      surveyId = result.insertedId;
    } else if (result && typeof result === 'object' && result._id) {
      surveyId = result._id;
    }
    // Fetch the saved survey from the collection (ensure subscription is ready)
    if (surveyId) {
      const savedSurvey = Surveys.findOne(surveyId);
      if (savedSurvey) {
        setForm({
          title: savedSurvey.title || '',
          description: savedSurvey.description || '',
          logo: savedSurvey.logo || '',
          image: savedSurvey.image || '',
          color: savedSurvey.color || '#b0802b',
        });
        setSelectedQuestions(savedSurvey.selectedQuestions || {});
        setSiteTextQuestions(savedSurvey.siteTextQuestions || []);
        setSiteTextQForm(savedSurvey.siteTextQForm || { text: '', description: '', wpsCategories: [], surveyThemes: [] });
        setSelectedDemographics(savedSurvey.selectedDemographics || []);
        setIsEditMode(true);
        setEditSurveyId(surveyId);
        // Remove autosave from localStorage when survey is saved in edit mode
        localStorage.removeItem(AUTOSAVE_KEY);
        localStorage.removeItem(AUTOSAVE_KEY + '-openSection');
        // Update URL to include survey id
        navigate(`/admin/surveys/builder/${surveyId}`, { replace: false });
        // Clear autosave from localStorage
        localStorage.removeItem(AUTOSAVE_KEY);
        localStorage.removeItem(AUTOSAVE_KEY + '-openSection');
      }
    }
    showSuccess('Survey draft saved successfully and loaded for editing.');
  } catch (err: any) {
    showError(err?.reason || 'Error saving draft.');
  } finally {
    setSaving(false);
  }
};

  // Publish survey
  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Only call publish if no published link exists
      if (publishedLink) {
        showSuccess('Survey already published!');
        setPublishing(false);
        return;
      }
      const result = await Meteor.callAsync('surveys.publish', getSurveyData());
      if (result && result.shareToken) {
        const url = `${window.location.origin}/survey/public/${result.shareToken}`;
        setPublishedLink(url);
        showSuccess('Survey published! Sharable link generated below.');
      }
    } catch (err: any) {
      showError(err?.reason || 'Error publishing survey.');
    } finally {
      setPublishing(false);
    }
  };

  // --- Load survey if editing via URL ---
  React.useEffect(() => {
    const urlSurveyId = params.surveyId;
    if (urlSurveyId && surveysReady) {
      setLoadingSurvey(true);
      const survey = Surveys.findOne(urlSurveyId);
      if (survey) {
        setForm({
          title: survey.title || '',
          description: survey.description || '',
          logo: survey.logo || '',
          image: survey.image || '',
          color: survey.color || '#b0802b',
        });
        setSelectedQuestions(survey.selectedQuestions || {});
        setSiteTextQuestions(survey.siteTextQuestions || []);
        setSiteTextQForm(survey.siteTextQForm || { text: '', description: '', wpsCategories: [], surveyThemes: [] });
        setSelectedDemographics(survey.selectedDemographics || []);
        setIsEditMode(true);
        setEditSurveyId(urlSurveyId);
        // Set published link if survey is published
        if (survey.shareToken) {
          setPublishedLink(`${window.location.origin}/survey/public/${survey.shareToken}`);
        } else {
          setPublishedLink(null);
        }
      }
      setLoadingSurvey(false);
    }
  }, [params.surveyId, surveysReady]);

  // ...rest of hooks and logic...
// --- AUTOSAVE RESTORE ON MOUNT ---
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([]);
  const [form, setForm] = useState<SurveyForm>({ title: '', description: '', logo: '', image: '', color: '#b0802b' });
  // Generate a unique token for preview
  const [previewToken] = useState(() => `${Date.now()}-${Math.random().toString(36).substr(2, 8)}`);
  const [selectedQuestions, setSelectedQuestions] = useState<{ [sectionIdx: number]: QuestionOption[] }>({});
  // State for Site-specific open textbox questions
  type SiteTextQ = { text: string; description: string; wpsCategories: string[]; surveyThemes: string[] };
  const [siteTextQuestions, setSiteTextQuestions] = useState<SiteTextQ[]>([]);
  const [siteTextQForm, setSiteTextQForm] = useState<SiteTextQ>({ text: '', description: '', wpsCategories: [], surveyThemes: [] });
  // Which section is open (collapsible)
  const [openSection, setOpenSection] = useState(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY + '-openSection');
    return saved !== null ? Number(saved) : 0;
  });
  // Alert state and helpers (matching QuestionBuilder and WPSFramework)
  const [alert, setAlert] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  function showSuccess(msg: string) {
    setAlert({ type: 'success', message: msg });
    setTimeout(() => setAlert(null), 3000);
  }
  function showError(msg: string) {
    setAlert({ type: 'error', message: msg });
    setTimeout(() => setAlert(null), 4000);
  }

  // --- Load autosave on mount ---
  React.useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.form) setForm(parsed.form);
        if (parsed.selectedQuestions) setSelectedQuestions(parsed.selectedQuestions);
        if (parsed.siteTextQuestions) setSiteTextQuestions(parsed.siteTextQuestions);
        if (parsed.siteTextQForm) {
          setSiteTextQForm(f => ({
            ...parsed.siteTextQForm,
            wpsCategories: Array.isArray(parsed.siteTextQForm.wpsCategories) ? parsed.siteTextQForm.wpsCategories : (parsed.siteTextQForm.wpsCategories ? [parsed.siteTextQForm.wpsCategories] : []),
            surveyThemes: Array.isArray(parsed.siteTextQForm.surveyThemes) ? parsed.siteTextQForm.surveyThemes : (parsed.siteTextQForm.surveyThemes ? [parsed.siteTextQForm.surveyThemes] : []),
          }));
        }
        if (parsed.selectedDemographics) setSelectedDemographics(parsed.selectedDemographics);
      } catch {}
    }
    // Restore openSection from localStorage if present
    const savedOpenSection = localStorage.getItem(AUTOSAVE_KEY + '-openSection');
    if (savedOpenSection !== null) {
      setOpenSection(Number(savedOpenSection));
    }
  }, []);

  // --- Auto-save on any relevant state change ---
  React.useEffect(() => {
    localStorage.setItem(
      AUTOSAVE_KEY + '-openSection',
      String(openSection)
    );
  }, [openSection]);

  // Only autosave when not in edit mode
  React.useEffect(() => {
    if (!isEditMode) {
      localStorage.setItem(
        AUTOSAVE_KEY,
        JSON.stringify({
          form,
          selectedQuestions,
          siteTextQuestions,
          siteTextQForm,
          selectedDemographics,
        })
      );
    }
  }, [form, selectedQuestions, siteTextQuestions, siteTextQForm, selectedDemographics, isEditMode]);


// Tag labels for question type
const QUE_TYPE_LABELS: Record<string, string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  free_text: 'Free Text',
  multiple_choice: 'Multiple Choice',
  checkbox: 'Checkbox',
  dropdown: 'Dropdown',
  likert: 'Likert Scale',
  quick_tabs: 'Quick Tabs',
};

// Fetch all themes and categories for display
const wpsCategoriesSub = useTracker(() => Meteor.subscribe('wpsCategories'), []);
const wpsCategories = useTracker(() => wpsCategoriesSub.ready() ? WPSCategories.find({}, { sort: { name: 1 } }).fetch() : [], [wpsCategoriesSub]);
const surveyThemes = useTracker(() => {
  Meteor.subscribe('surveyThemes.all');
  return SurveyThemes.find().fetch();
}, []);
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

// Fetch all questions
const allQuestions = useTracker(() => {
  Meteor.subscribe('questions.all');
  return Questions.find({}, { sort: { createdAt: -1 } }).fetch().map((doc: any) => {
    const latest = doc.versions && doc.versions.length > 0 ? doc.versions[doc.versions.length - 1] : {};
    let themeNames = '';
    if (latest.surveyThemes && latest.surveyThemes.length > 0) {
      themeNames = latest.surveyThemes.map((id: string) => surveyThemeMap[id] || id).join(', ');
    }
    let wpsCategoryNames = '';
    if (latest.categoryTags && latest.categoryTags.length > 0) {
      const names = latest.categoryTags
        .map((id: string) => wpsCategoryMap[id])
        .filter(Boolean);
      wpsCategoryNames = names.length > 0 ? names.join(', ') : 'Uncategorized';
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

const questionOptions: QuestionOption[] = allQuestions.map(q => ({ value: q._id, label: q.text }));

  return (
    <AdminLayout>
      <DashboardBg>
        {/* --- Published Link Section --- */}
        {publishedLink && (
  <div style={{
    background: '#2ecc40',
    color: '#fff',
    padding: '22px 24px',
    borderRadius: 12,
    margin: '32px auto 16px auto',
    maxWidth: 900,
    boxShadow: '0 2px 8px #b0802b33',
    fontSize: 17,
    fontWeight: 600,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 10
  }}>
    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
      <span role="img" aria-label="check" style={{ fontSize: 22 }}>✅</span>
      Survey is published!
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ fontWeight: 400, fontSize: 16 }}>Sharable Link:</span>
      <a href={publishedLink} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline', fontSize: 16 }}>{publishedLink}</a>
      <button
        style={{ background: '#fff', color: '#2ecc40', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}
        onClick={() => {
          navigator.clipboard.writeText(publishedLink);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  </div>
)}
        <div style={{ padding: '32px 0', minHeight: '100vh', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', borderRadius: 18, padding: '32px 32px 40px 32px', background: '#fff', position: 'relative', overflow: 'visible' }}>
            
            {/* Header Bar (like QuestionBuilder) */}
            {/* Custom Alert (matching QuestionBuilder/WPSFramework) */}
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
                boxShadow: '0 2px 12px #b0802b33',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 240,
                textAlign: 'center',
              }}>
                {alert.message}
                {publishedLink && alert.type === 'success' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ marginTop: 12 }}>
                      <span style={{ fontWeight: 400, color: '#fff' }}>Sharable Link:</span>
                      <div style={{ marginTop: 6, wordBreak: 'break-all', fontWeight: 700 }}>
                        <a href={publishedLink} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>{publishedLink}</a>
                      </div>
                    </div>
                    <button
                      style={{ background: '#fff', color: '#2ecc40', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, cursor: 'pointer' }}
                      onClick={() => {
                        navigator.clipboard.writeText(publishedLink ?? "");
                        showSuccess('Copied!');
                        setTimeout(() => showSuccess(null), 2000);
                      }}
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            )}
            <div
              style={{
                position: 'sticky',
                top: 0,
                zIndex: 200,
                background: '#fff',
                boxShadow: '0 4px 18px 0 rgba(176,128,43,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                padding: '10px 0 10px 0',
                transition: 'box-shadow 0.15s',
              }}
            >
              <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 26, margin: 0 }}>
  {isEditMode && form.title ? `Editing ${form.title}` : 'Add New Survey'}
</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{ background: '#fff', color: '#b0802b', border: '2px solid #b0802b', borderRadius: 10, height: 36, fontWeight: 500, fontSize: 15, cursor: 'pointer', padding: '0 16px' }}
                  onClick={() => {
                    localStorage.setItem(`survey-preview-${previewToken}`, JSON.stringify(form));
                    window.open(`/preview/survey/${previewToken}?status=preview`, '_blank');
                  }}
                >
                  Preview
                </button>
                <button
                  style={{ background: '#b0802b', color: '#fff', border: 'none', borderRadius: 10, height: 36, fontWeight: 600, fontSize: 15, cursor: saving ? 'wait' : 'pointer', padding: '0 16px', opacity: saving ? 0.6 : 1 }}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  style={{ background: '#2ecc40', color: '#fff', border: 'none', borderRadius: 10, height: 36, fontWeight: 600, fontSize: 15, cursor: publishing ? 'wait' : 'pointer', padding: '0 16px', opacity: publishing ? 0.6 : 1 }}
                  onClick={handlePublish}
                  disabled={publishing}
                >
                  {publishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
            {/* Welcome Notice (like QuestionBuilder) */}
            <div style={{
              background: '#EDFDD3',
              border: '1px solid #C9C9C9',
              borderRadius: 8,
              padding: '18px 22px',
              marginBottom: 28,
              color: '#3a3a3a',
              fontSize: 17,
              fontWeight: 500,
              lineHeight: 1.6
            }}>
              <strong>Welcome to the Survey Builder</strong><br/>
              This is your central hub for creating new surveys. Here you can define survey details, add sections, and organize questions for a consistent experience.
            </div>
            {/* Collapsible Sections */}
            <div style={{ marginTop: 18 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ marginBottom: 18, borderRadius: 10, border: '1px solid #e5d6c7', background: 'none' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (i > 0 && !form.title.trim()) {
                        showError('Please enter a survey title before proceeding.');
                        return;
                      }
                      setOpenSection(i);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      color: '#222222',
                      border: 'none',
                      borderRadius: '10px 10px 0 0',
                      fontSize: 18,
                      padding: '18px 22px',
                      cursor: openSection === i ? 'default' : (i > 0 && !form.title.trim() ? 'not-allowed' : 'pointer'),
                      opacity: openSection === i ? 1 : (i > 0 && !form.title.trim() ? 0.5 : 1),
                      outline: 'none',
                      transition: 'all 0.18s',
                      borderBottom: openSection === i ? '2px solid #b0802b' : '2px solid #e5d6c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    disabled={openSection === i}
                  >
                    <span>{s.label}</span>
                    <span style={{ display: 'inline-flex', transition: 'transform 0.2s', transform: openSection === i ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      {/* Right arrow SVG */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b0802b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </span>
                  </button>
                  {openSection === i && (
                    <div style={{ padding: '24px 22px 12px 22px', background: 'none', borderRadius: '0 0 10px 10px', color: '#222222' }}>
                      {/* Render fields for this section here */}
                      {i === 0 ? (
                        <>
                          {/* Title */}
                          <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 15, marginBottom: 6, textTransform: 'uppercase' }}>
                              Title <span style={{ color: '#e74c3c', fontWeight: 700 }} title="Required">*</span>
                            </label>
                            <input
                              type="text"
                              value={form.title}
                              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                              style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 8, border: '1px solid #CCC', fontSize: 16 }}
                              placeholder="Enter survey title"
                            />
                          </div>
                          {/* Description */}
                          <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 15, marginBottom: 6, textTransform: 'uppercase' }}>Description</label>
                            <ReactQuill
                              value={form.description}
                              onChange={value => setForm(f => ({ ...f, description: value }))}
                              theme="snow"
                              placeholder="Describe your survey"
                              style={{ marginBottom: 8, background: '#fff', borderRadius: 8, minHeight: 80 }}
                            />
                          </div>
                          {/* Logo */}
                          <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 15, marginBottom: 6, textTransform: 'uppercase' }}>Logo</label>
                            <ImageInput
                              value={form.logo || null}
                              onChange={file => {
                                if (!file) {
                                  setForm(f => ({ ...f, logo: '' }));
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = ev => setForm(f => ({ ...f, logo: ev.target?.result as string }));
                                reader.readAsDataURL(file);
                              }}
                              onRemove={() => setForm(f => ({ ...f, logo: '' }))}
                              placeholder="Upload logo image"
                            />
                          </div>
                          {/* Image */}
                          <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 15, marginBottom: 6, textTransform: 'uppercase' }}>Image</label>
                            <ImageInput
                              value={form.image || null}
                              onChange={file => {
                                if (!file) {
                                  setForm(f => ({ ...f, image: '' }));
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = ev => setForm(f => ({ ...f, image: ev.target?.result as string }));
                                reader.readAsDataURL(file);
                              }}
                              onRemove={() => setForm(f => ({ ...f, image: '' }))}
                              placeholder="Upload featured image"
                            />
                          </div>
                          {/* Survey Color */}
                          <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 15, marginBottom: 6, textTransform: 'uppercase' }}>Survey Color</label>
                            <input
                              type="color"
                              value={form.color || '#b0802b'}
                              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                              style={{ width: 48, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
                            />
                            <span style={{ marginLeft: 10, fontSize: 15 }}>{form.color || '#b0802b'}</span>
                          </div>
                        </>
                      ) : (i >= 1 && i <= 5) ? (
                        <>
                          <SurveySectionQuestionDropdown
                            sectionLabel={s.label}
                            options={questionOptions}
                            selected={selectedQuestions[i] || []}
                            onChange={opts => setSelectedQuestions(q => ({ ...q, [i]: opts }))}
                          />
                          {/* Show selected questions below dropdown */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {(selectedQuestions[i] || []).map(opt => {
                              const q = allQuestions.find(q => q._id === opt.value);
                              if (!q) return null;
                              return (
                                <div
                                  key={q._id}
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
                                    <span style={{ background: '#fff5e1', color: '#b0802b', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>{QUE_TYPE_LABELS[q.queType] || q.queType}</span>
                                  </div>
                                  <div style={{ color: '#28211e', fontWeight: 600, fontSize: 17, letterSpacing: 0.1 }}>
                                    {q.text}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : i === 6 ? (
                        <>
                          <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                              Add Site-specific Open Textbox Questions
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, background: '#faf7f2', borderRadius: 10, padding: 18, marginBottom: 20 }}>
                              <label style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>Question Text</label>
                              <input
                                type="text"
                                placeholder="Question text"
                                value={siteTextQForm.text}
                                onChange={e => setSiteTextQForm(f => ({ ...f, text: e.target.value }))}
                                style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 7, border: '1.5px solid #e5d6c7', fontSize: 15 }}
                              />
                              <label style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>Description <span style={{ fontWeight: 400, color: '#a9a9a9' }}>(optional)</span></label>
                              <textarea
                                placeholder="Description (optional)"
                                value={siteTextQForm.description}
                                onChange={e => setSiteTextQForm(f => ({ ...f, description: e.target.value }))}
                                style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 7, border: '1.5px solid #e5d6c7', fontSize: 15, minHeight: 40 }}
                              />
                              <label style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>WPS Categories</label>
                              <Select
                                isMulti
                                isDisabled={wpsCategories.length === 0}
                                options={wpsCategories.map((cat: any) => ({ value: cat._id, label: cat.name, color: cat.color }))}
                                value={wpsCategories.filter((cat: any) => (siteTextQForm.wpsCategories || []).includes(cat._id)).map((cat: any) => ({ value: cat._id, label: cat.name, color: cat.color }))}
                                onChange={(selected: MultiValue<{ value: string; label: string; color: string }>) => {
                                  setSiteTextQForm(f => ({ ...f, wpsCategories: selected.map(opt => opt.value) }));
                                }}
                                placeholder={wpsCategories.length === 0 ? 'Loading categories...' : 'Select WPS Categories'}
                                styles={{
                                  control: (base) => ({ ...base, borderColor: '#e5d6c7', minHeight: 44, fontSize: 15 }),
                                  multiValue: (base, { data }) => ({ ...base, background: data.color || '#fffbe9', color: '#fff' }),
                                  option: (base, state) => ({ ...base, background: state.isSelected ? '#b0802b' : '#fff', color: state.isSelected ? '#fff' : '#28211e', fontWeight: 500 }),
                                  multiValueLabel: (base) => ({ ...base, color: '#fff', fontWeight: 600 }),
                                  multiValueRemove: (base) => ({ ...base, color: '#fff', ':hover': { backgroundColor: '#333', color: '#fff' } }),
                                }}
                              />
                              <label style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>Survey Themes</label>
                              <Select
                                isMulti
                                isDisabled={surveyThemes.length === 0}
                                options={surveyThemes.map((theme: any) => ({ value: theme._id, label: theme.name, color: theme.color }))}
                                value={surveyThemes.filter((theme: any) => (siteTextQForm.surveyThemes || []).includes(theme._id)).map((theme: any) => ({ value: theme._id, label: theme.name, color: theme.color }))}
                                onChange={(selected: MultiValue<{ value: string; label: string; color: string }>) => {
                                  setSiteTextQForm(f => ({ ...f, surveyThemes: selected.map(opt => opt.value) }));
                                }}
                                placeholder={surveyThemes.length === 0 ? 'Loading themes...' : 'Select Survey Themes'}
                                styles={{
                                  control: (base) => ({ ...base, borderColor: '#e5d6c7', minHeight: 44, fontSize: 15 }),
                                  multiValue: (base, { data }) => ({ ...base, background: data.color || '#fbe7f6', color: '#a54c8c' }),
                                  option: (base, state) => ({ ...base, background: state.isSelected ? '#a54c8c' : '#fff', color: state.isSelected ? '#fff' : '#28211e', fontWeight: 500 }),
                                  multiValueLabel: (base) => ({ ...base, color: '#fff', fontWeight: 600 }),
                                  multiValueRemove: (base) => ({ ...base, color: '#fff', ':hover': { backgroundColor: '#333', color: '#fff' } }),
                                }}
                              />
                              <button
                                type="button"
                                style={{ background: '#b0802b', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, fontSize: 15, padding: '8px 24px', cursor: 'pointer', alignSelf: 'flex-start' }}
                                onClick={() => {
                                  if (!siteTextQForm.text.trim()) return;
                                  setSiteTextQuestions(qs => [
                                    ...qs,
                                    {
                                      text: siteTextQForm.text,
                                      description: siteTextQForm.description,
                                      wpsCategories: siteTextQForm.wpsCategories,
                                      surveyThemes: siteTextQForm.surveyThemes
                                    }
                                  ]);
                                  setSiteTextQForm({ text: '', description: '', wpsCategories: [], surveyThemes: [] });
                                }}
                              >
                                Add Question
                              </button>
                            </div>
                          </div>
                          {/* Preview of added questions */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {siteTextQuestions.map((q, idx) => (
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
                                  {q.wpsCategories && q.wpsCategories.length > 0 ? q.wpsCategories.map(catId => {
                                    const cat = wpsCategories.find((c: any) => c._id === catId);
                                    return (
                                      <span
                                        key={catId}
                                        style={{
                                          background: cat?.color || '#e4f0fa',
                                          color: '#3776a8',
                                          borderRadius: 7,
                                          padding: '2px 12px',
                                          fontSize: 13,
                                          fontWeight: 700,
                                          letterSpacing: 0.2,
                                        }}
                                      >
                                        {cat ? cat.name : wpsCategoryMap[catId] || 'Uncategorized'}
                                      </span>
                                    );
                                  }) : (
                                    <span style={{ background: '#e4f0fa', color: '#3776a8', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>Uncategorized</span>
                                  )}
                                  {q.surveyThemes && q.surveyThemes.length > 0 ? q.surveyThemes.map(themeId => {
                                    const theme = surveyThemes.find((t: any) => t._id === themeId);
                                    return (
                                      <span
                                        key={themeId}
                                        style={{
                                          background: theme?.color || '#fbe7f6',
                                          color: '#a54c8c',
                                          borderRadius: 7,
                                          padding: '2px 12px',
                                          fontSize: 13,
                                          fontWeight: 700,
                                          letterSpacing: 0.2,
                                        }}
                                      >
                                        {theme ? theme.name : surveyThemeMap[themeId] || 'No Theme'}
                                      </span>
                                    );
                                  }) : (
                                    <span style={{ background: '#fbe7f6', color: '#a54c8c', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>No Theme</span>
                                  )}
                                  <span style={{ background: '#fff5e1', color: '#b0802b', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>Open Text</span>
                                </div>
                                <div style={{ color: '#28211e', fontWeight: 600, fontSize: 17, letterSpacing: 0.1 }}>
                                  {q.text}
                                </div>
                                {q.description && <div style={{ color: '#6e5a67', fontSize: 15 }}>{q.description}</div>}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : i === 7 ? (
                        <div style={{ marginBottom: 18 }}>
                          <label style={{ display: 'block', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                            Select Demographic Indicators to include:
                          </label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                            {demographicOptions.map(opt => {
  const isSelected = selectedDemographics.includes(opt.value);
  return (
    <button
      key={opt.value}
      type="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onClick={() => {
        setSelectedDemographics(isSelected
          ? selectedDemographics.filter(v => v !== opt.value)
          : [...selectedDemographics, opt.value]);
      }}
      onKeyDown={e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setSelectedDemographics(isSelected
            ? selectedDemographics.filter(v => v !== opt.value)
            : [...selectedDemographics, opt.value]);
        }
      }}
      style={{
        minWidth: 120,
        padding: '8px 18px',
        margin: '2px 0',
        borderRadius: 8,
        border: isSelected ? '2px solid #b0802b' : '2px solid #e5d6c7',
        background: isSelected ? '#b0802b' : '#fff',
        color: isSelected ? '#fff' : '#28211e',
        fontWeight: 600,
        fontSize: 15,
        cursor: 'pointer',
        outline: isSelected ? '2px solid #b0802b' : 'none',
        boxShadow: isSelected ? '0 2px 8px #f4e6c1' : 'none',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {opt.label}
    </button>
  );
})}
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginBottom: 18, fontSize: 16, color: '#222222' }}>
                          Fields for <b>{s.label}</b> go here.
                        </div>
                      )}
                      {i > 0 && (
                        <button
                          type="button"
                          style={{ background: '#b3a08a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, padding: '8px 24px', cursor: 'pointer', marginRight: 12 }}
                          onClick={() => setOpenSection(i - 1)}
                        >
                          Previous
                        </button>
                      )}
                      {i < steps.length - 1 && (
                        <button
                          type="button"
                          style={{ background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, padding: '8px 24px', cursor: 'pointer' }}
                          onClick={() => setOpenSection(i + 1)}
                        >
                          Next
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardBg>
    </AdminLayout>
  );
}


export default SurveyBuilder;

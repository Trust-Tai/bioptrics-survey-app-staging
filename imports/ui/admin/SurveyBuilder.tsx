import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import DashboardBg from './DashboardBg';
import SurveySectionQuestionDropdown, { QuestionOption } from './SurveySectionQuestionDropdown';
import ReactQuill from 'react-quill';
import '../styles/quill-styles';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Questions } from '/imports/api/questions';
import { SurveyThemes } from '/imports/api/surveyThemes';
import { WPSCategories } from '/imports/api/wpsCategories';
import { Surveys } from '../../features/surveys/api/surveys';
import Select, { MultiValue } from 'react-select';
import SurveySharing from './SurveySharing';
import SurveyBranchingLogic from './SurveyBranchingLogic';
import SurveyNotifications from './SurveyNotifications';
import { SurveySections, SurveySectionItem } from './SurveySections';
import SectionQuestions, { QuestionItem } from './SectionQuestions';

const steps = [
  { label: 'Welcome Screen' },
  { label: 'Sections' },
  { label: 'Questions' },
  { label: 'Demographics' },
  { label: 'Themes' },
  { label: 'Branching Logic' },
  { label: 'Completion' },
  { label: 'Preview' },
  { label: 'Publish' },
  { label: 'Settings' },
  { label: 'Notifications' },
];

interface SurveyForm {
  title: string;
  description: string;
  logo?: string;
  image?: string;
  color?: string;
  selectedQuestions?: Record<string, any>;
  siteTextQuestions?: Array<any>;
  siteTextQForm?: any;
  selectedDemographics?: string[];
  defaultSettings?: {
    allowAnonymous?: boolean;
    requireLogin?: boolean;
    showProgressBar?: boolean;
    allowSave?: boolean;
    allowSkip?: boolean;
    showThankYou?: boolean;
    thankYouMessage?: string;
    redirectUrl?: string;
    notificationEmails?: string[];
    expiryDate?: Date;
    responseLimit?: number;
    themes?: string[];
    categories?: string[];
    startDate?: Date;
    autoPublish?: boolean;
    recurringSchedule?: boolean;
    recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
    restrictAccess?: boolean;
    allowedGroups?: string[];
    passwordProtected?: boolean;
    accessPassword?: string;
  };
  branchingLogic?: {
    rules: Array<{
      questionId: string;
      condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
      value: any;
      jumpToQuestionId: string;
    }>;
    enabled: boolean;
  };
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
      borderTop: '6px solid #552a47',
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
          <img src={value} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #552a47' }} />
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
        <span style={{ color: '#8a7a85', fontSize: 14 }}>{placeholder}</span>
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
        borderTop: '6px solid #552a47',
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
  
  // Define interface for default settings
  interface DefaultSettings {
    allowAnonymous: boolean;
    requireLogin: boolean;
    showProgressBar: boolean;
    allowSave: boolean;
    allowSkip: boolean;
    showThankYou: boolean;
    thankYouMessage: string;
    redirectUrl: string;
    notificationEmails: string[];
    expiryDate?: Date;
    responseLimit: number;
    themes: string[];
    categories: string[];
    // New properties for scheduling
    startDate?: Date;
    autoPublish?: boolean;
    recurringSchedule?: boolean;
    recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
    // New properties for access control
    restrictAccess?: boolean;
    allowedGroups?: string[];
    passwordProtected?: boolean;
    accessPassword?: string;
  }
  
  // Default settings state
  const [defaultSettings, setDefaultSettings] = useState<DefaultSettings>({
    allowAnonymous: true,
    requireLogin: false,
    showProgressBar: true,
    allowSave: true,
    allowSkip: false,
    showThankYou: true,
    thankYouMessage: 'Thank you for completing this survey! Your feedback is valuable to us.',
    redirectUrl: '',
    notificationEmails: [] as string[],
    expiryDate: undefined as Date | undefined,
    responseLimit: 0,
    themes: [] as string[],
    categories: [] as string[],
  });
  
  // State for default settings panel visibility
  const [showDefaultSettings, setShowDefaultSettings] = useState(false);

  // Helper to gather all survey data
  const getSurveyData = () => ({
    ...form,
    selectedQuestions,
    siteTextQuestions,
    siteTextQForm,
    selectedDemographics,
    surveySections,
    sectionQuestions,
    defaultSettings,
    isActive: true,
    priority: 3,
    keywords: [],
  });

  // Save as draft
  const handleSave = async () => {
    setSaving(true);
    try {
      // Always include _id if editing an existing survey
      const surveyData = getSurveyData();
      // Use editSurveyId as the canonical _id for editing
      const surveyIdToEdit = editSurveyId || editId;
      if (surveyIdToEdit) {
        (surveyData as any)._id = surveyIdToEdit;
      }
      // Save and get the _id of the survey
      const result = await Meteor.callAsync('surveys.saveDraft', surveyData);
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
            color: savedSurvey.color || '#552a47',
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
      if (publishedLink) {
        showSuccess('Survey already published!');
        setPublishing(false);
        return;
      }
      const result = await Meteor.callAsync('surveys.publish', getSurveyData());
      if (result && result._id) {
        const encryptedToken = await Meteor.callAsync('surveys.generateEncryptedToken', result._id);
        const url = `${window.location.origin}/public/${encryptedToken}`;
        setPublishedLink(url);
        showSuccess('Survey published successfully!');
      } else if (result && result.shareToken) {
        const url = `${window.location.origin}/public/${result.shareToken}`;
        setPublishedLink(url);
        showSuccess('Survey published successfully!');
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
          color: survey.color || '#552a47',
        });
        setSelectedQuestions(survey.selectedQuestions || {});
        setSiteTextQuestions(survey.siteTextQuestions || []);
        setSiteTextQForm(survey.siteTextQForm || { text: '', description: '', wpsCategories: [], surveyThemes: [] });
        setSelectedDemographics(survey.selectedDemographics || []);
        
        // Initialize survey sections from saved data or defaults
        if (survey.surveySections) {
          setSurveySections(survey.surveySections);
        } else {
          // Create default sections based on the SURVEY_SECTIONS array
          const defaultSections: SurveySectionItem[] = [
            { id: 'section-1', name: 'Welcome Screen', description: 'Introduction to the survey', isActive: true, priority: 0, color: '#552a47' },
            { id: 'section-2', name: 'Engagement/Manager Relationships', description: 'Questions about management and engagement', isActive: true, priority: 1, color: '#552a47' },
            { id: 'section-3', name: 'Peer/Team Dynamics', description: 'Questions about team collaboration', isActive: true, priority: 2, color: '#552a47' },
            { id: 'section-4', name: 'Feedback & Communication Quality', description: 'Questions about communication', isActive: true, priority: 3, color: '#552a47' },
            { id: 'section-5', name: 'Recognition and Pride', description: 'Questions about recognition', isActive: true, priority: 4, color: '#552a47' },
            { id: 'section-6', name: 'Safety & Wellness Indicators', description: 'Questions about safety and wellness', isActive: true, priority: 5, color: '#552a47' },
            { id: 'section-7', name: 'Site-specific open text boxes', description: 'Custom questions for this site', isActive: true, priority: 6, color: '#552a47' },
            { id: 'section-8', name: 'Optional Demographics', description: 'Demographic information questions', isActive: true, priority: 7, color: '#552a47' },
          ];
          setSurveySections(defaultSections);
        }
        
        // Initialize section questions
        if (survey.sectionQuestions) {
          setSectionQuestions(survey.sectionQuestions);
        } else {
          // Create empty section questions array or initialize from selected questions
          const initialSectionQuestions: QuestionItem[] = [];
          
          // If there are selected questions, convert them to section questions
          if (survey.selectedQuestions) {
            Object.entries(survey.selectedQuestions).forEach(([id, q]: [string, any], index) => {
              initialSectionQuestions.push({
                id,
                text: q.questionText || 'Untitled Question',
                type: q.type || 'text',
                order: index
              });
            });
          }
          
          setSectionQuestions(initialSectionQuestions);
        }
        
        setIsEditMode(true);
        setEditSurveyId(urlSurveyId);
        // Set published link if survey is published
        if (survey._id) {
          try {
            // Generate an encrypted token for the survey ID
            Meteor.call('surveys.generateEncryptedToken', survey._id, (error: Meteor.Error | null, encryptedToken: string) => {
              if (error) {
                console.error('Error generating encrypted token:', error);
                // Fall back to shareToken if available
                if (survey.shareToken) {
                  setPublishedLink(`${window.location.origin}/public/${survey.shareToken}`);
                } else {
                  setPublishedLink(null);
                }
              } else {
                setPublishedLink(`${window.location.origin}/public/${encryptedToken}`);
              }
            });
          } catch (error) {
            console.error('Error generating encrypted token:', error);
            // Fall back to shareToken if available
            if (survey.shareToken) {
              setPublishedLink(`${window.location.origin}/public/${survey.shareToken}`);
            } else {
              setPublishedLink(null);
            }
          }
        } else {
          setPublishedLink(null);
        }
      }
      setLoadingSurvey(false);
    } else if (!urlSurveyId) {
      // Initialize default sections for new surveys
      const defaultSections: SurveySectionItem[] = [
        { id: 'section-1', name: 'Welcome Screen', description: 'Introduction to the survey', isActive: true, priority: 0, color: '#552a47' },
        { id: 'section-2', name: 'Engagement/Manager Relationships', description: 'Questions about management and engagement', isActive: true, priority: 1, color: '#552a47' },
        { id: 'section-3', name: 'Peer/Team Dynamics', description: 'Questions about team collaboration', isActive: true, priority: 2, color: '#552a47' },
        { id: 'section-4', name: 'Feedback & Communication Quality', description: 'Questions about communication', isActive: true, priority: 3, color: '#552a47' },
        { id: 'section-5', name: 'Recognition and Pride', description: 'Questions about recognition', isActive: true, priority: 4, color: '#552a47' },
        { id: 'section-6', name: 'Safety & Wellness Indicators', description: 'Questions about safety and wellness', isActive: true, priority: 5, color: '#552a47' },
        { id: 'section-7', name: 'Site-specific open text boxes', description: 'Custom questions for this site', isActive: true, priority: 6, color: '#552a47' },
        { id: 'section-8', name: 'Optional Demographics', description: 'Demographic information questions', isActive: true, priority: 7, color: '#552a47' },
      ];
      setSurveySections(defaultSections);
    }
  }, [params.surveyId, surveysReady]);

  // ...rest of hooks and logic...
// --- AUTOSAVE RESTORE ON MOUNT ---
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([]);
  
  // State for survey sections
  const [surveySections, setSurveySections] = useState<SurveySectionItem[]>([]);
  
  // State for section questions
  const [sectionQuestions, setSectionQuestions] = useState<QuestionItem[]>([]);
  const [form, setForm] = useState<SurveyForm>({ title: '', description: '', logo: '', image: '', color: '#552a47' });
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
            background: 'rgba(255,255,255,0.6)',
            color: '#28211e',
            padding: '24px',
            borderRadius: 14,
            border: '2px solid #552a47',
            margin: '24px auto 12px auto',
            maxWidth: 1000,
            boxShadow: '0 2px 8px #552a4733',
            fontSize: 16,
            fontWeight: 600,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 16
          }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
              Survey is published!
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
              <span style={{ fontWeight: 400, fontSize: 16 }}>Sharable Link:</span>
              <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <a href={publishedLink} target="_blank" rel="noopener noreferrer" style={{ color: '#28211e', textDecoration: 'underline', fontSize: 16 }}>{publishedLink}</a>
              </div>
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
            
            {/* Survey Sharing & Collaboration Component */}
            <div style={{ width: '100%', marginTop: 16 }}>
              <SurveySharing 
                surveyId={editSurveyId || ''} 
                surveyTitle={form.title} 
                isOwner={true} 
              />
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
                boxShadow: '0 2px 12px #552a4733',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 240,
                textAlign: 'center'
              }}>
                {alert.message}

              </div>
            )}
            
            {/* Header Section */}
            <div style={{
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
              transition: 'box-shadow 0.15s'
            }}>
              <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 26, margin: 0 }}>
                {isEditMode && form.title ? `Editing ${form.title}` : 'Add New Survey'}
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{ background: '#fff', color: '#552a47', border: '2px solid #552a47', borderRadius: 10, height: 36, fontWeight: 500, fontSize: 15, cursor: 'pointer', padding: '0 16px' }}
                  onClick={() => {
                    // Create a mapping of section indices to section names for the preview
                    const sectionNames: Record<number, string> = {};
                    steps.forEach((step, index) => {
                      if (index > 0 && index < steps.length - 1) { // Skip welcome screen and demographics
                        sectionNames[index - 1] = step.label;
                      }
                    });
                    
                    // Enhance existing questions with section names
                    let previewSelectedQuestions: Record<number, any[]> = {};
                    
                    // Check if we have real questions
                    const hasQuestions = selectedQuestions && 
                      Object.entries(selectedQuestions).some(([_, arr]) => 
                        Array.isArray(arr) && arr.length > 0
                      );
                    
                    if (hasQuestions && selectedQuestions) {
                      // Use the real questions but add section names to them
                      Object.entries(selectedQuestions).forEach(([sectionIdxStr, questions]) => {
                        const sectionIdx = parseInt(sectionIdxStr, 10);
                        const sectionName = sectionNames[sectionIdx] || `Section ${sectionIdx + 1}`;
                        
                        if (Array.isArray(questions) && questions.length > 0) {
                          // Add section name to each question
                          previewSelectedQuestions[sectionIdx] = questions.map(q => ({
                            ...q,
                            sectionName: sectionName
                          }));
                        }
                      });
                      
                      console.log('[SurveyBuilder] Enhanced real questions with section names:', previewSelectedQuestions);
                    } else {
                      // Create mock selected questions for preview - one for each section
                      console.log('[SurveyBuilder] No real questions found, creating mock questions');
                      
                      // Create 1-2 questions for each section
                      Object.entries(sectionNames).forEach(([sectionIdxStr, sectionName]) => {
                        const sectionIdx = parseInt(sectionIdxStr, 10);
                        previewSelectedQuestions[sectionIdx] = [
                          { 
                            value: `mock-q-${sectionIdx}-1`, 
                            label: `${sectionName} Question 1`,
                            sectionName: sectionName // Add section name to the question
                          },
                          { 
                            value: `mock-q-${sectionIdx}-2`, 
                            label: `${sectionName} Question 2`,
                            sectionName: sectionName // Add section name to the question
                          }
                        ];
                      });
                    }
                    
                    // Store complete survey data for preview
                    const completeData = {
                      ...form,
                      selectedQuestions: previewSelectedQuestions,
                      siteTextQuestions,
                      siteTextQForm,
                      selectedDemographics,
                      // Add mock data for preview
                      _id: previewToken,
                      shareToken: previewToken
                    };
                    
                    console.log('[SurveyBuilder] Preview data:', completeData);
                    localStorage.setItem(`survey-preview-${previewToken}`, JSON.stringify(completeData));
                    window.open(`/preview/survey/${previewToken}?status=preview`, '_blank');
                  }}
                >
                  Preview
                </button>
                <button
                  style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 10, height: 36, fontWeight: 600, fontSize: 15, cursor: saving ? 'wait' : 'pointer', padding: '0 16px', opacity: saving ? 0.6 : 1 }}
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
                {publishedLink && (
                  <button
                    style={{ background: '#fff', color: '#2ecc40', border: '2px solid #2ecc40', borderRadius: 10, height: 36, fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: '0 16px' }}
                    onClick={() => {
                      navigator.clipboard.writeText(publishedLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                      showSuccess('URL copied to clipboard!');
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy URL'}
                  </button>
                )}
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
                      borderBottom: openSection === i ? '2px solid #552a47' : '2px solid #e5d6c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    disabled={openSection === i}
                  >
                    <span>{s.label}</span>
                    <span style={{ display: 'inline-flex', transition: 'transform 0.2s', transform: openSection === i ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      {/* Right arrow SVG */}
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#552a47" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
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
                                reader.onload = ev => {
                                  const imageData = ev.target?.result as string;
                                  console.log('[SurveyBuilder] Setting image data:', imageData.substring(0, 100) + '...');
                                  setForm(f => ({ ...f, image: imageData }));
                                };
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
                              value={form.color || '#552a47'}
                              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                              style={{ width: 48, height: 32, border: 'none', background: 'none', cursor: 'pointer' }}
                            />
                            <span style={{ marginLeft: 10, fontSize: 15 }}>{form.color || '#552a47'}</span>
                          </div>
                        </>
                      ) : i === 4 ? (
                        <div style={{ marginBottom: 18 }}>
                          <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 18, color: '#552a47' }}>Survey Themes</h3>
                          <p style={{ marginBottom: 16, fontSize: 15 }}>Select a theme for your survey. The theme will affect the appearance and feel of your survey.</p>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                            {surveyThemes.map((theme: any) => {
                              const isSelected = defaultSettings.themes?.includes(theme._id);
                              return (
                                <div 
                                  key={theme._id} 
                                  onClick={() => setDefaultSettings({...defaultSettings, themes: [theme._id]})}
                                  style={{ 
                                    cursor: 'pointer',
                                    borderRadius: 8,
                                    border: `2px solid ${isSelected ? theme.color || '#552a47' : '#e0e0e0'}`,
                                    background: isSelected ? '#f5edf3' : '#fff',
                                    padding: '16px',
                                    transition: 'all 0.2s',
                                    boxShadow: isSelected ? '0 2px 8px rgba(85, 42, 71, 0.15)' : 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ 
                                      width: 24, 
                                      height: 24, 
                                      borderRadius: '50%', 
                                      background: theme.color || '#552a47',
                                      border: '1px solid #e0e0e0'
                                    }} />
                                    <div style={{ 
                                      fontWeight: isSelected ? 600 : 500, 
                                      fontSize: 16,
                                      color: isSelected ? '#552a47' : '#333'
                                    }}>
                                      {theme.name}
                                    </div>
                                  </div>
                                  
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between'
                                  }}>
                                    <div style={{ 
                                      fontSize: 14, 
                                      color: '#666',
                                      flex: 1,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {theme.description || 'No description'}
                                    </div>
                                    <div style={{ 
                                      width: 20, 
                                      height: 20, 
                                      borderRadius: '50%', 
                                      border: `2px solid ${isSelected ? theme.color || '#552a47' : '#ddd'}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: '#fff'
                                    }}>
                                      {isSelected && (
                                        <div style={{ 
                                          width: 12, 
                                          height: 12, 
                                          borderRadius: '50%', 
                                          background: theme.color || '#552a47' 
                                        }} />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : i === 4 ? (
                        <div style={{ marginBottom: 18 }}>
                          <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 18, color: '#552a47' }}>Survey Themes</h3>
                          <p style={{ marginBottom: 16, fontSize: 15 }}>Select a theme for your survey. The theme will affect the appearance and feel of your survey.</p>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                            {surveyThemes.map((theme: any) => {
                              const isSelected = defaultSettings.themes?.includes(theme._id);
                              return (
                                <div 
                                  key={theme._id} 
                                  onClick={() => setDefaultSettings({...defaultSettings, themes: [theme._id]})}
                                  style={{ 
                                    cursor: 'pointer',
                                    borderRadius: 8,
                                    border: `2px solid ${isSelected ? theme.color || '#552a47' : '#e0e0e0'}`,
                                    background: isSelected ? '#f5edf3' : '#fff',
                                    padding: '16px',
                                    transition: 'all 0.2s',
                                    boxShadow: isSelected ? '0 2px 8px rgba(85, 42, 71, 0.15)' : 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 12
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ 
                                      width: 24, 
                                      height: 24, 
                                      borderRadius: '50%', 
                                      background: theme.color || '#552a47',
                                      border: '1px solid #e0e0e0'
                                    }} />
                                    <div style={{ 
                                      fontWeight: isSelected ? 600 : 500, 
                                      fontSize: 16,
                                      color: isSelected ? '#552a47' : '#333'
                                    }}>
                                      {theme.name}
                                    </div>
                                  </div>
                                  
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between'
                                  }}>
                                    <div style={{ 
                                      fontSize: 14, 
                                      color: '#666',
                                      flex: 1,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {theme.description || 'No description'}
                                    </div>
                                    <div style={{ 
                                      width: 20, 
                                      height: 20, 
                                      borderRadius: '50%', 
                                      border: `2px solid ${isSelected ? theme.color || '#552a47' : '#ddd'}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: '#fff'
                                    }}>
                                      {isSelected && (
                                        <div style={{ 
                                          width: 12, 
                                          height: 12, 
                                          borderRadius: '50%', 
                                          background: theme.color || '#552a47' 
                                        }} />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (i >= 1 && i <= 3) ? (
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
                                    background: '#f9f4f7',
                                    borderRadius: 14,
                                    boxShadow: '0 2px 8px #f4ebf1',
                                    padding: '18px 24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 10
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
                                    <span style={{ background: '#fbe7f6', color: '#a54c8c', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>{q.theme}</span>
                                    <span style={{ background: '#e4f0fa', color: '#3776a8', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>{q.wpsCategory}</span>
                                    <span style={{ background: '#fff5e1', color: '#552a47', borderRadius: 7, padding: '2px 12px', fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>{QUE_TYPE_LABELS[q.queType] || q.queType}</span>
                                  </div>
                                  <div style={{ color: '#28211e', fontWeight: 600, fontSize: 17, letterSpacing: 0.1 }}>
                                    {q.text}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : i === 1 ? (
                        <div style={{ marginBottom: 18 }}>
                          <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 18, color: '#552a47' }}>Survey Sections</h3>
                          <p style={{ marginBottom: 16, fontSize: 15 }}>Customize the sections of your survey to organize questions and create a better user experience:</p>
                          
                          <SurveySections 
                            sections={surveySections} 
                            onSectionsChange={setSurveySections}
                            organizationId={Meteor.user()?.profile?.organization}
                          />
                        </div>
                      ) : i === 2 ? (
                        <div style={{ marginBottom: 18 }}>
                          <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 18, color: '#552a47' }}>Organize Questions by Section</h3>
                          <p style={{ marginBottom: 16, fontSize: 15 }}>Assign questions to specific sections to organize your survey content:</p>
                          
                          <div style={{ marginBottom: 24 }}>
                            <SectionQuestions
                              sections={surveySections.filter(s => s.isActive)}
                              questions={sectionQuestions}
                              onQuestionsChange={setSectionQuestions}
                            />
                          </div>
                          
                          <h3 style={{ margin: '24px 0 16px 0', fontWeight: 600, fontSize: 18, color: '#552a47' }}>Add Questions</h3>
                          <p style={{ marginBottom: 16, fontSize: 15 }}>Select questions from the question bank to include in your survey:</p>
                        </div>
                      ) : i === 6 ? (
                        <div style={{ marginBottom: 18 }}>
                          <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 18, color: '#552a47' }}>Question Branching Logic</h3>
                          <p style={{ marginBottom: 16, fontSize: 15 }}>Create conditional logic to determine which questions to show based on previous answers:</p>
                          
                          {editSurveyId ? (
                            <SurveyBranchingLogic
                              surveyId={editSurveyId}
                              questions={Object.entries(form.selectedQuestions || {}).map(([id, q]: [string, any]) => ({
                                id,
                                text: q.questionText || 'Untitled Question',
                                type: q.type || 'text'
                              }))}
                              existingLogic={form.branchingLogic}
                              onSave={(logic) => {
                                setForm({
                                  ...form,
                                  branchingLogic: logic
                                });
                              }}
                            />
                          ) : (
                            <div style={{ padding: '24px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
                              Please save the survey first to enable branching logic.
                            </div>
                          )}
                        </div>
                      ) : i === 7 ? (
                        <div style={{ marginBottom: 18 }}>
                          <div style={{ marginBottom: 16 }}>
                            <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 18, color: '#552a47' }}>Demographics Metrics</h3>
                          </div>
                          
                          <div style={{ marginBottom: 16 }}>
                            <p style={{ fontSize: 15, color: '#555', margin: '0 0 16px 0' }}>
                              Select which demographic data to collect when users answer this survey. This information helps analyze survey results across different demographic groups.
                            </p>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                            {demographicOptions.map(opt => {
                              const isSelected = selectedDemographics.includes(opt.value);
                              return (
                                <div key={opt.value} style={{ marginBottom: 10 }}>
                                  <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 10, 
                                    cursor: 'pointer',
                                    padding: '10px 14px',
                                    borderRadius: 8,
                                    border: '1px solid #e0e0e0',
                                    background: isSelected ? '#f5edf3' : '#fff',
                                    transition: 'all 0.2s',
                                    boxShadow: isSelected ? '0 2px 8px rgba(85, 42, 71, 0.08)' : 'none'
                                  }}>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {
                                        setSelectedDemographics(
                                          isSelected
                                            ? selectedDemographics.filter(v => v !== opt.value)
                                            : [...selectedDemographics, opt.value]
                                        );
                                      }}
                                      style={{ 
                                        width: 18, 
                                        height: 18,
                                        accentColor: '#552a47'
                                      }}
                                    />
                                    <span style={{ 
                                      fontWeight: isSelected ? 600 : 500, 
                                      fontSize: 15,
                                      color: isSelected ? '#552a47' : '#333'
                                    }}>
                                      {opt.label}
                                    </span>
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                          
                          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                            <button 
                              onClick={() => setSelectedDemographics(demographicOptions.map(opt => opt.value))}
                              style={{
                                padding: '8px 16px',
                                background: '#f5edf3',
                                border: '1px solid #e5d6e2',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#552a47',
                                transition: 'all 0.2s'
                              }}
                            >
                              Select All
                            </button>
                            <button 
                              onClick={() => setSelectedDemographics([])}
                              style={{
                                padding: '8px 16px',
                                background: '#f0f0f0',
                                border: '1px solid #ddd',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#555',
                                transition: 'all 0.2s'
                              }}
                            >
                              Clear All
                            </button>
                          </div>
                        </div>
                      ) : i === 8 ? (
                        <div style={{ marginBottom: 18 }}>
                          <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 18, color: '#552a47' }}>Default Survey Settings</h3>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
                            {/* Response Settings */}
                            <div>
                              <h4 style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: 16 }}>Response Settings</h4>
                              
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={defaultSettings.allowAnonymous} 
                                    onChange={() => setDefaultSettings({...defaultSettings, allowAnonymous: !defaultSettings.allowAnonymous})}
                                  />
                                  Allow Anonymous Responses
                                </label>
                              </div>
                              
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={defaultSettings.requireLogin} 
                                    onChange={() => setDefaultSettings({...defaultSettings, requireLogin: !defaultSettings.requireLogin})}
                                  />
                                  Require Login
                                </label>
                              </div>
                              
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={defaultSettings.allowSave} 
                                    onChange={() => setDefaultSettings({...defaultSettings, allowSave: !defaultSettings.allowSave})}
                                  />
                                  Allow Save & Continue
                                </label>
                              </div>
                              
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={defaultSettings.allowSkip} 
                                    onChange={() => setDefaultSettings({...defaultSettings, allowSkip: !defaultSettings.allowSkip})}
                                  />
                                  Allow Skipping Questions
                                </label>
                              </div>
                            </div>
                            
                            {/* Display Settings */}
                            <div>
                              <h4 style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: 16 }}>Display Settings</h4>
                              
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={defaultSettings.showProgressBar} 
                                    onChange={() => setDefaultSettings({...defaultSettings, showProgressBar: !defaultSettings.showProgressBar})}
                                  />
                                  Show Progress Bar
                                </label>
                              </div>
                              
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={defaultSettings.showThankYou} 
                                    onChange={() => setDefaultSettings({...defaultSettings, showThankYou: !defaultSettings.showThankYou})}
                                  />
                                  Show Thank You Screen
                                </label>
                              </div>
                              
                              {defaultSettings.showThankYou && (
                                <div style={{ marginBottom: 12 }}>
                                  <label style={{ display: 'block', marginBottom: 4 }}>Thank You Message</label>
                                  <textarea 
                                    value={defaultSettings.thankYouMessage} 
                                    onChange={(e) => setDefaultSettings({...defaultSettings, thankYouMessage: e.target.value})}
                                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd', minHeight: 80 }}
                                  />
                                </div>
                              )}
                              
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', marginBottom: 4 }}>Redirect URL (optional)</label>
                                <input 
                                  type="text" 
                                  value={defaultSettings.redirectUrl} 
                                  onChange={(e) => setDefaultSettings({...defaultSettings, redirectUrl: e.target.value})}
                                  placeholder="https://example.com/thank-you"
                                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                                />
                              </div>
                            </div>
                            
                            {/* Notification Settings */}
                            <div>
                              <h4 style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: 16 }}>Notification Settings</h4>
                               
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', marginBottom: 4 }}>Notification Emails (comma-separated)</label>
                                <input 
                                  type="text" 
                                  value={defaultSettings.notificationEmails?.join(', ') || ''} 
                                  onChange={(e) => setDefaultSettings({...defaultSettings, notificationEmails: e.target.value.split(',').map(email => email.trim()).filter(email => email)})}
                                  placeholder="email@example.com, another@example.com"
                                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                                />
                              </div>
                            </div>
                            
                            {/* Limits Settings */}
                            <div>
                              <h4 style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: 16 }}>Limits & Restrictions</h4>
                               
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', marginBottom: 4 }}>Response Limit (0 = unlimited)</label>
                                <input 
                                  type="number" 
                                  value={defaultSettings.responseLimit || 0} 
                                  onChange={(e) => setDefaultSettings({...defaultSettings, responseLimit: parseInt(e.target.value) || 0})}
                                  min="0"
                                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                                />
                              </div>
                               
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', marginBottom: 4 }}>Expiry Date (optional)</label>
                                <input 
                                  type="date" 
                                  value={defaultSettings.expiryDate ? new Date(defaultSettings.expiryDate).toISOString().split('T')[0] : ''} 
                                  onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value) : undefined;
                                    setDefaultSettings({...defaultSettings, expiryDate: date});
                                  }}
                                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                                />
                              </div>
                            </div>
                            
                            {/* Schedule Settings */}
                            <div>
                              <h4 style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: 16 }}>Schedule Settings</h4>
                               
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', marginBottom: 4 }}>Start Date (optional)</label>
                                <input 
                                  type="date" 
                                  value={defaultSettings.startDate ? new Date(defaultSettings.startDate).toISOString().split('T')[0] : ''} 
                                  onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value) : undefined;
                                    setDefaultSettings({...defaultSettings, startDate: date});
                                  }}
                                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                                />
                              </div>
                               
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={defaultSettings.autoPublish || false} 
                                    onChange={() => setDefaultSettings({...defaultSettings, autoPublish: !defaultSettings.autoPublish})}
                                  />
                                  Auto-publish on start date
                                </label>
                              </div>
                               
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={defaultSettings.recurringSchedule || false} 
                                    onChange={() => setDefaultSettings({...defaultSettings, recurringSchedule: !defaultSettings.recurringSchedule})}
                                  />
                                  Set recurring schedule
                                </label>
                              </div>
                               
                              {defaultSettings.recurringSchedule && (
                                <div style={{ marginBottom: 12 }}>
                                  <label style={{ display: 'block', marginBottom: 4 }}>Frequency</label>
                                  <select
                                    value={defaultSettings.recurringFrequency || 'monthly'}
                                    onChange={(e) => setDefaultSettings({...defaultSettings, recurringFrequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually'})}
                                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                                  >
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Bi-weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="annually">Annually</option>
                                  </select>
                                </div>
                              )}
                            </div>
                            
                            {/* Access Control */}
                            <div>
                              <h4 style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: 16 }}>Access Control</h4>
                               
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={defaultSettings.restrictAccess || false} 
                                    onChange={() => setDefaultSettings({...defaultSettings, restrictAccess: !defaultSettings.restrictAccess})}
                                  />
                                  Restrict access to specific groups
                                </label>
                              </div>
                               
                              {defaultSettings.restrictAccess && (
                                <div style={{ marginBottom: 12 }}>
                                  <label style={{ display: 'block', marginBottom: 4 }}>Allowed Groups</label>
                                  <Select
                                    isMulti
                                    placeholder="Select groups..."
                                    value={(defaultSettings.allowedGroups || []).map(group => ({ value: group, label: group }))} 
                                    onChange={(selected: MultiValue<{ value: string; label: string }>) => {
                                      setDefaultSettings({
                                        ...defaultSettings, 
                                        allowedGroups: selected ? selected.map(item => item.value) : []
                                      });
                                    }}
                                    options={[
                                      { value: 'employees', label: 'All Employees' },
                                      { value: 'managers', label: 'Managers' },
                                      { value: 'hr', label: 'HR Department' },
                                      { value: 'executives', label: 'Executives' },
                                      { value: 'contractors', label: 'Contractors' }
                                    ]}
                                    styles={{
                                      control: (provided) => ({
                                        ...provided,
                                        borderColor: '#ddd',
                                        boxShadow: 'none',
                                        '&:hover': {
                                          borderColor: '#552a47'
                                        }
                                      }),
                                      multiValue: (provided) => ({
                                        ...provided,
                                        backgroundColor: '#f0e6f5',
                                      }),
                                      multiValueLabel: (provided) => ({
                                        ...provided,
                                        color: '#552a47',
                                      }),
                                      multiValueRemove: (provided) => ({
                                        ...provided,
                                        color: '#552a47',
                                        '&:hover': {
                                          backgroundColor: '#552a47',
                                          color: 'white',
                                        },
                                      }),
                                    }}
                                  />
                                </div>
                              )}
                               
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={defaultSettings.passwordProtected || false} 
                                    onChange={() => setDefaultSettings({...defaultSettings, passwordProtected: !defaultSettings.passwordProtected})}
                                  />
                                  Password protect survey
                                </label>
                              </div>
                               
                              {defaultSettings.passwordProtected && (
                                <div style={{ marginBottom: 12 }}>
                                  <label style={{ display: 'block', marginBottom: 4 }}>Access Password</label>
                                  <input 
                                    type="password" 
                                    value={defaultSettings.accessPassword || ''} 
                                    onChange={(e) => setDefaultSettings({...defaultSettings, accessPassword: e.target.value})}
                                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : i === 10 ? (
                        <div style={{ marginBottom: 18 }}>
                          <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 18, color: '#552a47' }}>Survey Notifications</h3>
                          <p style={{ marginBottom: 16, fontSize: 15 }}>Send email notifications to invite participants or remind them to complete the survey:</p>
                          
                          {editSurveyId ? (
                            <SurveyNotifications
                              surveyId={editSurveyId}
                              surveyTitle={form.title}
                              notificationHistory={[]}
                            />
                          ) : (
                            <div style={{ padding: '24px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center' }}>
                              Please save and publish the survey first to enable notifications.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ marginBottom: 18, fontSize: 16, color: '#222222' }}>
                          Fields for <b>{s.label}</b> go here.
                        </div>
                      )}
                      {i > 0 && (
                        <button
                          type="button"
                          style={{ background: '#8a7a85', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, padding: '8px 24px', cursor: 'pointer', marginRight: 12 }}
                          onClick={() => setOpenSection(i - 1)}
                        >
                          Previous
                        </button>
                      )}
                      {i < steps.length - 1 && (
                        <button
                          type="button"
                          style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, padding: '8px 24px', cursor: 'pointer' }}
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

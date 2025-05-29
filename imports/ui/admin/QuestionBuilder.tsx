import React from 'react';
import { Meteor } from 'meteor/meteor';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './QuestionBuilder.quill.css';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import DashboardBg from './DashboardBg';
import { useLocation } from 'react-router-dom';
import { Questions } from '/imports/api/questions';
import EllipsisMenu from './EllipsisMenu';
import QuestionPreviewModal from './QuestionPreviewModal';
import { useNavigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { WPSCategories } from '/imports/api/wpsCategories';
import { SurveyThemes } from '/imports/api/surveyThemes';
import { QuestionTags } from '/imports/features/question-tags/api/questionTags';
import Select, { MultiValue, StylesConfig } from 'react-select';
import { saveQuestionsToDB, publishQuestionsToDB, mapQuestionToVersion } from './questions.methods.client';

// The Question interface is used for the builder state only. DB uses QuestionVersion.
// Define a custom field interface
interface CustomField {
  title: string;
  content: string;
}

interface Question {
  text: string;
  description: string;
  answerType: string;
  answers: string[];
  required: boolean;
  image: string;
  leftLabel?: string;
  rightLabel?: string;
  feedbackType?: 'none' | 'text' | 'rating' | 'file';
  feedbackValue?: string;
  wpsCategoryIds?: string[];
  surveyThemeIds?: string[];
  questionTagId?: string;
  customFields?: CustomField[];
  isReusable?: boolean;
  priority?: number;
  isActive?: boolean;
  keywords?: string[];
  organizationId?: string;
}

const QuestionBuilder: React.FC =  () => {
  const userId = Meteor.userId()!;
  // Get ?edit=... param from URL
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editId = params.get('edit');
  // Alert state and helpers (matching WPSFramework)
  const [alert, setAlert] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  function showSuccess(msg: string) {
    setAlert({ type: 'success', message: msg });
    setTimeout(() => setAlert(null), 3000);
  }
  function showError(msg: string) {
    setAlert({ type: 'error', message: msg });
    setTimeout(() => setAlert(null), 4000);
  }
  // ...existing state and handlers...
  const [previewIdx, setPreviewIdx] = React.useState<number|null>(null);
  const handleOpenPreview = (idx: number) => setPreviewIdx(idx);
  const handleClosePreview = () => setPreviewIdx(null);
  // ...existing state and handlers...

  // Fetch the editing question if in edit mode
  const editingDoc = useTracker(() => (editId ? Questions.findOne(editId) : null), [editId]);

  // Meteor subscriptions 
  const wpsCategoriesSub = useTracker(() => Meteor.subscribe('wpsCategories.all'));
  const wpsCategories = useTracker(() => WPSCategories.find().fetch(), [wpsCategoriesSub.ready()]);
  
  const surveyThemesSub = useTracker(() => Meteor.subscribe('surveyThemes.all'));
  const surveyThemes = useTracker(() => SurveyThemes.find().fetch(), [surveyThemesSub.ready()]);
  
  const questionTagsSub = useTracker(() => Meteor.subscribe('questionTags'));
  const questionTags = useTracker(() => QuestionTags.find().fetch(), [questionTagsSub.ready()]);

  // Handlers for react-select multi-selects
  const handleWpsCategoryChange = (qIdx: number, selected: MultiValue<{ value: string; label: string; color: string }>) => {
    const updated = [...questions];
    updated[qIdx].wpsCategoryIds = selected ? selected.map(item => item.value) : [];
    setQuestions(updated);
  };
  const handleSurveyThemeChange = (qIdx: number, selected: MultiValue<{ value: string; label: string; color: string }>) => {
    const updated = [...questions];
    updated[qIdx].surveyThemeIds = selected ? selected.map(item => item.value) : [];
    setQuestions(updated);
  };

  const handleQuestionTagChange = (qIdx: number, selected: { value: string; label: string; color: string } | null) => {
    const updated = [...questions];
    updated[qIdx].questionTagId = selected ? selected.value : undefined;
    setQuestions(updated);
  };

  // Handlers for custom fields
  const handleAddCustomField = (qIdx: number) => {
    const updated = [...questions];
    if (!updated[qIdx].customFields) {
      updated[qIdx].customFields = [];
    }
    updated[qIdx].customFields.push({ title: '', content: '' });
    setQuestions(updated);
  };

  const handleRemoveCustomField = (qIdx: number, fieldIdx: number) => {
    const updated = [...questions];
    if (updated[qIdx].customFields) {
      updated[qIdx].customFields = updated[qIdx].customFields.filter((_, idx) => idx !== fieldIdx);
      setQuestions(updated);
    }
  };

  const handleCustomFieldTitleChange = (qIdx: number, fieldIdx: number, value: string) => {
    const updated = [...questions];
    if (updated[qIdx].customFields && updated[qIdx].customFields[fieldIdx]) {
      updated[qIdx].customFields[fieldIdx].title = value;
      setQuestions(updated);
    }
  };

  const handleCustomFieldContentChange = (qIdx: number, fieldIdx: number, value: string) => {
    const updated = [...questions];
    if (updated[qIdx].customFields && updated[qIdx].customFields[fieldIdx]) {
      updated[qIdx].customFields[fieldIdx].content = value;
      setQuestions(updated);
    }
  };

  // Custom styles for react-select to show color chips
  const colorMultiStyles: StylesConfig<any, true> = {
    option: (styles, { data, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? data.color : undefined,
      color: isSelected ? '#fff' : '#28211e',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
    }),
    multiValue: (styles, { data }) => ({
      ...styles,
      backgroundColor: data.color,
      color: '#fff',
      borderRadius: 8,
      fontWeight: 600,
      paddingLeft: 8,
      paddingRight: 8,
      display: 'flex',
      alignItems: 'center',
    }),
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: '#fff',
      fontWeight: 600,
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      color: '#fff',
      ':hover': {
        backgroundColor: '#333',
        color: '#fff',
      },
    }),
  };


  // Handler to publish questions
  const publishQuestions = async () => {
    try {
      const userId = Meteor.userId?.() || '';
      if (editId) {
        // Only publish the currently edited question
        const q = questions[0];
        await Meteor.callAsync('questions.update', editId, mapQuestionToVersion(q, userId, true), userId);
      } else {
        await publishQuestionsToDB(questions, userId);
      }
      showSuccess('Questions have been published!');
      setTimeout(() => navigate('/admin/questions/all'), 1200);
    } catch (err: any) {
      showError('Failed to publish questions: ' + (err?.reason || err?.message || 'Unknown error'));
    }
  };

  const [collapsed, setCollapsed] = React.useState<boolean[]>([]);
  const navigate = useNavigate();
  const [questions, setQuestions] = React.useState<Question[]>([
    { 
      text: '', 
      description: '', 
      answerType: 'short_text', 
      answers: [''], 
      required: false, 
      image: '', 
      leftLabel: 'Strongly Disagree', 
      rightLabel: 'Strongly Agree', 
      feedbackType: 'none', 
      feedbackValue: '',
      isReusable: true,
      isActive: true,
      priority: 3,
      keywords: [],
      customFields: []
    }
  ]);

  // Prepopulate form if editing
  React.useEffect(() => {
    if (editingDoc) {
      // Use the latest version from DB
      const latest = editingDoc.versions && editingDoc.versions.length > 0 ? editingDoc.versions[editingDoc.versions.length - 1] : undefined;
      if (latest && typeof latest === 'object') {
        setQuestions([
          {
            text: (latest as any).questionText || '',
            description: (latest as any).description || '',
            answerType: (latest as any).responseType || 'short_text',
            answers: Array.isArray((latest as any).options) ? (latest as any).options : (Array.isArray((latest as any).answers) ? (latest as any).answers : ['']),
            required: !!(latest as any).required,
            image: (latest as any).image || '',
            leftLabel: (latest as any).leftLabel,
            rightLabel: (latest as any).rightLabel,
            feedbackType: (latest as any).feedbackType || 'none',
            feedbackValue: (latest as any).feedbackValue || '',
            wpsCategoryIds: (latest as any).categoryTags || [],
            surveyThemeIds: (latest as any).surveyThemes || [],
            questionTagId: (latest as any).questionTag,
            customFields: (latest as any).customFields || [],
            isReusable: (latest as any).isReusable !== undefined ? (latest as any).isReusable : true,
            isActive: (latest as any).isActive !== undefined ? (latest as any).isActive : true,
            priority: (latest as any).priority || 3,
            keywords: (latest as any).keywords || [],
            organizationId: (latest as any).organizationId || ''
          }
        ]);
      }
    }
  }, [editingDoc]);

  // Ensure collapsed state matches questions
  React.useEffect(() => {
    setCollapsed(prev => {
      if (questions.length > prev.length) {
        return [...prev, ...Array(questions.length - prev.length).fill(false)];
      } else if (questions.length < prev.length) {
        return prev.slice(0, questions.length);
      }
      return prev;
    });
  }, [questions.length]);

  // Collapse/Expand handler
  const handleToggleCollapse = (idx: number) => {
    setCollapsed(prev => prev.map((val, i) => (i === idx ? !val : val)));
  };

  const answerTypes = [
    { value: 'short_text', label: 'Short Text' },
    { value: 'long_text', label: 'Long Text' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'likert', label: 'Likert Scale' },
    { value: 'quick_tabs', label: 'Quick Tabs' },
    { value: 'free_text', label: 'Free-Text' }
  ];

  const handleQuestionChange = (idx: number, value: string) => {
    const updated = [...questions];
    updated[idx].text = value;
    setQuestions(updated);
  };

  const handleDescriptionChange = (idx: number, value: string) => {
    const updated = [...questions];
    updated[idx].description = value;
    setQuestions(updated);
  };

  const handleAnswerTypeChange = (idx: number, value: string) => {
    const updated = [...questions];
    updated[idx].answerType = value;
    // Reset or initialize answers and likert labels as needed
    if (["multiple_choice", "checkbox", "dropdown", "quick_tabs"].includes(value)) {
      updated[idx].answers = updated[idx].answers && updated[idx].answers.length ? updated[idx].answers : [""];
    } else if (value === "likert") {
      updated[idx].leftLabel = updated[idx].leftLabel || "Strongly Disagree";
      updated[idx].rightLabel = updated[idx].rightLabel || "Strongly Agree";
      updated[idx].answers = ["1", "2", "3", "4", "5"];
    } else {
      updated[idx].answers = [];
      if (updated[idx].leftLabel !== undefined) delete updated[idx].leftLabel;
      if (updated[idx].rightLabel !== undefined) delete updated[idx].rightLabel;
    }
    setQuestions(updated);
  };


  const handleAnswerChange = (qIdx: number, aIdx: number, value: string) => {
    const updated = [...questions];
    updated[qIdx].answers[aIdx] = value;
    setQuestions(updated);
  };




  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', description: '', answerType: 'short_text', answers: [''], required: false, image: '', leftLabel: 'Strongly Disagree', rightLabel: 'Strongly Agree' }
    ]);
  };


  const handleImageChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const updated = [...questions];
        updated[idx].image = ev.target?.result as string;
        setQuestions(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRequiredToggle = (idx: number) => {
    const updated = [...questions];
    updated[idx].required = !updated[idx].required;
    setQuestions(updated);
  };

  const addAnswer = (qIdx: number) => {
    const updated = [...questions];
    updated[qIdx].answers.push('');
    setQuestions(updated);
  };

const handleRemoveImage = (idx: number) => {
  const updated = [...questions];
  updated[idx].image = '';
  setQuestions(updated);
};

const handleRemoveQuestion = (idx: number) => {
  const updated = [...questions];
  updated.splice(idx, 1);
  setQuestions(updated);
};

const removeAnswer = (qIdx: number, aIdx: number) => {
  const updated = [...questions];
  updated[qIdx].answers.splice(aIdx, 1);
  setQuestions(updated);
};

const saveQuestions = async () => {
  try {
    const userId = Meteor.userId?.() || '';
    if (editId) {
      // Only update the existing question (single-question edit)
      const q = questions[0];
      await Meteor.callAsync('questions.update', editId, mapQuestionToVersion(q, userId, false), userId);
    } else {
      await saveQuestionsToDB(questions, userId);
    }
    showSuccess('Questions saved!');
    setTimeout(() => navigate('/admin/questions/all'), 1200);
  } catch (err: any) {
    showError('Failed to save questions: ' + (err?.reason || err?.message || 'Unknown error'));
  }
};

// Handler for Likert label changes
const handleLikertLabelChange = (idx: number, labelKey: 'leftLabel' | 'rightLabel', value: string) => {
  const updated = [...questions];
  updated[idx][labelKey] = value;
  setQuestions(updated);
};

return (
  <AdminLayout>
    <DashboardBg>
    {/* Custom Alert (matching WPSFramework) */}
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
      }}>{alert.message}</div>
    )}
    <div style={{ padding: '32px 0', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', borderRadius: 18, padding: '32px 32px 40px 32px' }}>
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          padding: '10px 0 10px 0'
        }}>
          <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 26, margin: 0 }}>Questions</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editId ? null : (
              <button onClick={addQuestion} style={{ background: '#fff', color: '#552a47', border: '2px solid #552a47', borderRadius: 10, height: 36, fontWeight: 500, fontSize: 15, cursor: 'pointer', padding: '0 16px' }}>
                + Add Question
              </button>
            )}
            <button onClick={saveQuestions} style={{ background: '#552a47', color: '#fff', border: 'none', borderRadius: 10, height: 36, fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: '0 16px' }}>
              Save
            </button>
            <button onClick={publishQuestions} style={{ background: '#2ecc40', color: '#fff', border: 'none', borderRadius: 10, height: 36, fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: '0 16px' }}>
              Publish
            </button>
          </div>
          </div>
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
            <strong>Welcome to the Question Builder</strong><br/>
            This is your central hub for managing all survey questions. From here, you can easily browse, search, and organize your question library to build consistent and meaningful surveys.
          </div>
           {questions.map((q, qIdx) => (
  <div key={qIdx} style={{ marginBottom: 36, padding: '24px 24px 18px 24px', border: '1px solid #CACACA', background: '#fff', borderRadius: 10 }}>
    {previewIdx === qIdx && (
      <QuestionPreviewModal
        question={q}
        open={true}
        onClose={handleClosePreview}
      />
    )}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, background: '#FFF4D7', borderRadius: 10, border: '1px solid #CACACA', padding: '12px 18px' }}>
      <div style={{ fontWeight: 800, fontSize: 18, color: '#000', textTransform: 'uppercase', letterSpacing: 1 }}>Question {qIdx + 1}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 500, fontSize: 15, color: '#000' }}>Required</span>
          <label style={{ display: 'inline-block', position: 'relative', width: 40, height: 22, cursor: 'pointer', margin: 0 }}>
            <input
              type="checkbox"
              checked={q.required}
              onChange={() => handleRequiredToggle(qIdx)}
              style={{ opacity: 0, width: 40, height: 22, margin: 0, position: 'absolute', left: 0, top: 0, zIndex: 2, cursor: 'pointer' }}
            />
            <span style={{
              display: 'block',
              width: 40,
              height: 22,
              background: q.required ? '#552a47' : '#ccc',
              borderRadius: 22,
              transition: 'background 0.2s',
              position: 'absolute',
              left: 0,
              top: 0,
              zIndex: 1
            }} />
            <span style={{
              display: 'block',
              width: 18,
              height: 18,
              background: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              left: q.required ? 20 : 2,
              top: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
              transition: 'left 0.2s',
              zIndex: 1
            }} />
          </label>
        </div>
        <button onClick={() => handleRemoveQuestion(qIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} title="Remove question">
          <span style={{ display: 'flex', alignItems: 'center', color: '#b80d2b', fontSize: 22 }}>
            {/* Bin icon below */}
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
          </span>
        </button>
        <EllipsisMenu
          onDuplicate={() => {}}
        />
        <button onClick={() => handleOpenPreview(qIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} title="Preview question">
          <span style={{ display: 'flex', alignItems: 'center', color: '#1da463', fontSize: 22 }}>
            {/* Eye icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </span>
        </button>
        <button onClick={() => handleToggleCollapse(qIdx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} title="Toggle collapse">
          <span style={{ display: 'flex', alignItems: 'center', color: '#3776a8', fontSize: 22 }}>
            {collapsed[qIdx] ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 9 18 15"/></svg>
            )}
          </span>
        </button>
      </div>
    </div>
    {/* Question Fields */}
    {!collapsed[qIdx] && (
      <div>
        {/* Question Row */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, color: '#000', fontSize: 16, textTransform: 'uppercase', display: 'block' }}>Question</label>
          <input
            type="text"
            value={q.text}
            onChange={e => handleQuestionChange(qIdx, e.target.value)}
            placeholder="Enter question text"
            style={{ width: '100%', fontSize: 17, padding: '10px 14px', borderRadius: 8, border: '1px solid #CACACA', marginTop: 6, background: '#fff', color: '#000', boxSizing: 'border-box', display: 'block' }}
          />
        </div>
        {/* Description Field */}
        <div style={{ marginBottom: 72 }}>
          <label style={{ fontWeight: 500, color: '#000', fontSize: 16, textTransform: 'uppercase', display: 'block' }}>Description</label>
          <ReactQuill
            value={q.description}
            onChange={value => handleDescriptionChange(qIdx, value)}
            theme="snow"
            placeholder="Enter question description (optional)"
            style={{ marginBottom: 16, background: '#fff', borderRadius: 8, minHeight: 80 }}
          />

          {/* WPS Categories Multi-Select */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', marginRight: 10, display: 'block', marginBottom: 6 }}>WPS Categories</label>
            <Select
              isMulti
              isLoading={!wpsCategoriesSub.ready()}
              options={wpsCategories.map((cat: any) => ({ value: cat._id, label: cat.name, color: cat.color }))}
              value={(q.wpsCategoryIds || []).map(id => {
                const cat = wpsCategories.find((c: any) => c._id === id);
                return cat ? { value: cat._id, label: cat.name, color: cat.color } : null;
              }).filter(Boolean)}
              onChange={selected => handleWpsCategoryChange(qIdx, selected)}
              styles={colorMultiStyles}
              placeholder="Select WPS Categories..."
              closeMenuOnSelect={false}
              noOptionsMessage={() => wpsCategoriesSub.ready() ? 'No categories found' : 'Loading...'}
              classNamePrefix="react-select"
            />
          </div>

          {/* Survey Themes Multi-Select */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', marginRight: 10, display: 'block', marginBottom: 6 }}>Survey Themes</label>
            <Select
              isMulti
              isLoading={!surveyThemesSub.ready()}
              options={surveyThemes.map((theme: any) => ({ value: theme._id, label: theme.name, color: theme.color }))}
              value={(q.surveyThemeIds || []).map(id => {
                const theme = surveyThemes.find((t: any) => t._id === id);
                return theme ? { value: theme._id, label: theme.name, color: theme.color } : null;
              }).filter(Boolean)}
              onChange={selected => handleSurveyThemeChange(qIdx, selected)}
              styles={colorMultiStyles}
              placeholder="Select Survey Themes..."
              closeMenuOnSelect={false}
              noOptionsMessage={() => surveyThemesSub.ready() ? 'No themes found' : 'Loading...'}
              classNamePrefix="react-select"
            />
          </div>
          
          {/* Question Tag Single-Select */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600, fontSize: 15, color: '#28211e', marginRight: 10, display: 'block', marginBottom: 6 }}>Question Tag</label>
            <Select
              isLoading={!questionTagsSub.ready()}
              options={questionTags.map((tag: any) => ({ value: tag._id, label: tag.name, color: tag.color }))}
              value={q.questionTagId ? (() => {
                const tag = questionTags.find((t: any) => t._id === q.questionTagId);
                return tag ? { value: tag._id, label: tag.name, color: tag.color } : null;
              })() : null}
              onChange={(selected: any) => handleQuestionTagChange(qIdx, selected)}
              styles={colorMultiStyles}
              placeholder="Select Question Tag..."
              isClearable
              noOptionsMessage={() => questionTagsSub.ready() ? 'No tags found' : 'Loading...'}
              classNamePrefix="react-select"
            />
          </div>
          

          
          {/* Reusability Settings */}
          <div style={{ marginBottom: 18, padding: 16, background: '#f9f4f7', borderRadius: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#28211e', marginBottom: 12 }}>Reusability Settings</div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
              {/* Reusable Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 15, color: '#000' }}>Reusable</span>
                <label style={{ display: 'inline-block', position: 'relative', width: 40, height: 22, cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={q.isReusable}
                    onChange={() => {
                      const updated = [...questions];
                      updated[qIdx].isReusable = !updated[qIdx].isReusable;
                      setQuestions(updated);
                    }}
                    style={{ opacity: 0, width: 40, height: 22, margin: 0, position: 'absolute', left: 0, top: 0, zIndex: 2, cursor: 'pointer' }}
                  />
                  <span style={{
                    display: 'block',
                    width: 40,
                    height: 22,
                    background: q.isReusable ? '#4caf50' : '#ccc',
                    borderRadius: 22,
                    transition: 'background 0.2s',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: 1
                  }} />
                  <span style={{
                    display: 'block',
                    width: 18,
                    height: 18,
                    background: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    left: q.isReusable ? 20 : 2,
                    top: 2,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                    transition: 'left 0.2s',
                    zIndex: 1
                  }} />
                </label>
              </div>
              
              {/* Active Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500, fontSize: 15, color: '#000' }}>Active</span>
                <label style={{ display: 'inline-block', position: 'relative', width: 40, height: 22, cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={q.isActive}
                    onChange={() => {
                      const updated = [...questions];
                      updated[qIdx].isActive = !updated[qIdx].isActive;
                      setQuestions(updated);
                    }}
                    style={{ opacity: 0, width: 40, height: 22, margin: 0, position: 'absolute', left: 0, top: 0, zIndex: 2, cursor: 'pointer' }}
                  />
                  <span style={{
                    display: 'block',
                    width: 40,
                    height: 22,
                    background: q.isActive ? '#3776a8' : '#ccc',
                    borderRadius: 22,
                    transition: 'background 0.2s',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: 1
                  }} />
                  <span style={{
                    display: 'block',
                    width: 18,
                    height: 18,
                    background: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    left: q.isActive ? 20 : 2,
                    top: 2,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                    transition: 'left 0.2s',
                    zIndex: 1
                  }} />
                </label>
              </div>
              
              {/* Priority Dropdown */}
              <div>
                <label style={{ fontWeight: 500, fontSize: 15, color: '#000', display: 'block', marginBottom: 4 }}>Priority</label>
                <select 
                  value={q.priority} 
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[qIdx].priority = parseInt(e.target.value);
                    setQuestions(updated);
                  }}
                  style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd' }}
                >
                  <option value="1">1 (Highest)</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5 (Lowest)</option>
                </select>
              </div>
            </div>
            
            {/* Keywords */}
            <div>
              <label style={{ fontWeight: 500, fontSize: 15, color: '#000', display: 'block', marginBottom: 4 }}>Keywords (comma-separated)</label>
              <input
                type="text"
                value={(q.keywords || []).join(', ')}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[qIdx].keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                  setQuestions(updated);
                }}
                placeholder="Enter keywords separated by commas"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              />
            </div>
          </div>
        </div>
        {/* Image Upload */}
        <div style={{ marginTop: 24, marginBottom: 16 }}>
          <label style={{ fontWeight: 500, color: '#000', fontSize: 16, textTransform: 'uppercase', display: 'block' }}>Featured Image</label>
          <input
            type="file"
            onChange={e => handleImageChange(qIdx, e)}
            style={{ width: '100%', fontSize: 17, padding: '10px 14px', borderRadius: 8, border: '1px solid #CACACA', marginTop: 6, background: '#fff', color: '#000', boxSizing: 'border-box', display: 'block' }}
          />
          {q.image && (
            <div style={{ marginTop: 6, marginBottom: 8 }}>
              <img src={q.image} alt="attachment preview" style={{ maxWidth: '180px', maxHeight: '120px', borderRadius: 8, border: '1px solid #CACACA' }} />
              <button onClick={() => handleRemoveImage(qIdx)} style={{ marginLeft: 10, background: 'none', border: 'none', color: '#b80d2b', cursor: 'pointer', fontWeight: 500 }}>Remove</button>
            </div>
          )}
        </div>
        {/* Answer Type */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 500, color: '#000', fontSize: 15, textTransform: 'uppercase' }}>Answer Type</label>
          <select
            value={q.answerType}
            onChange={e => handleAnswerTypeChange(qIdx, e.target.value)}
            style={{ width: '100%', fontSize: 16, padding: '9px 14px', borderRadius: 8, border: '1px solid #CACACA', marginTop: 6, background: '#fff', color: '#000' }}
          >
            {answerTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        {/* Answers */}
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #CACACA', padding: '12px 14px' }}>
          <label style={{ fontWeight: 500, color: '#000', fontSize: 15, textTransform: 'uppercase' }}>Answers</label>
          {/* Dynamic Answers UI */}
          {["multiple_choice", "checkbox", "dropdown"].includes(q.answerType) && (
            <>
              {q.answers.map((a, aIdx) => (
                <div key={aIdx} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, background: '#fff', padding: '8px 10px' }}>
                  <input
                    type="text"
                    value={a}
                    onChange={e => handleAnswerChange(qIdx, aIdx, e.target.value)}
                    placeholder={`Option ${aIdx + 1}`}
                    style={{ flex: 1, fontSize: 16, padding: '8px 12px', background: '#fff', border: 'none', boxShadow: 'none' }}
                  />
                  {q.answers.length > 1 && (
                    <button onClick={() => removeAnswer(qIdx, aIdx)} style={{ background: 'none', border: 'none', color: '#552a47', fontWeight: 500, fontSize: 20, cursor: 'pointer' }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={() => addAnswer(qIdx)} style={{ background: 'none', border: 'none', color: '#3776a8', fontWeight: 500, fontSize: 15, cursor: 'pointer', marginTop: 6 }}>+ Add Option</button>
            </>
          )}
          {q.answerType === "likert" && (
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <input
                  type="text"
                  value={q.leftLabel || ''}
                  onChange={e => handleLikertLabelChange(qIdx, 'leftLabel', e.target.value)}
                  placeholder="Left label"
                  style={{ width: 120, fontSize: 15, padding: '7px 10px', border: '1px solid #CACACA', borderRadius: 6 }}
                />
                <div style={{ flex: 1, textAlign: 'center', color: '#888', fontSize: 15 }}>
                  Likert Scale
                </div>
                <input
                  type="text"
                  value={q.rightLabel || ''}
                  onChange={e => handleLikertLabelChange(qIdx, 'rightLabel', e.target.value)}
                  placeholder="Right label"
                  style={{ width: 120, fontSize: 15, padding: '7px 10px', border: '1px solid #CACACA', borderRadius: 6 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                {q.answers && q.answers.map((val, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: '#f5f5f5', borderRadius: 6, border: '1px solid #CACACA', fontWeight: 500 }}>{val}</div>
                ))}
              </div>
            </div>
          )}
          {q.answerType === "quick_tabs" && (
            <>
              {q.answers.map((a, aIdx) => (
                <div key={aIdx} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, background: '#fff', padding: '8px 10px' }}>
                  <input
                    type="text"
                    value={a}
                    onChange={e => handleAnswerChange(qIdx, aIdx, e.target.value)}
                    placeholder={`Tab ${aIdx + 1}`}
                    style={{ flex: 1, fontSize: 16, padding: '8px 12px', background: '#fff', border: 'none', boxShadow: 'none' }}
                  />
                  {q.answers.length > 1 && (
                    <button onClick={() => removeAnswer(qIdx, aIdx)} style={{ background: 'none', border: 'none', color: '#552a47', fontWeight: 500, fontSize: 20, cursor: 'pointer' }}>×</button>
                  )}
                </div>
              ))}
              <button onClick={() => addAnswer(qIdx)} style={{ background: 'none', border: 'none', color: '#3776a8', fontWeight: 500, fontSize: 15, cursor: 'pointer', marginTop: 6 }}>+ Add Tab</button>
            </>
          )}
          {["short_text", "long_text", "free_text"].includes(q.answerType) && (
            <div style={{ marginTop: 10, marginBottom: 8 }}>
              <input
                type={q.answerType === "long_text" ? "textarea" : "text"}
                disabled
                placeholder={q.answerType === "long_text" ? "Long text answer preview" : "Short text answer preview"}
                style={{ width: '100%', maxWidth: '100%', fontSize: 16, padding: '8px 12px', border: '1px solid #CACACA', borderRadius: 6, background: '#f8f8f8', color: '#888', boxSizing: 'border-box' }}
              />
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: 30 }}></div>
        
        {/* Custom Fields Section */}
        <div style={{ marginBottom: 24, padding: 16, background: '#f9f9f9', borderRadius: 8, border: '1px solid #eaeaea' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#28211e' }}>Custom Fields</div>
            <button
              onClick={() => handleAddCustomField(qIdx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#552a47',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                padding: '6px 12px',
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: 18 }}>+</span>
              Add Field
            </button>
          </div>
          
          {/* List of Custom Fields */}
          {(q.customFields || []).length === 0 && (
            <div style={{ color: '#666', fontStyle: 'italic', padding: '8px 0' }}>
              No custom fields added. Click 'Add Field' to create one.
            </div>
          )}
          
          {(q.customFields || []).map((field, fieldIdx) => (
            <div key={fieldIdx} style={{ marginBottom: 16, padding: 12, background: '#fff', borderRadius: 6, border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Field {fieldIdx + 1}</div>
                <button
                  onClick={() => handleRemoveCustomField(qIdx, fieldIdx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#e74c3c',
                    cursor: 'pointer',
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Remove field"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
              
              {/* Field Title */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontWeight: 500, fontSize: 14, color: '#555', display: 'block', marginBottom: 4 }}>Field Title</label>
                <input
                  type="text"
                  value={field.title}
                  onChange={(e) => handleCustomFieldTitleChange(qIdx, fieldIdx, e.target.value)}
                  placeholder="Enter field title"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    fontSize: 15,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              {/* Field Content */}
              <div>
                <label style={{ fontWeight: 500, fontSize: 14, color: '#555', display: 'block', marginBottom: 4 }}>Field Content</label>
                <textarea
                  value={field.content}
                  onChange={(e) => handleCustomFieldContentChange(qIdx, fieldIdx, e.target.value)}
                  placeholder="Enter field content"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid #ddd',
                    fontSize: 15,
                    minHeight: 80,
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        {/* Feedback Section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontWeight: 500, fontSize: 15, color: '#28211e', textTransform: 'uppercase', letterSpacing: 0.5 }}>Feedback</span>
            <select
              value={q.feedbackType || 'none'}
              onChange={e => {
                const updated = [...questions];
                updated[qIdx].feedbackType = e.target.value as 'none' | 'text' | 'rating' | 'file';
                updated[qIdx].feedbackValue = '';
                setQuestions(updated);
              }}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 15 }}
            >
              <option value="none">No Feedback</option>
              <option value="text">Text Feedback</option>
              <option value="rating">Rating Feedback</option>
              <option value="file">File Upload</option>
            </select>
          </div>
          {/* Feedback Input Area */}
          {q.feedbackType === 'text' && (
            <input
              type="text"
              value={q.feedbackValue || ''}
              onChange={e => {
                const updated = [...questions];
                updated[qIdx].feedbackValue = e.target.value;
                setQuestions(updated);
              }}
              placeholder="Prompt for feedback (e.g. 'Explain your answer')"
              style={{ width: '100%', fontSize: 15, padding: '10px 12px', borderRadius: 8, border: '1px solid #CACACA', background: '#fff', color: '#333', marginBottom: 4, boxSizing: 'border-box' }}
            />
          )}
          {q.feedbackType === 'rating' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, marginBottom: 4 }}>
              <span style={{ color: '#888', fontSize: 15 }}>User will be asked for a rating (1-5 stars)</span>
            </div>
          )}
          {q.feedbackType === 'file' && (
            <div style={{ marginTop: 3, marginBottom: 4 }}>
              <span style={{ color: '#888', fontSize: 15 }}>User will be asked to upload a file as feedback</span>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
           ))}
        </div> {/* close inner container */}
      </div> {/* close outer container */}
      </DashboardBg>
    </AdminLayout>
  );
}

export default QuestionBuilder;
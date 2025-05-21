import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Surveys } from '/imports/api/surveys';
import DashboardBg from '../admin/DashboardBg';
import SurveyWelcome from '../SurveyWelcome';
import SurveyQuestion from '../SurveyQuestion';

const SurveyPublic: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const isPreviewMode = new URLSearchParams(location.search).get('status') === 'preview';
  
  // For preview mode, get survey from localStorage
  const previewSurvey = React.useMemo(() => {
    if (!isPreviewMode || !token) return null;
    try {
      const storedData = localStorage.getItem(`survey-preview-${token}`);
      if (!storedData) return null;
      const surveyData = JSON.parse(storedData);
      console.log('[SurveyPublic] Loaded preview survey from localStorage:', surveyData);
      return surveyData;
    } catch (e) {
      console.error('[SurveyPublic] Error loading preview survey:', e);
      return null;
    }
  }, [isPreviewMode, token]);

  // For published surveys, get from database
  const dbSurvey = useTracker(() => {
    if (isPreviewMode || !token) return null;
    Meteor.subscribe('surveys.preview', token);
    return Surveys.findOne({ shareToken: token });
  }, [isPreviewMode, token]);

  // Use either preview or database survey
  const survey = isPreviewMode ? previewSurvey : dbSurvey;

  // State for questions, loading, and error
  const [questions, setQuestions] = React.useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = React.useState(false);
  const [questionsError, setQuestionsError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<'welcome' | number | 'done' | 'no-questions'>('welcome');

  // Extract all question IDs from selectedQuestions and siteTextQuestions
  React.useEffect(() => {
    if (!survey) return;
    setLoadingQuestions(true);
    setQuestionsError(null);
    try {
      let ids: string[] = [];
      // selectedQuestions: Record<string, any> (section: string[])
      if (survey.selectedQuestions && typeof survey.selectedQuestions === 'object') {
        Object.values(survey.selectedQuestions).forEach((arr: any) => {
          if (Array.isArray(arr)) {
            // Handle both string IDs and objects with value property
            arr.forEach((item: any) => {
              if (typeof item === 'string') ids.push(item);
              else if (item && typeof item === 'object' && item.value) ids.push(item.value);
            });
          }
        });
      }
      // siteTextQuestions: array of question IDs or objects with _id
      if (Array.isArray(survey.siteTextQuestions)) {
        survey.siteTextQuestions.forEach((q: any) => {
          if (typeof q === 'string') ids.push(q);
          else if (q && typeof q === 'object' && typeof q._id === 'string') ids.push(q._id);
        });
      }
      if (ids.length === 0) {
        setQuestions([]);
        setLoadingQuestions(false);
        console.log('[SurveyPublic] No question IDs found in survey.');
        return;
      }
      // Remove duplicates
      ids = Array.from(new Set(ids));
      console.log('[SurveyPublic] Fetching questions with IDs:', ids);
      
      // For preview mode, we can't fetch questions yet (would need to mock them)
      // In a real implementation, you might want to store question data in localStorage too
      if (isPreviewMode) {
        // For preview, create mock questions
        const mockQuestions = ids.map((id, index) => ({
          _id: id,
          text: `Preview Question ${index + 1}`,
          type: 'text',
          options: ['Option 1', 'Option 2', 'Option 3'],
        }));
        setQuestions(mockQuestions);
        setLoadingQuestions(false);
        console.log('[SurveyPublic] Created mock questions for preview:', mockQuestions);
      } else {
        // For real surveys, fetch from database
        Meteor.call('questions.getMany', ids, (err: any, res: any[]) => {
          if (err) {
            setQuestionsError('Could not load questions');
            setQuestions([]);
            console.error('[SurveyPublic] Error loading questions:', err);
          } else {
            // Sort questions in the order of ids
            const ordered = ids.map((id) => res.find((q) => q._id === id)).filter(Boolean);
            setQuestions(ordered);
            console.log('[SurveyPublic] Loaded questions:', ordered);
          }
          setLoadingQuestions(false);
        });
      }
    } catch (e: any) {
      setQuestionsError('Could not load questions');
      setQuestions([]);
      setLoadingQuestions(false);
      console.error('[SurveyPublic] Exception during questions loading:', e);
    }
  }, [survey, isPreviewMode]);

  if (!survey) return <div style={{ padding: 40 }}>Loading survey...</div>;

  // Handler for starting the survey
  const handleStart = () => {
    console.log('[SurveyPublic] handleStart questions:', questions);
    if (questions.length > 0) {
      setStep(0);
      console.log('[SurveyPublic] setStep(0) called, should render first question.');
    } else {
      setStep('no-questions');
      console.log('[SurveyPublic] setStep("no-questions") called.');
    }
  };

  React.useEffect(() => {
    console.log('[SurveyPublic] Render, step:', step, 'questions:', questions);
  }, [step, questions]);

  // Handler for next question
  const handleNext = () => {
    if (typeof step === 'number' && questions && step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep('done');
    }
  };

  // Handler for previous question
  const handleBack = () => {
    if (typeof step === 'number' && step > 0) {
      setStep(step - 1);
    } else {
      setStep('welcome');
    }
  };

  // Custom styles for preview mode
  React.useEffect(() => {
    if (isPreviewMode) {
      // Apply styles to body for preview mode
      document.body.style.background = '#FFF9EB';
      
      // Clean up when component unmounts
      return () => {
        document.body.style.background = '';
      };
    }
  }, [isPreviewMode]);

  return (
    <div style={{
      background: isPreviewMode ? '#FFF9EB' : '#fff',
      minHeight: '100vh',
      padding: '2.5rem 2.5rem 4rem 2.5rem',
      // Remove box-shadow and border-radius for preview mode
      boxShadow: isPreviewMode ? 'none' : '0px 0px 10px 0px #0000001A',
      borderRadius: isPreviewMode ? '0' : '20px',
    }}>
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        {step === 'welcome' && (
          <SurveyWelcome
            previewData={{
              title: survey.title,
              description: survey.description,
              logo: survey.logo,
              image: survey.image,
              color: survey.color
            }}
            onStart={handleStart}
            disabled={loadingQuestions || questions.length === 0}
          />
        )}
        {loadingQuestions && (
          <div style={{ padding: 40 }}>Loading questions...</div>
        )}
        {questionsError && (
          <div style={{ padding: 40, color: 'red' }}>{questionsError}</div>
        )}
        {typeof step === 'number' && questions[step] && (
          <SurveyQuestion
            question={questions[step]}
            progress={`${step + 1}/${questions.length}`}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 'no-questions' && (
          <div style={{ padding: 40, textAlign: 'center', color: survey.color || '#b0802b' }}>
            <h2>No Questions Found</h2>
            <p>This survey does not have any questions yet. Please add questions to preview the survey flow.</p>
            <button
              style={{ marginTop: 24, background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '12px 32px', fontSize: 16, cursor: 'pointer' }}
              onClick={() => setStep('welcome')}
            >
              Back to Welcome
            </button>
          </div>
        )}
        {step === 'done' && (
          <div style={{ padding: 40, textAlign: 'center', color: survey.color || '#b0802b' }}>
            <h2>End of Preview</h2>
            <p>This is a preview. Please contact your administrator to participate.</p>
            <button
              style={{ marginTop: 24, background: '#b0802b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, padding: '12px 32px', fontSize: 16, cursor: 'pointer' }}
              onClick={() => setStep('welcome')}
            >
              Back to Welcome
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyPublic;

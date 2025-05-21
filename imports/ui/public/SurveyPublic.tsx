import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '/imports/api/surveys';
import SurveyWelcome from '../SurveyWelcome';
import SurveyQuestion from '../SurveyQuestion';

interface Question {
  _id: string;
  text: string;
  type: string;
  sectionName?: string;
  options?: string[];
  scale?: number;
  labels?: string[];
}

interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  color?: string;
  selectedQuestions?: Record<string, any[]>;
  siteTextQuestions?: any[];
  shareToken?: string;
}

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
  const survey: Survey | null = isPreviewMode ? previewSurvey : dbSurvey;

  // State for questions, loading, and error
  const [questions, setQuestions] = React.useState<Question[]>([]);
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
      // Extract section information from selectedQuestions
      const sectionInfo: Record<string, string> = {};
      
      // Process selectedQuestions (main questions from each section)
      if (survey.selectedQuestions && typeof survey.selectedQuestions === 'object') {
        // For each section in the survey
        Object.entries(survey.selectedQuestions).forEach(([sectionIdx, questions]) => {
          if (Array.isArray(questions)) {
            // For each question in this section
            questions.forEach((q: any) => {
              // Get the question ID/value
              let questionId = '';
              if (typeof q === 'string') {
                questionId = q;
              } else if (q && typeof q === 'object') {
                questionId = q.value || '';
              }
              
              if (questionId) {
                // Add to our list of IDs
                ids.push(questionId);
                
                // Store section information for this question
                // Get section name from steps array or from question object
                let sectionName = '';
                if (q.sectionName) {
                  sectionName = q.sectionName;
                } else {
                  // Use section index to determine section name
                  const sectionNumber = parseInt(sectionIdx, 10) + 1;
                  switch(sectionNumber) {
                    case 1: sectionName = 'Engagement/Manager Relationships'; break;
                    case 2: sectionName = 'Peer/Team Dynamics'; break;
                    case 3: sectionName = 'Feedback & Communication Quality'; break;
                    case 4: sectionName = 'Recognition and Pride'; break;
                    case 5: sectionName = 'Safety & Wellness Indicators'; break;
                    case 6: sectionName = 'Site-specific Questions'; break;
                    default: sectionName = `Section ${sectionNumber}`;
                  }
                }
                
                sectionInfo[questionId] = sectionName;
              }
            });
          }
        });
      }
      
      // Process siteTextQuestions if any
      if (Array.isArray(survey.siteTextQuestions)) {
        survey.siteTextQuestions.forEach((q: any) => {
          let questionId = '';
          if (typeof q === 'string') {
            questionId = q;
          } else if (q && typeof q === 'object' && q._id) {
            questionId = q._id;
          }
          
          if (questionId) {
            ids.push(questionId);
            sectionInfo[questionId] = 'Site-specific Questions';
          }
        });
      }
      
      console.log('[SurveyPublic] Extracted question IDs:', ids);
      console.log('[SurveyPublic] Section info:', sectionInfo);
      
      // If no question IDs found and we're in preview mode, create mock IDs
      if (ids.length === 0) {
        if (isPreviewMode) {
          // Generate mock question IDs for preview - one for each section
          console.log('[SurveyPublic] No real question IDs found, generating mock IDs for preview');
          
          // Create mock questions for each section
          const sectionNames = [
            'Engagement/Manager Relationships',
            'Peer/Team Dynamics',
            'Feedback & Communication Quality',
            'Recognition and Pride',
            'Safety & Wellness Indicators',
            'Site-specific Questions'
          ];
          
          // Create 1-2 questions per section
          sectionNames.forEach((name, idx) => {
            const id1 = `mock-${idx}-1`;
            const id2 = `mock-${idx}-2`;
            ids.push(id1, id2);
            sectionInfo[id1] = name;
            sectionInfo[id2] = name;
          });
        } else {
          setQuestions([]);
          setLoadingQuestions(false);
          console.log('[SurveyPublic] No question IDs found in survey.');
          return;
        }
      }
      
      // Remove duplicates
      ids = Array.from(new Set(ids));
      console.log('[SurveyPublic] Fetching questions with IDs:', ids);
      
      // Fetch the questions from the database
      Meteor.call('questions.getMany', ids, (error: Error | null, result: Question[]) => {
        if (error) {
          setQuestionsError('Could not load questions');
          setQuestions([]);
          console.error('[SurveyPublic] Error loading questions:', error);
          setLoadingQuestions(false);
          return;
        }
        
        // Check if we got valid questions back
        const validQuestions = result && Array.isArray(result) && result.length > 0;
        
        if (!validQuestions && isPreviewMode) {
          // Create mock questions for preview mode
          console.log('[SurveyPublic] Creating mock questions for preview');
          const questionTypes = ['likert', 'text', 'multiple', 'single'];
          
          const mockQuestions = ids.map((id, index) => {
            const type = questionTypes[index % questionTypes.length];
            const sectionName = sectionInfo[id] || 'Unknown Section';
            
            const baseQuestion = {
              _id: id,
              text: `${sectionName} Question ${(index % 2) + 1}: This is a sample ${type} question.`,
              type,
              sectionName
            };
            
            // Add type-specific properties
            switch (type) {
              case 'likert':
                return {
                  ...baseQuestion,
                  scale: 5,
                  labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
                };
              case 'multiple':
              case 'single':
                return {
                  ...baseQuestion,
                  options: [
                    'Option 1: This is the first choice',
                    'Option 2: This is the second choice',
                    'Option 3: This is the third choice',
                    'Option 4: This is the fourth choice'
                  ]
                };
              default:
                return baseQuestion;
            }
          });
          
          setQuestions(mockQuestions);
          setLoadingQuestions(false);
          console.log('[SurveyPublic] Created mock questions for preview:', mockQuestions);
        } else if (validQuestions) {
          // Process real questions from database
          console.log('[SurveyPublic] Processing real questions from database');
          
          // Add section information to each question
          const questionsWithSections = result.map(q => {
            const sectionName = sectionInfo[q._id] || 'Unknown Section';
            return {
              ...q,
              sectionName
            };
          });
          
          // Sort questions by section
          const ordered = ids
            .map(id => questionsWithSections.find(q => q._id === id))
            .filter(Boolean) as Question[];
          
          setQuestions(ordered);
          setLoadingQuestions(false);
          console.log('[SurveyPublic] Processed questions with sections:', ordered);
        } else {
          setQuestionsError('No questions found for this survey.');
          setLoadingQuestions(false);
        }
      });
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
        {step === 'welcome' && survey && (
          <SurveyWelcome
            previewData={{
              title: survey.title,
              description: survey.description || '',
              logo: survey.logo || '',
              image: survey.image || '',
              color: survey.color || '#b0802b'
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
        {step === 'no-questions' && survey && (
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
        {step === 'done' && survey && (
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

import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '../../features/surveys/api/surveys';
import SurveyWelcome from '../SurveyWelcome';
import SurveyQuestion from '../SurveyQuestion';
import SectionTransition from '../SectionTransition';

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

// Props for SurveyWelcome component
interface SurveyWelcomeProps {
  survey: Survey;
  onStart: () => void;
}

// Props for SectionTransition component
interface SectionTransitionProps {
  currentSection: string;
  nextSection: string;
  onContinue: () => void;
}

// Props for SurveyQuestion component
interface SurveyQuestionProps {
  question: Question;
  onAnswer: (answer: any) => void;
  progress: {
    current: number;
    total: number;
  };
}

// Content component that handles questions, steps, and responses
const SurveyContent: React.FC<{
  survey: Survey;
  isPreviewMode: boolean;
  token: string;
}> = ({ survey, isPreviewMode, token }) => {
  // State for questions, loading, and error
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  
  // State for survey navigation
  const [step, setStep] = useState<'welcome' | number | 'done' | 'no-questions' | 'section-transition'>('welcome');
  const [currentSection, setCurrentSection] = useState<string>('');
  const [nextSectionIndex, setNextSectionIndex] = useState<number>(0);
  
  // State for collecting responses
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Extract all question IDs from selectedQuestions and siteTextQuestions
  useEffect(() => {
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
      
      // Process siteTextQuestions (additional questions)
      if (survey.siteTextQuestions && Array.isArray(survey.siteTextQuestions)) {
        survey.siteTextQuestions.forEach((q: any) => {
          if (q && typeof q === 'object' && q.value) {
            ids.push(q.value);
            sectionInfo[q.value] = 'Site-specific Questions';
          }
        });
      }
      
      // Fetch questions from database if we have IDs
      if (ids.length > 0) {
        // Simulate fetching questions - in a real app this would be a Meteor method call
        // For now, we'll just create dummy questions for demonstration
        const dummyQuestions: Question[] = ids.map((id, index) => ({
          _id: id,
          text: `Question ${index + 1}`,
          type: index % 3 === 0 ? 'scale' : (index % 3 === 1 ? 'multiple_choice' : 'text'),
          sectionName: sectionInfo[id] || '',
          options: index % 3 === 1 ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
          scale: index % 3 === 0 ? 5 : undefined,
          labels: index % 3 === 0 ? ['Poor', 'Excellent'] : undefined,
        }));
        
        setQuestions(dummyQuestions);
        setLoadingQuestions(false);
        
        // If no questions, show no-questions state
        if (dummyQuestions.length === 0) {
          setStep('no-questions');
        }
      } else {
        // No questions found
        setQuestions([]);
        setLoadingQuestions(false);
        setStep('no-questions');
      }
    } catch (error) {
      console.error('[SurveyContent] Error loading questions:', error);
      setQuestionsError('Error loading survey questions');
      setLoadingQuestions(false);
    }
  }, [survey]);

  // Handle starting the survey
  const handleStart = () => {
    if (questions.length > 0) {
      setStep(0);
    } else {
      setStep('no-questions');
    }
  };

  // Handle answering a question
  const handleAnswer = (questionId: string, answer: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Move to next question or section
    const currentIndex = questions.findIndex(q => q._id === questionId);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < questions.length) {
      const currentQuestion = questions[currentIndex];
      const nextQuestion = questions[nextIndex];
      
      // Check if we're moving to a new section
      if (currentQuestion.sectionName !== nextQuestion.sectionName) {
        setCurrentSection(currentQuestion.sectionName || '');
        setNextSectionIndex(nextIndex);
        setStep('section-transition');
      } else {
        setStep(nextIndex);
      }
    } else {
      // End of survey
      setStep('done');
      // Submit responses
      handleSubmit();
    }
  };

  // Handle continuing to next section
  const handleContinueToNextSection = () => {
    setStep(nextSectionIndex);
  };

  // Handle submitting the survey
  const handleSubmit = () => {
    setSubmitting(true);
    setSubmitError(null);
    
    // Simulate submitting responses - in a real app this would be a Meteor method call
    setTimeout(() => {
      console.log('Submitting responses:', responses);
      setSubmitting(false);
      // In a real app, you would handle success/error here
    }, 1000);
  };

  // If loading questions, show loading state
  if (loadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading questions...</span>
          </div>
          <p className="mt-2">Loading survey questions...</p>
        </div>
      </div>
    );
  }

  // If error loading questions, show error state
  if (questionsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            {questionsError}
          </div>
          <p>There was an error loading the survey questions.</p>
        </div>
      </div>
    );
  }

  // Render appropriate step
  switch (step) {
    case 'welcome':
      return <SurveyWelcome survey={survey} onStart={handleStart} />;
      
    case 'no-questions':
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="alert alert-warning" role="alert">
              No questions found for this survey
            </div>
            <p>This survey doesn't have any questions yet.</p>
          </div>
        </div>
      );
      
    case 'section-transition':
      return (
        <SectionTransition 
          currentSection={currentSection}
          nextSection={questions[nextSectionIndex]?.sectionName || ''}
          onContinue={handleContinueToNextSection}
        />
      );
      
    case 'done':
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
            <p className="mb-4">Your responses have been submitted successfully.</p>
            {submitting && (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Submitting...</span>
              </div>
            )}
            {submitError && (
              <div className="alert alert-danger mt-4" role="alert">
                {submitError}
              </div>
            )}
          </div>
        </div>
      );
      
    default:
      // Show current question
      const questionIndex = step as number;
      const currentQuestion = questions[questionIndex];
      
      if (!currentQuestion) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="alert alert-danger" role="alert">
                Question not found
              </div>
              <p>The requested question could not be found.</p>
            </div>
          </div>
        );
      }
      
      return (
        <SurveyQuestion
          question={currentQuestion}
          onAnswer={(answer) => handleAnswer(currentQuestion._id, answer)}
          progress={{
            current: questionIndex + 1,
            total: questions.length
          }}
        />
      );
  }
};

// Main wrapper component that extracts URL parameters
const SurveyPublic: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const isPreviewMode = new URLSearchParams(location.search).get('status') === 'preview';
  
  console.log('[SurveyPublic] Rendering with token:', token);
  
  // State for loading, survey data, and errors
  const [isLoading, setIsLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<Survey | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // For preview mode, get survey from localStorage
  useEffect(() => {
    if (isPreviewMode && token) {
      try {
        const storedData = localStorage.getItem(`survey-preview-${token}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setSurveyData(parsedData);
        } else {
          setLoadError('Preview data not found');
        }
      } catch (e) {
        console.error('[SurveyPublic] Error loading preview data:', e);
        setLoadError('Error loading preview data');
      } finally {
        setIsLoading(false);
      }
    }
  }, [isPreviewMode, token]);
  
  // For published surveys, get from database using useTracker
  const { loading: dbLoading, survey: dbSurvey } = useTracker(() => {
    if (isPreviewMode || !token) {
      return { loading: false, survey: null };
    }
    
    const handle = Meteor.subscribe('surveys.preview', token);
    const survey = Surveys.findOne({ shareToken: token });
    
    return {
      loading: !handle.ready(),
      survey
    };
  }, [isPreviewMode, token]);
  
  // Update loading state and survey data when database data changes
  useEffect(() => {
    if (!isPreviewMode) {
      setIsLoading(dbLoading);
      if (dbSurvey) {
        // Type assertion to handle the SurveyDoc vs Survey type mismatch
        setSurveyData(dbSurvey as unknown as Survey);
      } else if (!dbLoading) {
        setLoadError('Survey not found');
      }
    }
  }, [dbLoading, dbSurvey, isPreviewMode]);
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading survey...</p>
        </div>
      </div>
    );
  }
  
  // If error, show error state
  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            {loadError}
          </div>
          <p>Please check the URL and try again.</p>
        </div>
      </div>
    );
  }
  
  // If no survey data, show not found state
  if (!surveyData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="alert alert-warning" role="alert">
            Survey not found
          </div>
          <p>Please check the URL and try again.</p>
        </div>
      </div>
    );
  }
  
  // If we have survey data, render the survey content component
  return <SurveyContent survey={surveyData} isPreviewMode={isPreviewMode} token={token || ''} />;
};

export default SurveyPublic;

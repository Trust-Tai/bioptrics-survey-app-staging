import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { decryptToken } from '../../utils/tokenUtils';
import { Surveys } from '../../features/surveys/api/surveys';
import SurveyWelcome from '../SurveyWelcome';
import SurveyQuestion from '../SurveyQuestion';
import SectionTransition from '../SectionTransition';
import SurveySectionScreen from '../SurveySectionScreen';
import SurveyThankYou from '../SurveyThankYou';

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
  featuredImage?: string; // Added featuredImage property
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
  logo?: string;
  color?: string;
  sectionTitle: string;
  sectionDescription: string;
  illustration?: string;
  progress: { current: number; total: number };
  onContinue: () => void;
  onBack?: () => void;
}

// Props for SurveyQuestion component
interface SurveyQuestionProps {
  question: Question;
  onAnswer: (answer: any) => void;
  progress: string;
  onBack?: () => void;
  onSkip?: () => void;
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
  const [step, setStep] = useState<'welcome' | 'section-screen' | number | 'done' | 'no-questions' | 'section-transition'>('welcome');
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
        console.log('[SurveyContent] Question IDs to fetch:', ids);
        console.log('[SurveyContent] Section info:', sectionInfo);
        
        // Create real questions based on the survey data
        // In a real app, you would fetch these from the database using Meteor.call
        const realQuestions: Question[] = [
          // Team Dynamics Section
          {
            _id: 'q1',
            text: 'How would you rate the overall team collaboration in your department?',
            type: 'likert',
            options: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
            sectionName: 'Team Dynamics',
          },
          {
            _id: 'q2',
            text: 'How often do you feel your ideas are valued during team meetings?',
            type: 'likert',
            options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
            sectionName: 'Team Dynamics',
          },
          {
            _id: 'q3',
            text: 'What aspects of team collaboration could be improved?',
            type: 'text',
            sectionName: 'Team Dynamics',
          },
          
          // Feedback Section
          {
            _id: 'q4',
            text: 'How satisfied are you with the feedback you receive from your manager?',
            type: 'likert',
            options: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
            sectionName: 'Feedback',
          },
          {
            _id: 'q5',
            text: 'How often do you receive constructive feedback from your manager?',
            type: 'multiple_choice',
            options: ['Weekly', 'Monthly', 'Quarterly', 'Annually', 'Never'],
            sectionName: 'Feedback',
          },
          {
            _id: 'q6',
            text: 'What would make the feedback process more effective for you?',
            type: 'text',
            sectionName: 'Feedback',
          },
          
          // About You Section
          {
            _id: 'q7',
            text: 'How long have you been with the company?',
            type: 'multiple_choice',
            options: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', 'More than 10 years'],
            sectionName: 'About You',
          },
          {
            _id: 'q8',
            text: 'Which department do you work in?',
            type: 'multiple_choice',
            options: ['Engineering', 'Marketing', 'Sales', 'Customer Support', 'Human Resources', 'Finance', 'Other'],
            sectionName: 'About You',
          },
          {
            _id: 'q9',
            text: 'What is your current role?',
            type: 'text',
            sectionName: 'About You',
          },
          {
            _id: 'q10',
            text: 'Select all the skills you have:',
            type: 'multiple_select',
            options: ['Project Management', 'Leadership', 'Technical Skills', 'Communication', 'Problem Solving', 'Creativity'],
            sectionName: 'About You',
          }
        ];
        
        console.log('[SurveyContent] Loaded questions:', realQuestions);
        setQuestions(realQuestions);
        setLoadingQuestions(false);
        
        // If no questions, still show welcome screen
        if (realQuestions.length === 0) {
          setStep('welcome'); // Show welcome screen instead of no-questions
          console.log('[SurveyContent] No questions after fetching, showing welcome screen');
        }
      } else {
        // No questions found, but we'll still show the welcome screen
        // This allows users to see the survey details according to the design
        setQuestions([]);
        setLoadingQuestions(false);
        setStep('welcome'); // Show welcome screen instead of no-questions
        console.log('[SurveyContent] No questions found, showing welcome screen');
      }
    } catch (error) {
      console.error('[SurveyContent] Error loading questions:', error);
      setQuestionsError('Error loading survey questions');
      setLoadingQuestions(false);
    }
  }, [survey]);

  // Handle starting the survey
  const handleStart = () => {
    console.log('[SurveyContent] handleStart called, questions:', questions.length);
    
    // Force transition to section screen regardless of questions
    const firstSection = questions.length > 0 ? (questions[0]?.sectionName || 'Team Dynamics') : 'Team Dynamics';
    console.log('[SurveyContent] Setting current section to:', firstSection);
    setCurrentSection(firstSection);
    
    // Ensure we're setting the state properly
    console.log('[SurveyContent] Transitioning to section-screen');
    // Immediately update the step
    setStep('section-screen');
  };
  
  // Handle starting a section
  const handleStartSection = () => {
    console.log('[SurveyContent] handleStartSection called for section:', currentSection);
    
    // DIRECT FIX: Force navigation to the first question
    if (questions.length > 0) {
      console.log('[SurveyContent] Directly navigating to first question');
      // Force immediate update to first question
      setStep(0);
      return;
    }
    
    // Fallback logic if there are no questions
    console.log('[SurveyContent] No questions available, cannot start section');
    setStep('done');
  };
  
  // Handle skipping a section
  const handleSkipSection = () => {
    // Find the next section
    const sectionsInSurvey = new Set();
    questions.forEach(q => {
      if (q.sectionName) {
        sectionsInSurvey.add(q.sectionName);
      }
    });
    
    const sectionsList = Array.from(sectionsInSurvey) as string[];
    const currentSectionIndex = sectionsList.indexOf(currentSection);
    
    if (currentSectionIndex < sectionsList.length - 1) {
      // Move to the next section
      const nextSection = sectionsList[currentSectionIndex + 1];
      setCurrentSection(nextSection);
      
      // Find the first question of the next section
      const nextSectionFirstQuestionIndex = questions.findIndex(q => q.sectionName === nextSection);
      if (nextSectionFirstQuestionIndex !== -1) {
        setStep(nextSectionFirstQuestionIndex);
      } else {
        // If no questions found for next section, move to done
        setStep('done');
      }
    } else {
      // If this is the last section, move to done
      setStep('done');
    }
  };

  // Handle answering a question
  const handleAnswer = (questionId: string, answer: any) => {
    console.log('[SurveyContent] handleAnswer called for questionId:', questionId);
    
    // Save the response
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Move to next question or section
    const currentIndex = questions.findIndex(q => q._id === questionId);
    console.log('[SurveyContent] Current question index:', currentIndex);
    
    if (currentIndex === -1) {
      console.error('[SurveyContent] Question not found in questions array:', questionId);
      // If we can't find the question (shouldn't happen), go to the first question
      if (questions.length > 0) {
        setStep(0);
      } else {
        setStep('done');
      }
      return;
    }
    
    const nextIndex = currentIndex + 1;
    console.log('[SurveyContent] Next question index:', nextIndex, 'questions.length:', questions.length);
    
    if (nextIndex < questions.length) {
      const currentQuestion = questions[currentIndex];
      const nextQuestion = questions[nextIndex];
      
      console.log('[SurveyContent] Current section:', currentQuestion.sectionName);
      console.log('[SurveyContent] Next section:', nextQuestion.sectionName);
      
      // Check if we're moving to a new section
      if (currentQuestion.sectionName !== nextQuestion.sectionName) {
        console.log('[SurveyContent] Moving to new section');
        setCurrentSection(nextQuestion.sectionName || ''); // Set to the NEXT section name
        setNextSectionIndex(nextIndex);
        setStep('section-transition');
      } else {
        console.log('[SurveyContent] Staying in same section, moving to next question');
        setStep(nextIndex);
      }
    } else {
      // End of survey
      console.log('[SurveyContent] End of survey, moving to done screen');
      setStep('done');
      // Submit responses
      handleSubmit();
    }
  };

  // Handle continuing to next section
  const handleContinueToNextSection = () => {
    console.log('[SurveyContent] handleContinueToNextSection called, nextSectionIndex:', nextSectionIndex);
    
    // Ensure we have questions to work with
    if (questions.length === 0) {
      console.log('[SurveyContent] No questions available, cannot continue to next section');
      return;
    }
    
    if (nextSectionIndex < questions.length) {
      // Get the section name of the next question
      const nextSectionName = questions[nextSectionIndex].sectionName;
      console.log('[SurveyContent] Next section name:', nextSectionName);
      
      // Find all questions for this section
      const sectionQuestions = questions.filter(q => q.sectionName === nextSectionName);
      
      if (sectionQuestions.length > 0) {
        // Find the index of the first question in this section
        const firstQuestionIndex = questions.findIndex(q => q._id === sectionQuestions[0]._id);
        console.log('[SurveyContent] First question index for next section:', firstQuestionIndex);
        
        if (firstQuestionIndex !== -1) {
          // Use setTimeout to ensure this happens after the current render cycle
          console.log('[SurveyContent] Setting step to next section question index:', firstQuestionIndex);
          setTimeout(() => {
            setStep(firstQuestionIndex);
          }, 0);
        } else {
          // Fallback to the provided nextSectionIndex
          console.log('[SurveyContent] Falling back to nextSectionIndex:', nextSectionIndex);
          setStep(nextSectionIndex);
        }
      } else {
        // If no questions found for the next section, use the provided index
        console.log('[SurveyContent] No questions found for next section, using nextSectionIndex:', nextSectionIndex);
        setStep(nextSectionIndex);
      }
    } else {
      // If we've reached the end of questions, go to done screen
      console.log('[SurveyContent] End of questions reached, going to done screen');
      setStep('done');
    }
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
  console.log('[SurveyContent] Survey data for welcome screen:', {
    title: survey.title,
    description: survey.description,
    logo: survey.logo,
    image: survey.image, // Check if image URL is present
    color: survey.color
  });
  
  switch (step) {
    case 'welcome':
      console.log('[SurveyContent] Rendering welcome screen with handleStart:', handleStart);
      // Log the survey data to help with debugging
      console.log('[SurveyContent] Survey data for welcome screen:', {
        title: survey.title,
        description: survey.description,
        logo: survey.logo,
        image: survey.image,
        featuredImage: survey.featuredImage,
        color: survey.color
      });
      
      return <SurveyWelcome 
        survey={{
          title: survey.title || 'Welcome to the Survey',
          description: survey.description || 'Please complete this survey to help us improve.',
          logo: survey.logo || 'https://s28.q4cdn.com/380852864/files/design/logo.svg',
          // Try multiple possible image field names to ensure we get the image
          illustration: survey.featuredImage || survey.image || '/illustration.png',
          color: survey.color || '#b69d57'
        }} 
        onStart={handleStart}
        loading={false}
      />;
      
    case 'section-screen':
      // Get section description based on the section name
      let sectionDescription = '';
      switch(currentSection) {
        case 'Engagement/Manager Relationships':
          sectionDescription = "Let's talk about your relationship with your manager and your engagement at work. These questions will help us understand how connected you feel to your role and leadership.";
          break;
        case 'Peer/Team Dynamics':
          sectionDescription = "Now let's talk about your team dynamics. These questions will ask about how you and your coworkers interact day-to-day. Keep it short and positive in tone.";
          break;
        case 'Team Dynamics':
          sectionDescription = "This section explores how your team works together. Your answers will help us understand team collaboration and identify areas for improvement.";
          break;
        case 'Feedback & Communication Quality':
          sectionDescription = "This section focuses on how feedback is given and received in your workplace, and the overall quality of communication within the organization.";
          break;
        case 'Feedback':
          sectionDescription = "In this section, we'd like to understand your experience with feedback at work. Your responses will help us improve our feedback processes.";
          break;
        case 'About You':
          sectionDescription = "This section helps us understand more about you and your role within the organization. This information helps us analyze survey results more effectively.";
          break;
        case 'Recognition and Pride':
          sectionDescription = "Let's explore how recognized you feel for your contributions and how proud you are to be part of the organization.";
          break;
        case 'Safety & Wellness Indicators':
          sectionDescription = "This section addresses your physical and mental wellbeing at work, and how the organization supports your overall wellness.";
          break;
        case 'Site-specific Questions':
          sectionDescription = "These questions are specific to your location or department and help us understand unique aspects of your workplace experience.";
          break;
        default:
          sectionDescription = "This section contains questions related to your workplace experience. Your honest feedback will help improve the organization.";
      }
      
      // Calculate section progress
      const sectionsInSurvey = new Set();
      questions.forEach(q => {
        if (q.sectionName) {
          sectionsInSurvey.add(q.sectionName);
        }
      });
      
      // Find current section index
      const sectionsList = Array.from(sectionsInSurvey) as string[];
      const currentSectionIndex = sectionsList.indexOf(currentSection);
      
      // Log the survey data for debugging
      console.log('[SurveyContent] Survey data for section screen:', {
        logo: survey.logo,
        image: survey.image,
        featuredImage: survey.featuredImage
      });
      
      return <SurveySectionScreen
        logo={survey.logo || ''}
        color={survey.color || '#b69d57'}
        sectionTitle={currentSection}
        sectionDescription={sectionDescription}
        illustration={survey.featuredImage || survey.image || ''}
        progress={{
          current: currentSectionIndex + 1,
          total: sectionsList.length
        }}
        onStart={handleStartSection}
        onBack={() => setStep('welcome')}
        onSkip={handleSkipSection}
      />;
      
    case 'section-transition':
      // Log the survey data for debugging
      console.log('[SurveyContent] Survey data for section transition:', {
        logo: survey.logo,
        image: survey.image,
        featuredImage: survey.featuredImage
      });
      
      return (
        <SectionTransition 
          logo={survey.logo || ''}
          color={survey.color || '#b69d57'}
          sectionTitle={questions[nextSectionIndex]?.sectionName || 'Next Section'}
          sectionDescription={`This section contains questions about ${questions[nextSectionIndex]?.sectionName || 'your workplace experience'}.`}
          illustration={survey.featuredImage || survey.image || ''}
          progress={{
            current: nextSectionIndex,
            total: questions.length
          }}
          onContinue={handleContinueToNextSection}
          onBack={() => setStep(nextSectionIndex - 1)}
        />
      );
      
    case 'done':
      return (
        <SurveyThankYou
          logo={survey.logo || 'https://s28.q4cdn.com/380852864/files/design/logo.svg'}
          color={survey.color || '#b69d57'}
          onViewResults={() => {
            // This would typically navigate to results or another page
            console.log('View results clicked');
            // For now, we'll just show an alert
            alert('Survey results would be shown here in a real application');
          }}
        />
      );
      
    default:
      // Show current question
      // Handle both string and number step types
      let questionIndex: number;
      
      console.log('[SurveyContent] Default case - step type:', typeof step, 'value:', step);
      
      if (typeof step === 'string') {
        // Try to parse the string as a number
        questionIndex = parseInt(step, 10);
        console.log('[SurveyContent] Parsed string step to number:', questionIndex);
        
        // Check if parsing failed (NaN)
        if (isNaN(questionIndex)) {
          console.error('[SurveyContent] Failed to parse step as number:', step);
          // If we can't parse the step, default to the first question
          if (questions.length > 0) {
            console.log('[SurveyContent] Defaulting to first question');
            // Force immediate update to first question
            setTimeout(() => setStep(0), 0);
            questionIndex = 0;
          } else {
            return (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="alert alert-danger" role="alert">
                    Invalid question step
                  </div>
                  <p>The step value could not be converted to a valid question index.</p>
                  <button 
                    onClick={() => setStep('welcome')} 
                    className="btn btn-primary mt-4"
                  >
                    Return to Welcome Screen
                  </button>
                </div>
              </div>
            );
          }
        }
      } else {
        // Already a number
        questionIndex = step;
      }
      
      console.log('[SurveyContent] Rendering question at index:', questionIndex, 'Type:', typeof questionIndex);
      
      // Validate question index is within bounds
      if (questionIndex < 0 || questionIndex >= questions.length) {
        console.error('[SurveyContent] Question index out of bounds:', questionIndex, 'Questions length:', questions.length);
        
        // If index is out of bounds but we have questions, default to first question
        if (questions.length > 0) {
          console.log('[SurveyContent] Index out of bounds, defaulting to first question');
          setTimeout(() => setStep(0), 0);
          questionIndex = 0;
        } else {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="alert alert-danger" role="alert">
                  Question not found
                </div>
                <p>The requested question index {questionIndex} is out of bounds. Total questions: {questions.length}</p>
                <button 
                  onClick={() => setStep('welcome')} 
                  className="btn btn-primary mt-4"
                >
                  Return to Welcome Screen
                </button>
              </div>
            </div>
          );
        }
      }
      
      const currentQuestion = questions[questionIndex];
      
      if (!currentQuestion) {
        console.error('[SurveyContent] Question not found at index:', questionIndex);
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="alert alert-danger" role="alert">
                Question not found
              </div>
              <p>The requested question could not be found. Index: {questionIndex}</p>
              <button 
                onClick={() => setStep('welcome')} 
                className="btn btn-primary mt-4"
              >
                Return to Welcome Screen
              </button>
            </div>
          </div>
        );
      }
      
      return (
        <SurveyQuestion
          question={currentQuestion}
          onNext={(answer: any) => handleAnswer(currentQuestion._id, answer)}
          progress={`${questionIndex + 1} of ${questions.length}`}
          onBack={questionIndex > 0 ? () => setStep(questionIndex - 1) : undefined}
          onSkip={() => handleAnswer(currentQuestion._id, null)}
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
    
    // We pass the encrypted token to the publication, which will handle decryption
    const handle = Meteor.subscribe('surveys.preview', token);
    
    // Try to find the survey by both methods: directly by ID (if token is a valid encrypted ID)
    // or by shareToken (for backward compatibility)
    let survey;
    try {
      const decryptedId = decryptToken(token);
      if (decryptedId) {
        survey = Surveys.findOne({ _id: decryptedId });
      }
    } catch (error) {
      console.error('Error decrypting token:', error);
    }
    
    // If we couldn't find it by ID, fall back to the old method
    if (!survey) {
      survey = Surveys.findOne({ shareToken: token });
    }
    
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

import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '../../features/surveys/api/surveys';
import SurveyWelcome from '../../ui/SurveyWelcome';
import SurveyQuestion from '../../ui/SurveyQuestion';
import SectionTransition from '../../ui/SectionTransition';

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
  // New properties from EnhancedSurveyBuilder
  sectionQuestions?: Array<{
    id: string;
    sectionId: string;
    order?: number;
  }>;
  surveySections?: Array<{
    id: string;
    title: string;
    order: number;
  }>;
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
  const [step, setStep] = React.useState<'welcome' | number | 'done' | 'no-questions' | 'section-transition'>('welcome');
  const [currentSection, setCurrentSection] = React.useState<string>('');
  const [nextSectionIndex, setNextSectionIndex] = React.useState<number>(0);
  
  // State for collecting responses
  const [responses, setResponses] = React.useState<Record<string, any>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Extract all question IDs from sectionQuestions or fall back to selectedQuestions
  React.useEffect(() => {
    if (!survey) return;
    setLoadingQuestions(true);
    setQuestionsError(null);
    try {
      let ids: string[] = [];
      // Extract section information from questions
      const sectionInfo: Record<string, string> = {};
      
      console.log('[SurveyPublic] Survey data:', survey);
      
      // First check for sectionQuestions (new format from EnhancedSurveyBuilder)
      if (Array.isArray(survey.sectionQuestions) && survey.sectionQuestions.length > 0) {
        console.log('[SurveyPublic] Using sectionQuestions:', survey.sectionQuestions);
        
        // Process each question in sectionQuestions
        survey.sectionQuestions.forEach((question: any) => {
          if (question && question.id) {
            // Add to our list of IDs
            ids.push(question.id);
            
            // Find section name from surveySections
            let sectionName = 'Unknown Section';
            if (Array.isArray(survey.surveySections)) {
              const section = survey.surveySections.find(s => s.id === question.sectionId);
              if (section) {
                sectionName = section.title || `Section ${section.order + 1}`;
              }
            }
            
            // Store section information for this question
            sectionInfo[question.id] = sectionName;
          }
        });
      }
      // Fall back to legacy selectedQuestions format if no sectionQuestions
      else if (survey.selectedQuestions && typeof survey.selectedQuestions === 'object') {
        console.log('[SurveyPublic] Falling back to selectedQuestions');
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
          
          // Define the correct section order
          const sectionOrder = [
            'Engagement/Manager Relationships',
            'Peer/Team Dynamics',
            'Feedback & Communication Quality',
            'Recognition and Pride',
            'Safety & Wellness Indicators',
            'Site-specific Questions'
          ];
          
          // Group mock IDs by section
          const idsBySection: Record<string, string[]> = {};
          
          // Initialize sections
          sectionOrder.forEach(section => {
            idsBySection[section] = [];
          });
          
          // Group IDs by section
          ids.forEach(id => {
            const section = sectionInfo[id] || 'Unknown Section';
            if (idsBySection[section]) {
              idsBySection[section].push(id);
            } else {
              idsBySection['Unknown Section'] = idsBySection['Unknown Section'] || [];
              idsBySection['Unknown Section'].push(id);
            }
          });
          
          // Create ordered ID array
          const orderedIds: string[] = [];
          
          // Add questions in the correct section order
          sectionOrder.forEach(section => {
            if (idsBySection[section]) {
              orderedIds.push(...idsBySection[section]);
            }
          });
          
          // Add any remaining questions from unknown sections
          if (idsBySection['Unknown Section']) {
            orderedIds.push(...idsBySection['Unknown Section']);
          }
          
          const mockQuestions = orderedIds.map((id, index) => {
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
          
          // Define the correct section order
          const sectionOrder = [
            'Engagement/Manager Relationships',
            'Peer/Team Dynamics',
            'Feedback & Communication Quality',
            'Recognition and Pride',
            'Safety & Wellness Indicators',
            'Site-specific Questions'
          ];
          
          // Group questions by section
          const questionsBySection: Record<string, Question[]> = {};
          
          // Initialize all sections with empty arrays
          sectionOrder.forEach(section => {
            questionsBySection[section] = [];
          });
          
          // Group questions by their section
          questionsWithSections.forEach(question => {
            const section = question.sectionName || 'Unknown Section';
            if (questionsBySection[section]) {
              questionsBySection[section].push(question);
            } else {
              // For any questions with sections not in our predefined order
              questionsBySection['Unknown Section'] = questionsBySection['Unknown Section'] || [];
              questionsBySection['Unknown Section'].push(question);
            }
          });
          
          // Create ordered array based on section order
          const ordered: Question[] = [];
          
          // Add questions in the correct section order
          sectionOrder.forEach(section => {
            if (questionsBySection[section] && questionsBySection[section].length > 0) {
              ordered.push(...questionsBySection[section]);
            }
          });
          
          // Add any remaining questions from unknown sections
          if (questionsBySection['Unknown Section'] && questionsBySection['Unknown Section'].length > 0) {
            ordered.push(...questionsBySection['Unknown Section']);
          }
          
          setQuestions(ordered);
          setLoadingQuestions(false);
          console.log('[SurveyPublic] Processed questions with sections:', ordered);
        } else {
          console.error('[SurveyPublic] No valid questions returned from questions.getMany');
          console.error('[SurveyPublic] Survey data:', survey);
          
          // Check if we're in preview mode but still couldn't create mock questions
          if (isPreviewMode) {
            console.error('[SurveyPublic] Failed to create mock questions for preview mode');
          }
          
          // Check if the survey has question references
          if (survey) {
            if (Array.isArray(survey.sectionQuestions) && survey.sectionQuestions.length > 0) {
              console.error('[SurveyPublic] Survey has sectionQuestions but no questions were found:', 
                survey.sectionQuestions);
            } else if (survey.selectedQuestions && typeof survey.selectedQuestions === 'object') {
              console.error('[SurveyPublic] Survey has selectedQuestions but no questions were found:', 
                survey.selectedQuestions);
            } else {
              console.error('[SurveyPublic] Survey has no question references');
            }
          }
          
          setQuestionsError('No questions found for this survey.');
          setLoadingQuestions(false);
        }
      });
    } catch (e) {
      setQuestionsError('Could not load questions');
      setQuestions([]);
      setLoadingQuestions(false);
      console.error('[SurveyPublic] Exception during questions loading:', e);
    }
  }, [survey, isPreviewMode]);

  // Get unique sections in order
  const sections = React.useMemo(() => {
    if (!questions || questions.length === 0) return [];
    
    const uniqueSections: string[] = [];
    questions.forEach(q => {
      if (q.sectionName && !uniqueSections.includes(q.sectionName)) {
        uniqueSections.push(q.sectionName);
      }
    });
    return uniqueSections;
  }, [questions]);

  // Get section description based on section name
  const getSectionDescription = (sectionName: string): string => {
    switch (sectionName) {
      case 'Engagement/Manager Relationships':
        return "Let's talk about your engagement and relationship with your manager. These questions will ask about how you interact with leadership.";
      case 'Peer/Team Dynamics':
        return "Now let's talk about your team dynamics. These questions will ask about how you and your coworkers interact day-to-day. Keep it short and positive in tone.";
      case 'Feedback & Communication Quality':
        return "Let's discuss feedback and communication. These questions will ask about how information flows within your team and organization.";
      case 'Recognition and Pride':
        return "Let's explore recognition and pride in your work. These questions will ask about how your contributions are valued and your sense of accomplishment.";
      case 'Safety & Wellness Indicators':
        return "Let's focus on safety and wellness. These questions will ask about your physical and psychological well-being at work.";
      case 'Site-specific Questions':
        return "Finally, let's address some questions specific to your site. These are customized questions relevant to your particular location.";
      default:
        return `Let's explore the ${sectionName} section. Please answer the following questions honestly.`;
    }
  };

  // Get section illustration - using the local image file
  const getSectionIllustration = (): string => {
    // Using the local image from public directory
    return '/frame.png';
  };

  // Find the index of the first question in the next section
  const findNextSectionQuestionIndex = (currentIndex: number): number => {
    if (!questions || questions.length === 0 || currentIndex >= questions.length - 1) {
      return -1; // No more questions or sections
    }
    
    const currentSectionName = questions[currentIndex].sectionName;
    
    // Look for the first question with a different section name
    for (let i = currentIndex + 1; i < questions.length; i++) {
      if (questions[i].sectionName !== currentSectionName) {
        return i;
      }
    }
    
    return -1; // No more sections found
  };

  // Handler for starting the survey
  const handleStart = () => {
    console.log('[SurveyPublic] handleStart questions:', questions);
    if (questions.length > 0) {
      // Show the first section transition screen
      if (questions[0].sectionName) {
        setCurrentSection(questions[0].sectionName);
        setNextSectionIndex(0);
        setStep('section-transition');
        console.log('[SurveyPublic] Starting with section transition for:', questions[0].sectionName);
      } else {
        // If no section name, just start with the first question
        setStep(0);
        console.log('[SurveyPublic] setStep(0) called, should render first question.');
      }
    } else {
      // Log more details about why no questions were found
      console.error('[SurveyPublic] No questions found. Survey data:', survey);
      console.error('[SurveyPublic] Is preview mode:', isPreviewMode);
      
      // Check if we have IDs but no questions
      if (survey && (Array.isArray(survey.sectionQuestions) || 
          (survey.selectedQuestions && typeof survey.selectedQuestions === 'object'))) {
        console.error('[SurveyPublic] Survey has question references but no questions were loaded');
      }
      
      // For now, we'll still show the welcome screen even if there are no questions
      // This allows users to see the survey details according to the design
      setStep('welcome');
      console.log('[SurveyPublic] setStep("welcome") called despite no questions.');
    }
  };

  // Handler for continuing from section transition to questions
  const handleContinueFromSection = () => {
    if (nextSectionIndex >= 0 && nextSectionIndex < questions.length) {
      setStep(nextSectionIndex);
      console.log(`[SurveyPublic] Moving to question at index ${nextSectionIndex}`);
    } else {
      // Should never happen, but just in case
      setStep('done');
    }
  };

  React.useEffect(() => {
    console.log('[SurveyPublic] Render, step:', step, 'questions:', questions);
  }, [step, questions]);

  // Handler for next question with response data
  const handleNext = (response?: any) => {
    // If response is provided, save it
    if (response && typeof step === 'number') {
      const questionId = questions[step]._id;
      setResponses(prev => ({
        ...prev,
        [questionId]: response
      }));
      console.log(`[SurveyPublic] Saved response for question ${questionId}:`, response);
    }
    
    // Check if we need to show a section transition
    if (typeof step === 'number' && questions && step < questions.length - 1) {
      const currentSectionName = questions[step].sectionName;
      const nextQuestionIndex = step + 1;
      const nextSectionName = questions[nextQuestionIndex].sectionName;
      
      // If the next question is from a different section, show the transition screen
      if (nextSectionName && nextSectionName !== currentSectionName) {
        setCurrentSection(nextSectionName);
        setNextSectionIndex(nextQuestionIndex);
        setStep('section-transition');
        console.log(`[SurveyPublic] Showing transition to section: ${nextSectionName}`);
      } else {
        // Otherwise just go to the next question
        setStep(nextQuestionIndex);
      }
    } else {
      // Submit responses if we're at the last question
      if (typeof step === 'number' && step === questions.length - 1 && !isPreviewMode) {
        submitResponses();
      }
      setStep('done');
    }
  };

  // Handler for previous question
  const handleBack = () => {
    if (step === 'section-transition') {
      // If we're at a section transition, go back to the previous question
      // or to welcome if this is the first section
      if (nextSectionIndex > 0) {
        setStep(nextSectionIndex - 1);
      } else {
        setStep('welcome');
      }
    } else if (typeof step === 'number') {
      // If we're at a question
      if (step > 0) {
        // Check if the previous question is from a different section
        const currentSectionName = questions[step].sectionName;
        const prevSectionName = questions[step - 1].sectionName;
        
        if (prevSectionName && prevSectionName !== currentSectionName) {
          // If we're going back to a different section, show the section transition
          setCurrentSection(prevSectionName);
          setNextSectionIndex(step - 1);
          setStep('section-transition');
        } else {
          // Otherwise just go to the previous question
          setStep(step - 1);
        }
      } else {
        setStep('welcome');
      }
    } else {
      setStep('welcome');
    }
  };
  
  // Submit all responses to the server
  const submitResponses = () => {
    if (!survey || isPreviewMode) return;
    
    setSubmitting(true);
    setSubmitError(null);
    
    // Format responses for submission
    const formattedResponses: Record<string, any> = {};
    
    // Extract the actual response values
    Object.entries(responses).forEach(([questionId, responseData]) => {
      if (responseData && responseData.response !== undefined) {
        formattedResponses[questionId] = responseData.response;
      } else {
        formattedResponses[questionId] = responseData;
      }
    });
    
    console.log('[SurveyPublic] Submitting responses:', formattedResponses);
    
    // Import device detection utility
    import('../../utils/deviceDetection').then(({ getCurrentDeviceType }) => {
      // Detect device type
      const deviceType = getCurrentDeviceType();
      console.log('[SurveyPublic] Detected device type:', deviceType);
      
      // Call the Meteor method to save responses with device type
      Meteor.call('surveys.submitResponse', {
        surveyId: survey._id,
        responses: formattedResponses,
        token: token, // Make sure token is passed
        deviceType: deviceType // Explicitly specify the property name
      }, (error: Error | null) => {
        setSubmitting(false);
        
        if (error) {
          console.error('[SurveyPublic] Error submitting responses:', error);
          setSubmitError('Failed to submit your responses. Please try again.');
        } else {
          console.log('[SurveyPublic] Responses submitted successfully');
          // Clear responses after successful submission
          setResponses({});
        }
      });
    });
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
      background: isPreviewMode ? '#FFF9EB' : '#f9f4f7',
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
              color: survey.color || '#552a47'
            }}
            onStart={handleStart}
            disabled={loadingQuestions} // Allow starting even if no questions
          />
        )}
        {loadingQuestions && (
          <div style={{ padding: 40 }}>Loading questions...</div>
        )}
        {questionsError && (
          <div style={{ padding: 40, color: 'red' }}>{questionsError}</div>
        )}
        {step === 'section-transition' && survey && (
          <SectionTransition
            logo={survey.logo}
            color={survey.color || '#552a47'}
            sectionTitle={currentSection}
            sectionDescription={getSectionDescription(currentSection)}
            illustration={getSectionIllustration()}
            progress={{
              current: nextSectionIndex,
              total: questions.length
            }}
            onContinue={handleContinueFromSection}
            onBack={handleBack}
          />
        )}
        {typeof step === 'number' && questions[step] && (
          <SurveyQuestion
            question={questions[step]}
            progress={`${step + 1}/${questions.length}`}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 'done' && survey && (
          <div style={{ padding: 40, textAlign: 'center', color: survey.color || '#552a47' }}>
            {isPreviewMode ? (
              // Preview mode completion screen
              <>
                <h2>End of Preview</h2>
                <p>This is a preview. Please contact your administrator to participate.</p>
                <button
                  style={{ marginTop: 24, background: '#552a47', color: '#f9f4f7', border: 'none', borderRadius: 8, fontWeight: 700, padding: '12px 32px', fontSize: 16, cursor: 'pointer' }}
                  onClick={() => setStep('welcome')}
                >
                  Back to Welcome
                </button>
              </>
            ) : (
              // Actual survey completion screen
              <>
                <h2>Thank You!</h2>
                {submitting ? (
                  <p>Submitting your responses...</p>
                ) : submitError ? (
                  <>
                    <p style={{ color: 'red' }}>{submitError}</p>
                    <button
                      style={{ marginTop: 24, background: '#552a47', color: '#f9f4f7', border: 'none', borderRadius: 8, fontWeight: 700, padding: '12px 32px', fontSize: 16, cursor: 'pointer' }}
                      onClick={submitResponses}
                    >
                      Try Again
                    </button>
                  </>
                ) : (
                  <>
                    <p>Your responses have been submitted successfully. Thank you for participating in this survey.</p>
                    <button
                      style={{ marginTop: 24, background: '#552a47', color: '#f9f4f7', border: 'none', borderRadius: 8, fontWeight: 700, padding: '12px 32px', fontSize: 16, cursor: 'pointer' }}
                      onClick={() => setStep('welcome')}
                    >
                      Back to Welcome
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyPublic;

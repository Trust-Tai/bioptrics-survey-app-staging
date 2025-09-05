import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { FiCheckCircle, FiRefreshCw, FiClock, FiBarChart2, FiCheckSquare, FiStar } from 'react-icons/fi';
import { SurveyResponses } from '../../../features/surveys/api/surveyResponses';
import '../components/ModernSurvey.css';
import './ModernSurveyThankYou.css';
import styled from 'styled-components';

interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  featuredImage?: string;
  color?: string;
  defaultSettings?: {
    allowRetake?: boolean;
    [key: string]: any;
  };
  questionCount?: number;
  // Thank you screen customization fields
  thankYouMessage?: string;
  thankYouTitle?: string;
  thankYouDetails?: string;
  thankYouIcon?: string;
  thankYouBoxes?: Array<{
    title: string;
    subtitle: string;
    icon: string;
    selected?: boolean;
  }>;
}

interface ModernSurveyThankYouProps {
  survey: Survey;
  color?: string;
  onRestart?: () => void;
  responses?: number;
  completionTime?: number; // in seconds
  averageRating?: number;
  responseId?: string | null; // ID of the current survey response
}

// Helper function to format time in minutes and seconds
const formatTime = (timeInSeconds: number): string => {
  if (!timeInSeconds) return '0 min 0 sec';
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  return `${minutes} min ${seconds} sec`;
};

// Styled components for ThankYou page
const ThankYouContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Inter', sans-serif;
  color: #333;
  animation: fadeIn 0.6s ease-out;
  background-color: #fdf2f8; /* Light pink background from Figma */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const TopLogo = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 120px;
  height: 40px;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const ThankYouHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ThankYouIcon = styled.div`
  margin: 0 auto;
  width: 200px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.5s ease-out;
  margin-bottom: 40px;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const ThankYouTitle = styled.h1`
  font-size: 42px;
  font-weight: 400;
  margin-bottom: 16px;
  color: #1f1f1f;
  font-family: 'Playfair Display', serif;
  font-style: italic;
  line-height: 1.1;
`;

const ThankYouMessage = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #4b5563;
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  margin-bottom: 40px;
  font-weight: 400;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 40px;
  width: 100%;
  max-width: 600px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: all 0.2s ease;
  border: 1px solid #f3f4f6;
  position: relative;
  overflow: hidden;
`;

const StatIcon = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #552a47;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatContent = styled.div`
  width: 100%;
`;

const StatValue = styled.h3`
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1f1f1f;
  font-family: 'Inter', sans-serif;
  line-height: 1;
`;

const StatLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #552a47;
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatSublabel = styled.span`
  font-size: 11px;
  color: #6b7280;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
`;

const ThankYouActions = styled.div`
  text-align: center;
  margin-top: 30px;
  width: 100%;
  max-width: 600px;
`;

const RestartButton = styled.button`
  background-color: #552a47;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(85, 42, 71, 0.2);
  font-family: 'Inter', sans-serif;
  width: 100%;
  max-width: 180px;
  
  &:hover {
    background-color: #461e3b;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(85, 42, 71, 0.3);
  }
`;

const ButtonIcon = styled.span`
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  if (!color) return '#2c3e50';
  
  let usePound = false;
  
  if (color[0] === '#') {
    color = color.slice(1);
    usePound = true;
  }
  
  const num = parseInt(color, 16);
  
  let r = (num >> 16) + amount;
  r = Math.max(Math.min(255, r), 0);
  
  let g = ((num >> 8) & 0x00FF) + amount;
  g = Math.max(Math.min(255, g), 0);
  
  let b = (num & 0x0000FF) + amount;
  b = Math.max(Math.min(255, b), 0);
  
  return (usePound ? '#' : '') + (g | (r << 8) | (b << 16)).toString(16).padStart(6, '0');
};

// Convert hex color to RGB values for CSS variables
const hexToRgb = (hex: string): string => {
  if (!hex || hex === '') return '44, 62, 80'; // Default color (2c3e50)
  
  // Remove the # if present
  hex = hex.replace('#', '');
  
  try {
    // Parse the hex values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    
    return `${r}, ${g}, ${b}`;
  } catch (error) {
    console.error('Error parsing color:', error);
    return '44, 62, 80'; // Default color (2c3e50)
  }
};

const ModernSurveyThankYou: React.FC<ModernSurveyThankYouProps> = ({ 
  survey, 
  color, 
  onRestart,
  responses: propResponses,
  completionTime: propCompletionTime,
  averageRating = 4,
  responseId: propResponseId
}) => {
  // Get the current survey response data
  const [currentResponseData, setCurrentResponseData] = useState<{
    responseCount: number;
    completionTime: number;
    unansweredQuestions: number;
  }>({ responseCount: 0, completionTime: 0, unansweredQuestions: 0 });
  
  // Use Meteor's reactive data system to get the most recent survey response
  const { loading, surveyResponse } = useTracker(() => {
    // Set up a subscription to survey responses
    const handle = Meteor.subscribe('surveyResponses.recent');
    
    if (!handle.ready()) {
      return { loading: true, surveyResponse: null };
    }
    
    // Try to find the most recent response for this survey
    const response = SurveyResponses.findOne(
      { completed: true },
      { sort: { updatedAt: -1 } }
    );
    
    return { loading: false, surveyResponse: response };
  }, []);
  
  // State for total question count
  const [totalQuestionCount, setTotalQuestionCount] = useState<number>(0);
  
  // Use effect to get the current survey response data
  useEffect(() => {
    // Skip if survey doesn't have an ID
    if (!survey || !survey._id) {
      console.log('No survey ID available');
      return;
    }
    
    // Get the survey ID from the URL or localStorage
    const currentSurveyId = survey._id;
    console.log('Current survey ID:', currentSurveyId);
    
    // Use the response ID from props if available, otherwise use the one from the tracker
    const currentResponseId = propResponseId || surveyResponse?._id;
    console.log('Current response ID:', currentResponseId || 'none');
    
    // Use the combined method to get all survey data at once
    console.log('Fetching combined survey response data for survey:', currentSurveyId);
    
    // Pass the current response ID if available to get accurate unanswered questions count
    Meteor.call('getSurveyResponseData', currentSurveyId, currentResponseId, (error: any, result: any) => {
      if (error) {
        console.error('Error getting survey response data:', error);
        return;
      }
      
      console.log('Received survey response data:', result);
      console.log('Response count from server:', result.responseCount);
      
      // Update state with all values
      const updatedData = {
        responseCount: result.responseCount || 0,
        completionTime: result.completionTime || 0,
        unansweredQuestions: result.unansweredQuestions || 0
      };
      
      console.log('Updating state with response data:', updatedData);
      setCurrentResponseData(updatedData);
      
      // Set the total question count
      setTotalQuestionCount(result.questionCount || 0);
    });
  }, [survey._id, surveyResponse]);
  
  // For debugging
  useEffect(() => {
    console.log('Current response data:', currentResponseData);
  }, [currentResponseData]);
  
  // Use props values if provided, otherwise use the data from the current response
  const displayTotalResponses = propResponses !== undefined ? propResponses : 
                               (currentResponseData.responseCount || 0); // Don't fallback to questionCount or hardcoded 9
  
  // For completion time, use prop if provided, otherwise use the actual completion time
  const surveyTime = propCompletionTime !== undefined ? propCompletionTime : 
                    (currentResponseData.completionTime || 222);
                    
  // Get the unanswered questions count
  const unansweredQuestions = currentResponseData.unansweredQuestions || 0;
  console.log('currentResponseData---:', currentResponseData);
  
  // Get the total questions count - prioritize the count from our method call
  // Fall back to survey.questionCount or a default value if needed
  const totalQuestions = totalQuestionCount || survey.questionCount || 0;
  console.log('Total questions---:', totalQuestions, 'from server:', totalQuestionCount);
  // Calculate the actual number of answered questions
  const answeredQuestions = Math.max(0, totalQuestions - unansweredQuestions);
  
  // Calculate completion percentage
  // If all questions are unanswered, completion should be 0%
  const completionPercentage = totalQuestions > 0 ? 
    Math.round((answeredQuestions / totalQuestions) * 100) : 100;
    
  console.log('Completion calculation:', { 
    totalQuestions, 
    unansweredQuestions, 
    answeredQuestions, 
    completionPercentage 
  });
  const [mounted, setMounted] = useState(false);
  
  // Hide header and remove padding from main div
  useEffect(() => {
    // Show the header
    const header = document.querySelector('header') as HTMLElement;
    if (header) {
      header.style.display = 'block';
    }
    
    // Remove padding from main div
    const mainDiv = document.querySelector('div#react-target') as HTMLElement;
    if (mainDiv) {
      mainDiv.style.padding = '0';
    }
    
    setMounted(true);
    
    // Cleanup function to restore original styles when component unmounts
    return () => {
      if (header) {
        header.style.display = '';
      }
      if (mainDiv) {
        mainDiv.style.padding = '';
      }
    };
  }, []);

  const handleRestart = () => {
    if (onRestart) {
      onRestart();
    }
  };

  // We don't need to manually set the color as it's now handled by CSS variables
  // from SurveyThemeProvider
  
  return (
    <ThankYouContainer>
      <ThankYouHeader>
        <ThankYouIcon>
          <img 
            src={survey.logo || "/bioptrics_fixed_black.png"} 
            alt="Company Logo" 
          />
        </ThankYouIcon>
        
        <ThankYouTitle>{survey.thankYouTitle || 'Survey Completed'}</ThankYouTitle>
        <ThankYouMessage>
          {survey.thankYouDetails || 'Your responses have been recorded successfully'}
        </ThankYouMessage>
      </ThankYouHeader>
      
      <StatsContainer>
        {/* Use custom thank you boxes if available, otherwise use default boxes */}
        {survey.thankYouBoxes && survey.thankYouBoxes.length > 0 ? (
          // Render custom thank you boxes from survey data that are selected
          survey.thankYouBoxes
            .filter(box => box.selected === true) // Only show boxes that are explicitly selected
            .map((box, index) => {
              // Find the original index in the full array for correct icon mapping
              const originalIndex = survey.thankYouBoxes!.findIndex(b => 
                b.title === box.title && b.subtitle === box.subtitle
              );
              
              return (
                <StatCard key={`thank-you-box-${index}`}>
                  <StatIcon>
                    {/* Use appropriate icon based on original box index if no custom icon is specified */}
                    {originalIndex === 0 && <FiCheckSquare size={20} />}
                    {originalIndex === 1 && <FiBarChart2 size={20} />}
                    {originalIndex === 2 && <FiCheckCircle size={20} />}
                    {originalIndex === 3 && <FiClock size={20} />}
                  </StatIcon>
                  <StatContent>
                    <StatValue>
                      {originalIndex === 0 ? answeredQuestions : 
                       originalIndex === 1 ? (currentResponseData.unansweredQuestions || 0) : 
                       originalIndex === 2 ? `${completionPercentage}%` : 
                       formatTime(surveyTime)}
                    </StatValue>
                    <StatLabel>{box.title}</StatLabel>
                    <StatSublabel>{box.subtitle}</StatSublabel>
                  </StatContent>
                </StatCard>
              );
            })
        ) : (
          // Render default boxes if no custom boxes are defined
          <>
            <StatCard>
              <StatIcon>
                <FiCheckSquare size={20} />
              </StatIcon>
              <StatContent>
                <StatValue>{answeredQuestions}</StatValue>
                <StatLabel>Total Questions Answered</StatLabel>
                <StatSublabel>Number of questions with responses</StatSublabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <FiBarChart2 size={20} />
              </StatIcon>
              <StatContent>
                <StatValue>{currentResponseData.unansweredQuestions || 0}</StatValue>
                <StatLabel>Unanswered Questions</StatLabel>
                <StatSublabel>Empty answer fields</StatSublabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <FiCheckCircle size={20} />
              </StatIcon>
              <StatContent>
                <StatValue>{completionPercentage}%</StatValue>
                <StatLabel>Completion</StatLabel>
                <StatSublabel>Survey completed</StatSublabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <FiClock size={20} />
              </StatIcon>
              <StatContent>
                <StatValue>{formatTime(surveyTime)}</StatValue>
                <StatLabel>Time Taken</StatLabel>
                <StatSublabel>Total duration</StatSublabel>
              </StatContent>
            </StatCard>
          </>
        )}
      </StatsContainer>
      
      {/* Removed Journey, Impact, and Next Steps sections as requested */}
      
      <ThankYouActions>
        {(survey.defaultSettings?.allowRetake !== false) && (
          <RestartButton onClick={handleRestart}>
            <ButtonIcon>
              <FiRefreshCw size={16} />
            </ButtonIcon>
            Take Survey Again
          </RestartButton>
        )}
      </ThankYouActions>
    </ThankYouContainer>
  );
};

export default ModernSurveyThankYou;

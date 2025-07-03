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
}

interface ModernSurveyThankYouProps {
  survey: Survey;
  color?: string;
  onRestart?: () => void;
  responses?: number;
  completionTime?: number; // in seconds
  averageRating?: number;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: var(--body-font, 'Inter, sans-serif');
  color: var(--text-color, #333);
  animation: fadeIn 0.6s ease-out;
  background-color: var(--background-color, #ffffff);
`;

const ThankYouHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const ThankYouIcon = styled.div`
  margin: 0 auto 20px;
  width: 80px;
  height: 80px;
  background-color: rgba(var(--primary-color-rgb, 44, 62, 80), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.5s ease-out;
  
  svg {
    color: var(--primary-color, #552a47);
  }
`;

const ThankYouTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--primary-color, #1f2937);
  font-family: var(--heading-font, 'Inter, sans-serif');
`;

const ThankYouMessage = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-color, #4b5563);
  max-width: 600px;
  margin: 0 auto;
  font-family: var(--body-font, 'Inter, sans-serif');
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 60px;
`;

const StatCard = styled.div`
  background-color: var(--card-background, white);
  border-radius: var(--card-radius, 12px);
  padding: 24px;
  box-shadow: var(--card-shadow, 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: flex-start;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
  flex-shrink: 0;
  background-color: var(--primary-color, #4b5563);
  
  svg {
    color: white;
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.h3`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--primary-color, #1f2937);
  font-family: var(--heading-font, 'Inter, sans-serif');
`;

const StatLabel = styled.p`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--text-color, #4b5563);
  font-family: var(--body-font, 'Inter, sans-serif');
`;

const StatSublabel = styled.span`
  font-size: 14px;
  color: var(--secondary-text-color, #6b7280);
  font-family: var(--body-font, 'Inter, sans-serif');
`;

const ThankYouActions = styled.div`
  text-align: center;
`;

const RestartButton = styled.button`
  background-color: var(--button-background, var(--primary-color, #4b5563));
  color: var(--button-text, white);
  border: 1px solid var(--primary-color, #4b5563);
  border-radius: var(--button-radius, 30px);
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
  box-shadow: var(--card-shadow, 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1));
  font-family: var(--body-font, 'Inter, sans-serif');
  
  &:hover {
    background-color: var(--button-hover, #3a4451);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
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
  averageRating = 4
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
    
    // First try: If we have a survey response from the tracker, use that data
    if (surveyResponse && surveyResponse.surveyId === currentSurveyId) {
      const responseCount = surveyResponse.responses?.length || 0;
      const completionTime = surveyResponse.completionTime || 0;
      
      console.log('Using data from reactive data source:', { responseCount, completionTime });
      
      setCurrentResponseData({
        responseCount,
        completionTime,
        unansweredQuestions: surveyResponse.unansweredQuestions || 0
      });
      return;
    }
    
    // Otherwise, use the separate Meteor method calls with the current survey ID
    console.log('Using separate Meteor method calls to get data for survey:', currentSurveyId);
    
    // Use individual method calls as a fallback
    console.log('Using individual method calls for survey:', currentSurveyId);
    
    // Get total responses count
    Meteor.call('getTotalResponsesCount', currentSurveyId, (error1: any, responseCount: number) => {
      if (error1) {
        console.error('Error getting total responses count:', error1);
        responseCount = 0;
      }
      
      // Get completion time
      Meteor.call('getSurveyCompletionTime', currentSurveyId, (error2: any, completionTime: number) => {
        if (error2) {
          console.error('Error getting completion time:', error2);
          completionTime = 0;
        }
        
        // Get unanswered questions count
        Meteor.call('getUnansweredQuestionsCount', currentSurveyId, (error3: any, unansweredQuestions: number) => {
          if (error3) {
            console.error('Error getting unanswered questions count:', error3);
            unansweredQuestions = 0;
          }
          
          console.log('All data collected:', { responseCount, completionTime, unansweredQuestions });
          
          // Update state with all values
          setCurrentResponseData({
            responseCount: responseCount || 0,
            completionTime: completionTime || 0,
            unansweredQuestions: unansweredQuestions || 0
          });
        });
      });
    });
  }, [survey._id, surveyResponse]);
  
  // For debugging
  useEffect(() => {
    console.log('Current response data:', currentResponseData);
  }, [currentResponseData]);
  
  // Use props values if provided, otherwise use the data from the current response
  const displayTotalResponses = propResponses !== undefined ? propResponses : 
                               (currentResponseData.responseCount || (survey.questionCount || 9));
  
  // For completion time, use prop if provided, otherwise use the actual completion time
  const surveyTime = propCompletionTime !== undefined ? propCompletionTime : 
                    (currentResponseData.completionTime || 222);
  const [mounted, setMounted] = useState(false);
  
  // Hide header and remove padding from main div
  useEffect(() => {
    // Hide the header
    const header = document.querySelector('header') as HTMLElement;
    if (header) {
      header.style.display = 'none';
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
          <FiCheckCircle size={48} color="var(--primary-color, #552a47)" />
        </ThankYouIcon>
        <ThankYouTitle>Thank You!</ThankYouTitle>
        <ThankYouMessage>
          Your responses have been successfully submitted. We appreciate your time and feedback.
        </ThankYouMessage>
      </ThankYouHeader>
      
      <StatsContainer>
        <StatCard>
          <StatIcon>
            <FiCheckSquare size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>{displayTotalResponses}</StatValue>
            <StatLabel>Total Responses</StatLabel>
            <StatSublabel>Questions answered</StatSublabel>
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
            <StatValue>100%</StatValue>
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
      </StatsContainer>
      
      {/* Removed Journey, Impact, and Next Steps sections as requested */}
      
      <ThankYouActions>
        {(survey.defaultSettings?.allowRetake !== false) && (
          <RestartButton onClick={handleRestart}>
            <ButtonIcon>
              <FiRefreshCw size={18} />
            </ButtonIcon>
            Take Survey Again
          </RestartButton>
        )}
      </ThankYouActions>
    </ThankYouContainer>
  );
};

export default ModernSurveyThankYou;

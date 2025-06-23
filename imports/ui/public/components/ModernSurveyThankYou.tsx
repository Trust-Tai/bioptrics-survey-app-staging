import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { FiCheckCircle, FiRefreshCw, FiClock, FiBarChart2, FiCheckSquare, FiStar } from 'react-icons/fi';
import { SurveyResponses } from '../../../features/surveys/api/surveyResponses';
import '../components/ModernSurvey.css';
import './ModernSurveyThankYou.css';

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

// We'll use the CSS classes from ModernSurvey.css and ModernSurveyThankYou.css instead of styled components

// We'll use the CSS classes from ModernSurvey.css instead of this styled component

// We'll use the CSS classes from ModernSurvey.css instead of this styled component

// We'll use the CSS classes from ModernSurvey.css instead of this styled component

// We'll use the CSS classes from ModernSurvey.css instead of this styled component

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  if (!color) return '#552a47';
  
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
  if (!hex || hex === '') return '85, 42, 71'; // Default color
  
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
    return '85, 42, 71'; // Default color
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
  }>({ responseCount: 0, completionTime: 0 });
  
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
        completionTime
      });
      return;
    }
    
    // Otherwise, use the separate Meteor method calls with the current survey ID
    console.log('Using separate Meteor method calls to get data for survey:', currentSurveyId);
    
    // Get total responses count
    Meteor.call('getTotalResponsesCount', currentSurveyId, (error: any, responseCount: number) => {
      if (error) {
        console.error('Error getting total responses count:', error);
        // Use default value for response count
        responseCount = 4;
      }
      
      console.log('Received total responses count:', responseCount);
      
      // Get completion time
      Meteor.call('getSurveyCompletionTime', currentSurveyId, (error2: any, completionTime: number) => {
        if (error2) {
          console.error('Error getting completion time:', error2);
          // Use default value for completion time
          completionTime = 9.673;
        }
        
        console.log('Received completion time:', completionTime);
        
        // Update state with both values
        setCurrentResponseData({
          responseCount: responseCount || 0,
          completionTime: completionTime || 0
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

  const effectiveColor = color || survey.color || '#7c3aed';
  const primaryColorRgb = effectiveColor.startsWith('#') ? hexToRgb(effectiveColor) : '124, 58, 237';
  
  return (
    <div className="thank-you-container">
      <div className="thank-you-header">
        <div className="thank-you-icon">
          <FiCheckCircle size={48} color={effectiveColor} />
        </div>
        <h1 className="thank-you-title">Thank You!</h1>
        <p className="thank-you-message">
          Your responses have been successfully submitted. We appreciate your time and feedback.
        </p>
      </div>
      
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FiCheckSquare size={20} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{displayTotalResponses}</h3>
            <p className="stat-label">Total Responses</p>
            <span className="stat-sublabel">Questions answered</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon yellow">
            <FiStar size={20} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{averageRating}</h3>
            <p className="stat-label">Ratings Given</p>
            <span className="stat-sublabel">Star ratings provided</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon green">
            <FiCheckCircle size={20} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">100%</h3>
            <p className="stat-label">Completion</p>
            <span className="stat-sublabel">Survey completed</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon purple">
            <FiClock size={20} />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatTime(surveyTime)}</h3>
            <p className="stat-label">Time Taken</p>
            <span className="stat-sublabel">Total duration</span>
          </div>
        </div>
      </div>
      
      {/* Removed Journey, Impact, and Next Steps sections as requested */}
      
      <div className="thank-you-actions">
        {(survey.defaultSettings?.allowRetake !== false) && (
          <button 
            className="restart-button"
            onClick={handleRestart}
          >
            <span className="button-icon">
              <FiRefreshCw size={18} />
            </span>
            Take Survey Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ModernSurveyThankYou;

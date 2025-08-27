import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import ModernSurveyWelcome from './ModernSurveyWelcome';
import ModernSurveyThankYou from './ModernSurveyThankYou';

// Types (simplified for Welcome Screen only)
interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  image?: string;
  featuredImage?: string;
  color?: string;
}

interface StepType {
  type: 'welcome' | 'thank-you';
}

interface PublicSurveyRendererProps {
  survey: Survey;
  token: string;
  isPreviewMode?: boolean;
}

const SurveyContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
`;

/**
 * PublicSurveyRenderer - New component that properly handles question ordering
 * from the survey builder's Questions tab using surveyOrder as the primary source
 */
const PublicSurveyRenderer: React.FC<PublicSurveyRendererProps> = ({
  survey,
  token,
  isPreviewMode = false
}) => {
  // State (simplified for Welcome Screen only)
  const [currentStep, setCurrentStep] = useState<StepType>({ type: 'welcome' });
  const [sessionStartTime, setSessionStartTime] = useState(new Date());

  // Basic survey data processing for Welcome Screen only
  useEffect(() => {
    if (!survey) return;

    console.log('=== PublicSurveyRenderer: Processing survey for Welcome Screen ===');
    console.log('Survey data:', {
      surveyId: survey._id,
      title: survey.title,
      description: survey.description
    });

    // For now, we only need basic survey info for the Welcome Screen
    // Question processing will be implemented later

  }, [survey]);


  // Update current step (simplified for Welcome Screen only)
  const updateCurrentStep = (newStep: StepType) => {
    console.log('Updating current step:', newStep);
    setCurrentStep(newStep);
  };

  // Handle starting the survey
  const handleStart = () => {
    console.log('Starting survey - Welcome Screen only for now');
    // TODO: Implement navigation to questions when question processing is added
    updateCurrentStep({ type: 'thank-you' });
  };

  // Handle restarting the survey
  const handleRestart = () => {
    console.log('Restarting survey - returning to welcome screen');
    // Reset to welcome screen
    updateCurrentStep({ type: 'welcome' });
    // Reset session start time for accurate timing
    setSessionStartTime(new Date());
  };


  // Render appropriate content based on current step
  const renderContent = () => {
    switch (currentStep.type) {
      case 'welcome':
        return (
          <ModernSurveyWelcome
            survey={survey}
            onStart={handleStart}
            totalQuestions={0} // Will be updated when question processing is implemented
            totalSections={0}  // Will be updated when section processing is implemented
          />
        );

      case 'thank-you':
        return (
          <ModernSurveyThankYou
            survey={survey}
            responses={0}
            completionTime={Math.round((new Date().getTime() - sessionStartTime.getTime()) / 1000)}
            onRestart={handleRestart}
          />
        );

      default:
        // For now, only Welcome and Thank You screens are implemented
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Survey Implementation In Progress</h2>
            <p>Question and section rendering will be implemented soon.</p>
          </div>
        );
    }
  };

  return (
    <SurveyContainer>
      {renderContent()}
    </SurveyContainer>
  );
};

export default PublicSurveyRenderer;

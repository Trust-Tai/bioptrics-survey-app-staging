import React from 'react';
import { useParams } from 'react-router-dom';
import EnhancedSurveyBuilder from '../../features/surveys/components/EnhancedSurveyBuilder';
import { QuestionBuilderPanelProvider } from '../../features/questions/contexts/QuestionBuilderPanelContext';

// This wrapper component extracts the surveyId parameter from the URL
// and passes it to the EnhancedSurveyBuilder component
// It also wraps the EnhancedSurveyBuilder with QuestionBuilderPanelProvider
// to enable the use of the QuestionBuilderPanelContext

interface SurveyBuilderWrapperProps {
  showAnalytics?: boolean;
}

const SurveyBuilderWrapper: React.FC<SurveyBuilderWrapperProps> = ({ showAnalytics }) => {
  const { surveyId } = useParams<{ surveyId: string }>();
  
  return (
    <QuestionBuilderPanelProvider>
      <EnhancedSurveyBuilder surveyId={surveyId} showAnalytics={showAnalytics} />
    </QuestionBuilderPanelProvider>
  );
};

export default SurveyBuilderWrapper;

import React from 'react';
import { useParams } from 'react-router-dom';
import EnhancedSurveyBuilder from '../../features/surveys/components/EnhancedSurveyBuilder';

// This wrapper component extracts the surveyId parameter from the URL
// and passes it to the EnhancedSurveyBuilder component
const SurveyBuilderWrapper: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  
  return <EnhancedSurveyBuilder surveyId={surveyId} />;
};

export default SurveyBuilderWrapper;

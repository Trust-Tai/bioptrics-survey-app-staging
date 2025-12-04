import React from 'react';
import { useParams } from 'react-router-dom';
// Import your existing survey builder component
import EnhancedSurveyBuilder from '/imports/features/surveys/components/EnhancedSurveyBuilder';

const SurveyBuilder: React.FC = () => {
  const { surveyId } = useParams<{ surveyId?: string }>();
  
  return <EnhancedSurveyBuilder surveyId={surveyId} />;
};

export default SurveyBuilder;

import React from 'react';
import { useParams } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Surveys } from '/imports/api/surveys';
import DashboardBg from '../admin/DashboardBg';

const SurveyPublic: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const survey = useTracker(() => {
    if (!token) return null;
    Meteor.subscribe('surveys.public', token);
    return Surveys.findOne({ shareToken: token, published: true });
  }, [token]);

  if (!survey) return <div style={{ padding: 40 }}>Loading survey...</div>;
  // Render the survey as in preview mode (read-only, for respondents)
  return (
    <DashboardBg>
      <h2 style={{ color: survey.color || '#b0802b', marginBottom: 24 }}>{survey.title}</h2>
      <div style={{ marginBottom: 24 }}>{survey.description}</div>
      {/* Render questions and sections as preview (customize as needed) */}
      {/* You can expand this to match your preview UI */}
      <div>
        <b>Demographics:</b> {Array.isArray(survey.selectedDemographics) ? survey.selectedDemographics.join(', ') : ''}
      </div>
      {/* ...render more survey content here... */}
      <div style={{ marginTop: 32, color: '#b0802b' }}>
        <i>This is a preview. Please contact your administrator to participate.</i>
      </div>
    </DashboardBg>
  );
};

export default SurveyPublic;

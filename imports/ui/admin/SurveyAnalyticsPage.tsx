import React from 'react';
import { useParams } from 'react-router-dom';
import SurveyAnalyticsTab from '../../features/surveys/components/analytics/SurveyAnalyticsTab';
import AdminLayout from '/imports/layouts/AdminLayout';

/**
 * Standalone page for survey analytics
 * This component is used for direct access to analytics via /admin/analytics/:surveyId
 */
const SurveyAnalyticsPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  
  return (
    <AdminLayout>
      <div className="dashboard-bg" style={{ padding: '20px', minHeight: 'calc(100vh - 60px)' }}>
        <div className="container">
          <h2 className="mb-4">Survey Analytics</h2>
          <SurveyAnalyticsTab surveyId={surveyId || ''} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default SurveyAnalyticsPage;

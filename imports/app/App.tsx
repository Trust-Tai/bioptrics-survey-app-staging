import React from 'react';
import { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';

// Import from features
import { OrganizationProvider } from '../features/organization';
// Import survey components from their respective locations
import { SurveyManagement, SurveyPage } from '../features/surveys/components/admin';
import { SurveyBuilder } from '../features/surveys';
import { SurveyManagementDashboard } from '../features/surveys';
import { AdminAnalyticsDashboard, AnalyticsDashboard } from '../features/analytics/components/admin';
import { SectionQuestions, SectionCompletionIndicator, SectionProgressOverview } from '../features/surveys/components/sections';
import { SurveyThemes } from '../features/survey-themes/api/surveyThemes';
import { SurveyTheme } from '../features/survey-themes';
import { WPSFramework } from '../features/wps-framework';
import { SurveyGoals } from '../features/survey-goals';
import { SurveyGoalsPage } from '../features/survey-goals/components/admin';
import { QuestionBuilder } from '../features/questions/components/admin';

// Import from pages
import { AdminDashboard } from '../pages/admin';
import { PublicSurveyPage } from '../pages/public';

// Import from layouts
import AdminLayout from '../layouts/AdminLayout/AdminLayout';

// Import remaining components (to be moved to features later)
import { AdminLogin } from '../ui/AdminLogin';
import Analytics from '../ui/admin/Analytics';
import OrgSetup from '../ui/admin/OrgSetup';
import Setting from '../ui/admin/Setting';
import Users from '../ui/admin/Users';
import AllUsers from '../ui/admin/AllUsers';
import { AddUser } from '../features/users/components/admin';
import RoleManagement from '../ui/admin/RoleManagement';
import Welcome from '../ui/Welcome';
import SurveyWelcome from '../ui/SurveyWelcome';
import GetToKnowYou from '../ui/GetToKnowYou';
import SurveyQuestion from '../ui/SurveyQuestion';
import SectionIntro from '../ui/SectionIntro';
import LeadershipManagement from '../ui/user/LeadershipManagement';
import TermsOfUse from '../ui/TermsOfUse';
import PrivacyNotice from '../ui/PrivacyNotice';
import AdminQuestionBank from '../ui/admin/AdminQuestionBank';
import UserQuestionBank from '../ui/user/UserQuestionBank';
import AllQuestions from '../ui/admin/AllQuestions';
import Bank from '../ui/admin/Bank';
// Import remaining components from UI (to be migrated later)
import AllSurveys from '../ui/admin/AllSurveys';
import SurveyPublic from '../ui/public/SurveyPublic';
import SurveyResponses from '../ui/admin/SurveyResponses';
import LogoutPage from '../ui/LogoutPage';

function RequireAdminAuth() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_jwt') : null;
  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }
  return <Outlet />;
}

function RequireAuth() {
  const [checking, setChecking] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean|null>(null);
  const token = localStorage.getItem('jwt');
  const path = window.location.pathname;

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    Meteor.call('auth.getOnboardingStatus', (err: any, res: any) => {
      if (err) {
        setOnboardingComplete(false);
      } else {
        setOnboardingComplete(!!(res && res.onboardingComplete));
      }
      setChecking(false);
    });
  }, [token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }
  if (checking) {
    return null; // Or a spinner/loading
  }
  // Allow access to onboarding page without the flag
  if (!onboardingComplete && path !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  // Prevent onboarding page access if already completed
  if (onboardingComplete && path === '/onboarding') {
    return <Navigate to="/home" replace />;
  }
  return <Outlet />;
}

// Wrapper for Section Intro, uses Meteor/react-meteor-data to fetch section info
const SectionIntroWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { sectionIdx } = useParams<{ sectionIdx: string }>();
  const idx = Number(sectionIdx) || 0;
  const surveyThemes = useTracker(() => {
    Meteor.subscribe('surveyThemes.all');
    return SurveyThemes.find().fetch();
  }, []);
  const theme = surveyThemes[idx];
  if (!theme) return null;
  return (
    <SectionIntro
      title={theme.name}
      description={theme.description}
      onContinue={() => navigate(`/survey/section/${idx}/question/0`)}
      onBack={idx > 0 ? () => navigate(`/survey/section/${idx - 1}`) : undefined}
    />
  );
};

// Wrapper for Survey Question, placeholder for now
const SurveyQuestionWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { sectionIdx, questionIdx } = useParams<{ sectionIdx: string; questionIdx: string }>();
  const sIdx = Number(sectionIdx) || 0;
  const qIdx = Number(questionIdx) || 0;
  // TODO: Replace with real questions length
  const questionsLength = 4;
  return (
    <SurveyQuestion
      question="How often does your manager provide clear direction for your work?"
      progress={`${qIdx + 1}/${questionsLength}`}
      onNext={() => {}}
      onBack={qIdx > 0 ? () => navigate(`/survey/section/${sIdx}/question/${qIdx - 1}`) : () => navigate(`/survey/section/${sIdx}`)}
    />
  );
};

const PreviewSurvey: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  // You can keep your data loading logic if you want to show a fallback for missing tokens/data
  if (!token) return <div style={{textAlign:'center',marginTop:80}}>No preview token provided.</div>;
  // If you want to check for preview data in localStorage, do it here (optional)
  // Otherwise, just render SurveyPublic for the preview flow

  return <SurveyPublic />;
};

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={<AdminLogin onAdminAuth={() => navigate('/admin/dashboard')} />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/preview/survey/:token" element={<PreviewSurvey />} />
      <Route path="/survey/:surveyId" element={<PublicSurveyPage />} />
      <Route path="/survey/public/:token" element={<SurveyPublic />} />
      <Route path="/survey/section/:sectionIdx" element={<SectionIntroWrapper />} />
      <Route path="/survey/section/:sectionIdx/question/:questionIdx" element={<SurveyQuestionWrapper />} />
      <Route path="/leadership" element={<LeadershipManagement />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/privacy" element={<PrivacyNotice />} />
      <Route path="/admin" element={<AdminLogin onAdminAuth={() => navigate('/admin/dashboard')} />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin-login" element={<AdminLogin onAdminAuth={() => navigate('/admin/questions')} />} />
      <Route element={<RequireAdminAuth />}>
         <Route path="/admin/surveys" element={<SurveyManagement />} />
        <Route path="/admin/surveys/page" element={<SurveyPage />} />
         <Route path="/admin/surveys/goals" element={<SurveyGoals />} />
        <Route path="/admin/surveys/all" element={<AllSurveys />} />
        <Route path="/admin/surveys/responses" element={<SurveyResponses />} />
        <Route path="/admin/surveys/builder" element={<SurveyBuilder />} />
        <Route path="/admin/surveys/builder/:surveyId" element={<SurveyBuilderWrapper />} />
        <Route path="/admin/surveys/manage/:surveyId" element={<SurveyManagementDashboardWrapper />} />
        <Route path="/admin/surveys/:surveyId/analytics" element={<SurveyAnalyticsDashboardWrapper />} />
        <Route path="/admin/questions" element={<AdminQuestionBank />} />
        <Route path="/user/questions" element={<UserQuestionBank />} />
        <Route path="/admin/questions/all" element={<AllQuestions />} />
        <Route path="/admin/questions/builder" element={<QuestionBuilder />} />
        <Route path="/admin/bank" element={<Bank />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        {/* New routes for the refactored analytics dashboards */}
        <Route path="/admin/analytics/dashboard" element={<AdminAnalyticsDashboard />} />
        <Route path="/admin/analytics/overview" element={<AnalyticsDashboard />} />
        <Route path="/admin/setting" element={<Setting />} />
        <Route path="/admin/surveys/wps-framework" element={<WPSFramework />} />
        <Route path="/admin/surveys/theme" element={<SurveyTheme />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/users/all" element={<AllUsers />} />
        <Route path="/admin/users/add" element={<AddUser />} />
        <Route path="/admin/users/roles" element={<RoleManagement />} />
        <Route path="/admin/org-setup" element={<OrgSetup />} />
      </Route>
    </Routes>
  );
};

// App component with OrganizationProvider and simple routes
const App: React.FC = () => {
  // State to track if we should show an error
  const [error, setError] = useState<Error | null>(null);
  
  try {
    return (
      <Router>
        <OrganizationProvider>
          <Routes>
            <Route path="/" element={
              <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
                <h1>Bioptrics Survey Application</h1>
                <p>Welcome to the Bioptrics Survey Application</p>
                <div style={{ marginTop: '20px' }}>
                  <a href="/admin" style={{ 
                    display: 'inline-block',
                    padding: '10px 15px',
                    backgroundColor: '#552a47',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px'
                  }}>Go to Admin Login</a>
                </div>
              </div>
            } />
            <Route path="/admin" element={
              <AdminLogin onAdminAuth={() => {
                console.log('Admin authenticated, redirecting to dashboard');
                window.location.href = '/admin/dashboard';
              }} />
            } />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </OrganizationProvider>
      </Router>
    );
  } catch (err) {
    console.error('Error in App component:', err);
    setError(err instanceof Error ? err : new Error(String(err)));
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Bioptrics Survey Application - Error</h1>
        <p>An error occurred while rendering the application:</p>
        <pre style={{ backgroundColor: '#f8f8f8', padding: '10px', borderRadius: '4px' }}>
          {error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
};

// Wrapper for SurveyBuilder to extract :id param
const SurveyBuilderWrapper: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  return <SurveyBuilder editId={surveyId} />;
};

// Wrapper for SurveyManagementDashboard to extract :surveyId param
const SurveyManagementDashboardWrapper: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  return <SurveyManagementDashboard surveyId={surveyId} />;
};

// Wrapper for AdminAnalyticsDashboard to extract :surveyId param
const SurveyAnalyticsDashboardWrapper: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  if (!surveyId) {
    return <div>Survey ID is required for analytics</div>;
  }
  // The AdminAnalyticsDashboard component is now in the analytics feature
  return <AdminAnalyticsDashboard surveyId={surveyId} />;
};

export default App;

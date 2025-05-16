import React from 'react';
import { Navigate, Outlet, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { AdminLogin } from './AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import Analytics from './admin/Analytics';
import WPSFramework from './admin/WPSFramework';
import SurveyTheme from './admin/SurveyTheme';
import Setting from './admin/Setting';
import Welcome from './Welcome';
import GetToKnowYou from './GetToKnowYou';
import LeadershipManagement from './user/LeadershipManagement';
import TermsOfUse from './TermsOfUse';
import PrivacyNotice from './PrivacyNotice';
import AdminQuestionBank from './admin/AdminQuestionBank';
import UserQuestionBank from './user/UserQuestionBank';
import AllQuestions from './admin/AllQuestions';
import Bank from './admin/Bank';
import SurveyPage from './admin/Survey';
import SurveyGoalsPage from './admin/SurveyGoals';
import AllSurveys from './admin/AllSurveys';
import { BrowserRouter as Router } from 'react-router-dom';
import QuestionBuilder from './admin/QuestionBuilder';


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

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/survey" element={<GetToKnowYou />} />
      <Route path="/leadership" element={<LeadershipManagement />} />
      <Route path="/terms" element={<TermsOfUse />} />
      <Route path="/privacy" element={<PrivacyNotice />} />
      <Route path="/admin" element={<AdminLogin onAdminAuth={() => navigate('/admin/dashboard')} />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin-login" element={<AdminLogin onAdminAuth={() => navigate('/admin/questions')} />} />
      <Route element={<RequireAdminAuth />}>
         <Route path="/admin/surveys" element={<SurveyPage />} />
        <Route path="/admin/surveys/goals" element={<SurveyGoalsPage />} />
        <Route path="/admin/surveys/all" element={<AllSurveys />} />
        <Route path="/admin/questions" element={<AdminQuestionBank />} />
<Route path="/user/questions" element={<UserQuestionBank />} />
        <Route path="/admin/questions/all" element={<AllQuestions />} />
        <Route path="/admin/questions/builder" element={<QuestionBuilder />} />
        <Route path="/admin/bank" element={<Bank />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/setting" element={<Setting />} />
        <Route path="/admin/surveys/wps-framework" element={<WPSFramework />} />
        <Route path="/admin/surveys/theme" element={<SurveyTheme />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;

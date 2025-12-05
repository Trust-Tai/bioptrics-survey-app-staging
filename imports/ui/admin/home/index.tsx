import React, { useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import HeroSection from './components/HeroSection';
import ToolkitGrid from './components/ToolkitGrid';
import HelpSection from './components/HelpSection';
import { colors } from './theme/colors';
import LMSComingSoon from '/imports/modules/lms/pages/LMSComingSoon';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${colors.white};
`;

const HeroWrapper = styled.div`
  background: ${colors.creamBg};
  padding-bottom: 60px;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
`;

const MainContent = styled.div`
  background: ${colors.white};
  padding: 40px 0;
`;

const AdminHomePage: React.FC = () => {
  // Check if we're on the LMS subdomain
  const isLMSSubdomain = typeof window !== 'undefined' && 
    window.location.hostname.includes('pulse-dev.bioptrics.com');

  // If on LMS subdomain, show the LMS coming soon page
  if (isLMSSubdomain) {
    return <LMSComingSoon />;
  }

  useEffect(() => {
    // Check if there's a hash in the URL and scroll to that section
    const hash = window.location.hash;
    if (hash) {
      // Remove the # from the hash
      const elementId = hash.substring(1);
      // Wait a bit for the page to render
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  // Otherwise show the regular admin home page
  return (
    <AdminLayout>
      <PageContainer>
        <HeroWrapper>
          <ContentWrapper>
            <HeroSection />
          </ContentWrapper>
        </HeroWrapper>
        <MainContent>
          <ContentWrapper>
            <ToolkitGrid />
            <HelpSection />
          </ContentWrapper>
        </MainContent>
      </PageContainer>
    </AdminLayout>
  );
};

export default AdminHomePage;

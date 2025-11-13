import React from 'react';
import styled from 'styled-components';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import HeroSection from './components/HeroSection';
import ToolkitGrid from './components/ToolkitGrid';
import HelpSection from './components/HelpSection';
import { colors } from './theme/colors';

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

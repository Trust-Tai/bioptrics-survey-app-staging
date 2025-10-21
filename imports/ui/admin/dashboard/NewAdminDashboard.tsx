import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import { useTheme } from '../../../contexts/ThemeContext';
import { KPISection } from './components/sections/KPISection/KPISection';
import { PolicyComplianceSection } from './components/sections/PolicyCompliance/PolicyComplianceSection';
import { ChangeNoticesSection } from './components/sections/ChangeNotices/ChangeNoticesSection';
import { SafetyOverviewSection } from './components/sections/SafetyOverview/SafetyOverviewSection';
import { QuickStartSection } from './components/sections/QuickStartSurveys/QuickStartSection';
import { InsightsAlerts } from './components/sections/BottomSections/InsightsAlerts';
import { ExportsReports } from './components/sections/BottomSections/ExportsReports';

// Global styles for the dashboard
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 24px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
`;

const HeaderTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderSubtitle = styled.p`
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
`;

const DashboardContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e0e0e0 50%, transparent 100%);
  margin: 40px 0;
`;

const BottomSectionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 32px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

interface NewAdminDashboardProps {}

export const NewAdminDashboard: React.FC<NewAdminDashboardProps> = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for dashboard data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <AdminLayout>
        <DashboardContainer>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '60vh',
            fontSize: '18px',
            color: '#666'
          }}>
            Loading dashboard...
          </div>
        </DashboardContainer>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <DashboardContainer>
        <DashboardContent>
          {/* Dashboard Header */}
          <DashboardHeader>
            <HeaderContent>
              <HeaderTitle>Dashboard</HeaderTitle>
              <HeaderSubtitle>Workplace Safety & Compliance Insights</HeaderSubtitle>
            </HeaderContent>
          </DashboardHeader>

          {/* KPI Section */}
          <KPISection />

          <SectionDivider />

          {/* Quick Start Surveys Section */}
          <QuickStartSection />

          <SectionDivider />

          {/* Bottom Sections */}
          <BottomSectionsContainer>
            <InsightsAlerts />
            <ExportsReports />
          </BottomSectionsContainer>

          {/* Policy Compliance Section */}
          <PolicyComplianceSection />

          <SectionDivider />

          {/* Change Notices & Memos Section */}
          <ChangeNoticesSection />

          <SectionDivider />

          {/* Whole Person Safety Overview Section */}
          <SafetyOverviewSection />

        </DashboardContent>
      </DashboardContainer>
    </AdminLayout>
  );
};

export default NewAdminDashboard;

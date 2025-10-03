import React, { useState, useCallback, memo } from 'react';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { 
  FaUsers, 
  FaQuestionCircle, 
  FaClipboardList, 
  FaChartBar, 
  FaFileExport, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaFilter, 
  FaExclamationTriangle,
  FaTachometerAlt,
  FaBell
} from 'react-icons/fa';
import AdminDashboardSummary from '../../ui/admin/AdminDashboardSummary';
import Countdown from '../../ui/admin/Countdown';
import DashboardBg from '../../ui/admin/DashboardBg';

// Import custom hook and optimized components
import { useDashboardData, DashboardFilters, ActivityItem } from '../../features/analytics/hooks/useDashboardData';
import {
  KpiStatsGrid,
  ParticipationDonut,
  SiteResponsesChart,
  FlaggedIssuesList,
  TrendChart,
  HeatMapChart,
  AnonymityAlert as DashboardAnonymityAlert
} from '../../features/analytics/components/admin/DashboardComponents';

import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const GoldHeaderCard = styled.div`
  background: #552a47;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5rem 2rem;
  margin: 0 0 1.5rem 0;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  opacity: 0.9;
`;
const HeaderTitle = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0.2px;
`;

const HeaderEnds = styled.div`
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GoldIcon = styled.div`
  margin-left: 2.5rem;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
  width: 100%;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
const Card = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  padding: 1.25rem;
  height: 100%;
`;
const SectionTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const DonutChart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
`;
const DonutLegend = styled.div`
  margin-top: 0.75rem;
  font-size: 0.875rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: center;
`;
const DonutSub = styled.div`
  text-align: center;
  font-size: 1.13rem;
  margin-top: 0.6rem;
`;
// Layouts for different card sizes
const FullWidthCard = styled(Card)`
  grid-column: span 12;
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const HalfWidthCard = styled(Card)`
  grid-column: span 6;
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const QuarterWidthCard = styled(Card)`
  grid-column: span 3;
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;
const BarChart = styled.div`
  margin: 1rem 0;
  width: 100%;
`;
const BarBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  width: 100%;
`;
const BarLabel = styled.div`
  width: 100px;
  font-size: 0.875rem;
  color: #1c1c1c;
  font-weight: 600;
`;

const SiteLegend = styled.div`
  font-size: 1.04rem;
  margin-top: 0.5rem;
`;
const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  min-width: 140px;
`;

const QuickActionBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  color: #1c1c1c;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.primary {
    background: #552a47;
    border-color: #552a47;
    color: white;
    
    &:hover {
      background: #693658;
    }
  }
`;
const FlaggedList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const FlaggedItem = styled.li<{ severity?: 'high' | 'medium' | 'low' }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1c1c1c;
  border-left: 3px solid ${props => 
    props.severity === 'high' ? '#e74c3c' : 
    props.severity === 'medium' ? '#f39c12' : 
    '#27ae60'};
  background: ${props => 
    props.severity === 'high' ? '#fef5f5' : 
    props.severity === 'medium' ? '#fef9ef' : 
    '#f1faee'};
  border-radius: 4px;
`;
const MetricValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1c1c1c;
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #6c6c6c;
`;

const KpiCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const KpiIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #552a47;
`;

const HeatMapGrid = styled.div`
  display: grid;
  grid-template-columns: 130px repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
`;

const HeatMapHeader = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem;
  text-align: center;
  background: #f5f5f5;
  border-radius: 4px;
`;

const HeatMapRow = styled.div`
  display: contents;
`;

const HeatMapLabel = styled.div`
  font-size: 0.875rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
`;

const HeatMapCell = styled.div<{ score: number }>`
  background: ${props => {
    if (props.score >= 4) return '#27ae60';
    if (props.score >= 3) return '#2ecc71';
    if (props.score >= 2.5) return '#f39c12';
    if (props.score >= 2) return '#e67e22';
    return '#e74c3c';
  }};
  border-radius: 4px;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem;
  text-align: center;
`;

const AnonymityAlert = styled.div`
  background: #ffe9e9;
  color: #e74c3c;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;
const TrendBar = styled.div`
  margin-top: 1.1rem;
`;
const TrendRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.7rem;
`;
const TrendLabel = styled.div`
  width: 70px;
  font-size: 1.08rem;
  color: #552a47;
  font-weight: 600;
`;
const TrendFill = styled.div<{ width: number; color?: string }>`
  height: 14px;
  background: #552a47;
  border-radius: 8px;
  margin: 0 12px 0 0;
  width: ${({ width }) => width}%;
`;
const TrendValue = styled.div`
  width: 60px;
  font-weight: 700;
  color: #444;
`;

// Memoized Activity List component to prevent unnecessary re-renders
const ActivityList = memo(({ activities }: { activities: ActivityItem[] }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    {activities.map((activity, index) => (
      <div 
        key={index} 
        style={{ 
          padding: '0.75rem', 
          borderLeft: '3px solid #f0f0f0',
          background: '#f9f9f9',
          borderRadius: '4px'
        }}
      >
        <div style={{ fontSize: '0.75rem', color: '#6c6c6c', marginBottom: '0.25rem' }}>
          {activity.time}
        </div>
        <div style={{ fontSize: '0.875rem' }}>
          {activity.action}
        </div>
      </div>
    ))}
  </div>
));

// Filter options for better maintainability
const filterOptions = {
  sites: [
    { value: 'all', label: 'All Sites' },
    { value: 'rainy-river', label: 'Rainy River' },
    { value: 'new-afton', label: 'New Afton' },
    { value: 'corporate', label: 'Corporate' }
  ],
  departments: [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'operations', label: 'Operations' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' }
  ],
  roles: [
    { value: 'all', label: 'All Roles' },
    { value: 'manager', label: 'Managers' },
    { value: 'supervisor', label: 'Supervisors' },
    { value: 'engineer', label: 'Engineers' },
    { value: 'analyst', label: 'Analysts' }
  ],
  surveys: [
    { value: 'all', label: 'Current Survey' },
    { value: 'q1-2025', label: 'Q1 2025' },
    { value: 'q4-2024', label: 'Q4 2024' },
    { value: 'q3-2024', label: 'Q3 2024' }
  ]
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Filter state
  const [filters, setFilters] = useState<DashboardFilters>({
    site: 'all',
    department: 'all',
    role: 'all',
    survey: 'all'
  });
  
  // Use our custom hook to fetch and process dashboard data
  const { isLoading, error, dashboardData, showAnonymityWarning } = useDashboardData(filters);
  
  // Handle filter change - memoized to prevent unnecessary re-renders
  const handleFilterChange = useCallback((filterName: keyof DashboardFilters) => 
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters(prev => ({
        ...prev,
        [filterName]: e.target.value
      }));
    }, 
  []);
  
  // Handle KPI card click - memoized to prevent unnecessary re-renders
  const handleCardClick = useCallback((link: string) => {
    navigate(link);
  }, [navigate]);

  return (
    <AdminLayout>
      <DashboardBg>
        {/* Loading state */}
        {isLoading && (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div>Loading dashboard data...</div>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
            <div>Error loading dashboard data: {error.message}</div>
          </div>
        )}
        
        {/* Dashboard content - only render when data is available */}
        {!isLoading && !error && dashboardData && (
          <>
            {/* Survey Countdown Header */}
            <GoldHeaderCard>
              <div>
                <HeaderLabel>MAY '25</HeaderLabel>
                <HeaderTitle>BIOPTRICS Employee Survey</HeaderTitle>
                <HeaderEnds>
                  ENDS IN: <Countdown end={new Date('2025-05-31T23:59:59')} />
                </HeaderEnds>
              </div>
              <QuickActionBar>
                <ActionButton className="primary" onClick={() => navigate('/admin/surveys/all')}>
                  <FaClipboardList /> Create Survey
                </ActionButton>
                <ActionButton onClick={() => navigate('/admin/questions/builder')}>
                  <FaQuestionCircle /> Add Question
                </ActionButton>
                <ActionButton onClick={() => navigate('/admin/analytics')}>
                  <FaFileExport /> Export Results
                </ActionButton>
                <ActionButton onClick={() => navigate('/admin/org-setup')}>
                  <FaEnvelope /> Invite Participants
                </ActionButton>
              </QuickActionBar>
            </GoldHeaderCard>
            
            {/* Filter Bar */}
            <FilterBar>
              <FaFilter style={{ color: '#6c6c6c' }} />
              
              <FilterSelect value={filters.site} onChange={handleFilterChange('site')}>
                {filterOptions.sites.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </FilterSelect>
              
              <FilterSelect value={filters.department} onChange={handleFilterChange('department')}>
                {filterOptions.departments.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </FilterSelect>
              
              <FilterSelect value={filters.role} onChange={handleFilterChange('role')}>
                {filterOptions.roles.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </FilterSelect>
              
              <FilterSelect value={filters.survey} onChange={handleFilterChange('survey')}>
                {filterOptions.surveys.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </FilterSelect>
            </FilterBar>
            
            {/* Enhanced Dashboard Summary */}
            <Card style={{ marginBottom: '24px' }}>
              <SectionTitle>
                <FaTachometerAlt size={16} /> Enhanced Dashboard
              </SectionTitle>
              <AdminDashboardSummary organizationId={undefined} />
            </Card>
            
            {/* Anonymity Alert */}
            {showAnonymityWarning && (
              <DashboardAnonymityAlert>
                <FaExclamationTriangle />
                <div>Anonymity Warning: This filter selection contains fewer than 5 responses. Data has been hidden to protect employee privacy.</div>
              </DashboardAnonymityAlert>
            )}
            
            {/* KPI Cards - Using memoized component */}
            <KpiStatsGrid 
              stats={dashboardData.stats} 
              onCardClick={handleCardClick} 
            />
            
            <MainGrid>
              {/* Survey Participation - Using memoized component */}
              <ParticipationDonut 
                participationPct={dashboardData.participationPct} 
              />
              
              {/* Responses by Site - Using memoized component */}
              <SiteResponsesChart 
                siteData={dashboardData.siteData} 
                totalResponses={dashboardData.totalResponses} 
              />
              
              {/* Flagged Issues - Using memoized component */}
              <FlaggedIssuesList 
                flaggedIssues={dashboardData.flaggedIssues} 
              />
              
              {/* Engagement Score Trend - Using memoized component */}
              <TrendChart 
                trendData={dashboardData.trendData} 
              />
              
              {/* Heat Map - Using memoized component */}
              <HeatMapChart 
                heatMapData={dashboardData.heatMapData} 
              />
              
              {/* Recent Activity */}
              <HalfWidthCard>
                <SectionTitle>
                  <FaBell size={14} /> Recent Activity
                </SectionTitle>
                
                <ActivityList 
                  activities={[
                    { time: '2 hours ago', action: 'Jane Smith created a new survey: "Q2 Employee Feedback"' },
                    { time: '5 hours ago', action: 'John Davis exported survey results for "Leadership Assessment"' },
                    { time: 'Yesterday', action: 'Admin sent 45 new invitations to Operations department' },
                    { time: '2 days ago', action: 'Survey threshold alert: Communication score below target' },
                    { time: '3 days ago', action: 'Mike Johnson added 3 new questions to the Question Bank' }
                  ]}
                />
              </HalfWidthCard>
            </MainGrid>
          </>
        )}
      </DashboardBg>
    </AdminLayout>
  );
}

const Bar = styled.div<{ value: number; color: string }>`
  height: 14px;
  width: ${p => p.value * 2}px;
  background: ${p => p.color};
  border-radius: 7px;
  transition: width 0.5s;
`;
const BarValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #888;
  margin-left: 8px;
`;

export default AdminDashboard;
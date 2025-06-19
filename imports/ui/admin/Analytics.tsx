import React, { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { SurveyResponses } from '/imports/features/surveys/api/surveyResponses';
import {
  FiFilter,
  FiDownload,
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiMessageSquare,
  FiCalendar,
  FiUsers,
} from 'react-icons/fi';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';

// Styled components for the Analytics dashboard
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;


const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #552a47;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${(props) => (props.primary ? '#552a47' : '#f7f2f5')};
  color: ${(props) => (props.primary ? '#fff' : '#552a47')};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.primary ? '#693658' : '#efe7ed')};
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  svg {
    font-size: 16px;
  }
`;

const FilterBar = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 180px;

  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #666;
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #552a47;
    box-shadow: 0 0 0 1px #552a47;
  }
`;

const FilterButtons = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;

  @media (max-width: 768px) {
    margin-top: 8px;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(6, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const Card = styled.div<{ cols?: number }>`
  grid-column: span ${(props) => props.cols || 4};
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;

  @media (max-width: 1200px) {
    grid-column: span ${(props) => Math.min(props.cols || 4, 6)};
  }

  @media (max-width: 768px) {
    grid-column: 1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f7f2f5;
  border-radius: 8px;
  color: #552a47;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f7f2f5;
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #552a47;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #8a6d8a;
  font-weight: 500;
`;

const ThemeCard = styled.div`
  background: #f0f5fa;
  border-radius: 10px;
  padding: 16px;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const ThemeName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin-bottom: 8px;
`;

const ThemeScore = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const ThemeLabel = styled.div`
  font-size: 13px;
  color: #8a6d8a;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a6d8a;
  font-weight: 500;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid ${(props) => (props.active ? '#552a47' : 'transparent')};
  color: ${(props) => (props.active ? '#552a47' : '#666')};
  font-weight: ${(props) => (props.active ? '600' : '400')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #552a47;
  }
`;

const ExportButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for all KPI metrics
  const [completedSurveysCount, setCompletedSurveysCount] = useState(0);
  const [participationRate, setParticipationRate] = useState(0);
  const [avgEngagementScore, setAvgEngagementScore] = useState(0);
  const [avgCompletionTime, setAvgCompletionTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use useTracker for subscription
  const { loading } = useTracker(() => {
    const subscription = Meteor.subscribe('responses.all');
    return {
      loading: !subscription.ready()
    };
  }, []);
  
  // Use direct database query for accurate metrics
  useEffect(() => {
    // Get completed surveys count
    Meteor.call('getCompletedSurveysCount', (error: any, result: number) => {
      if (error) {
        console.error('Error getting completed surveys count:', error);
      } else {
        console.log('Direct DB query result - completed surveys count:', result);
        setCompletedSurveysCount(result);
      }
    });
    
    // Get participation rate
    Meteor.call('getParticipationRate', (error: any, result: number) => {
      if (error) {
        console.error('Error getting participation rate:', error);
      } else {
        console.log('Direct DB query result - participation rate:', result);
        setParticipationRate(result);
      }
    });
    
    // Get average engagement score
    Meteor.call('getAverageEngagementScore', (error: any, result: number) => {
      if (error) {
        console.error('Error getting average engagement score:', error);
      } else {
        console.log('Direct DB query result - avg engagement score:', result);
        setAvgEngagementScore(result);
      }
    });
    
    // Get average completion time
    Meteor.call('getAverageCompletionTime', (error: any, result: number) => {
      if (error) {
        console.error('Error getting average completion time:', error);
      } else {
        console.log('Direct DB query result - avg completion time:', result);
        setAvgCompletionTime(result);
      }
      setIsLoading(loading);
    });
  }, [loading]);
  const [filterVisible, setFilterVisible] = useState(true);

  // Sample data
  const sites = ['All Sites', 'Site A', 'Site B', 'Site C'];
  const departments = ['All Departments', 'HR', 'Operations', 'IT', 'Finance'];
  const roles = ['All Roles', 'Manager', 'Individual Contributor', 'Director'];
  const tenures = ['All Tenure', '< 1 year', '1-3 years', '3-5 years', '5+ years'];
  const demographics = ['All Demographics', 'Age Group', 'Gender', 'Location'];

  return (
    <AdminLayout>
      <DashboardContainer>
        <PageHeader>
          <PageTitle>Analytics Dashboard</PageTitle>
          <ActionButtons>
            <Button onClick={() => setFilterVisible(!filterVisible)}>
              <FiFilter />
              {filterVisible ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button primary>
              <FiDownload />
              Export
            </Button>
          </ActionButtons>
        </PageHeader>

        {filterVisible && (
          <FilterBar>
            <FilterGroup>
              <FilterLabel>Site</FilterLabel>
              <Select>
                {sites.map((site) => (
                  <option key={site} value={site}>
                    {site}
                  </option>
                ))}
              </Select>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Department</FilterLabel>
              <Select>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Role Level</FilterLabel>
              <Select>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Tenure</FilterLabel>
              <Select>
                {tenures.map((tenure) => (
                  <option key={tenure} value={tenure}>
                    {tenure}
                  </option>
                ))}
              </Select>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Demographics</FilterLabel>
              <Select>
                {demographics.map((demo) => (
                  <option key={demo} value={demo}>
                    {demo}
                  </option>
                ))}
              </Select>
            </FilterGroup>
            <FilterButtons>
              <Button primary>Apply Filters</Button>
              <Button>Reset</Button>
            </FilterButtons>
          </FilterBar>
        )}

        <TabsContainer>
          <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </Tab>
          <Tab active={activeTab === 'themes'} onClick={() => setActiveTab('themes')}>
            Themes
          </Tab>
          <Tab active={activeTab === 'trends'} onClick={() => setActiveTab('trends')}>
            Trends
          </Tab>
          <Tab active={activeTab === 'insights'} onClick={() => setActiveTab('insights')}>
            Insights
          </Tab>
        </TabsContainer>

        {activeTab === 'overview' && (
          <DashboardGrid>
            {/* KPI Cards */}
            <Card cols={3}>
              <CardHeader>
                <CardTitle>Participation</CardTitle>
                <CardIcon>
                  <FiUsers />
                </CardIcon>
              </CardHeader>
              <StatCard>
                <StatValue>{completedSurveysCount}</StatValue>
                <StatLabel>Surveys Completed</StatLabel>
              </StatCard>
            </Card>

            <Card cols={3}>
              <CardHeader>
                <CardTitle>Completion Rate</CardTitle>
                <CardIcon>
                  <FiPieChart />
                </CardIcon>
              </CardHeader>
              <StatCard>
                <StatValue>{isLoading ? '...' : `${participationRate}%`}</StatValue>
                <StatLabel>Participation Rate</StatLabel>
              </StatCard>
            </Card>

            <Card cols={3}>
              <CardHeader>
                <CardTitle>Avg. Engagement</CardTitle>
                <CardIcon>
                  <FiBarChart2 />
                </CardIcon>
              </CardHeader>
              <StatCard>
                <StatValue>{isLoading ? '...' : avgEngagementScore.toFixed(1)}</StatValue>
                <StatLabel>Out of 5.0</StatLabel>
              </StatCard>
            </Card>

            <Card cols={3}>
              <CardHeader>
                <CardTitle>Time to Complete</CardTitle>
                <CardIcon>
                  <FiCalendar />
                </CardIcon>
              </CardHeader>
              <StatCard>
                <StatValue>{isLoading ? '...' : avgCompletionTime.toFixed(1)}</StatValue>
                <StatLabel>Minutes (Average)</StatLabel>
              </StatCard>
            </Card>

            {/* Theme Breakdown */}
            <Card cols={12}>
              <CardHeader>
                <CardTitle>WPS Zone / Theme Breakdown</CardTitle>
              </CardHeader>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '16px',
                }}
              >
                <ThemeCard>
                  <ThemeName>Safety</ThemeName>
                  <ThemeScore>4.2</ThemeScore>
                  <ThemeLabel>Avg. Score</ThemeLabel>
                </ThemeCard>
                <ThemeCard>
                  <ThemeName>Engagement</ThemeName>
                  <ThemeScore>3.8</ThemeScore>
                  <ThemeLabel>Avg. Score</ThemeLabel>
                </ThemeCard>
                <ThemeCard>
                  <ThemeName>Leadership</ThemeName>
                  <ThemeScore>4.0</ThemeScore>
                  <ThemeLabel>Avg. Score</ThemeLabel>
                </ThemeCard>
                <ThemeCard>
                  <ThemeName>Wellbeing</ThemeName>
                  <ThemeScore>3.6</ThemeScore>
                  <ThemeLabel>Avg. Score</ThemeLabel>
                </ThemeCard>
                <ThemeCard>
                  <ThemeName>Inclusion</ThemeName>
                  <ThemeScore>4.3</ThemeScore>
                  <ThemeLabel>Avg. Score</ThemeLabel>
                </ThemeCard>
              </div>
            </Card>

            {/* Heatmap */}
            <Card cols={6}>
              <CardHeader>
                <CardTitle>Site Performance Heatmap</CardTitle>
              </CardHeader>
              <ChartContainer>
                <div>Heatmap Visualization Coming Soon</div>
              </ChartContainer>
            </Card>

            {/* Trendlines */}
            <Card cols={6}>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardIcon>
                  <FiTrendingUp />
                </CardIcon>
              </CardHeader>
              <ChartContainer>
                <div>Trendline Visualization Coming Soon</div>
              </ChartContainer>
            </Card>

            {/* Open-text Insights */}
            <Card cols={12}>
              <CardHeader>
                <CardTitle>Open-text Insights</CardTitle>
                <CardIcon>
                  <FiMessageSquare />
                </CardIcon>
              </CardHeader>
              <ChartContainer>
                <div>NLP Topic Modeling Coming Soon</div>
              </ChartContainer>
            </Card>

            {/* Export Options */}
            <Card cols={12}>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <ExportButtonsContainer>
                <Button>Export CSV</Button>
                <Button>Export PDF</Button>
                <Button>Power BI</Button>
              </ExportButtonsContainer>
            </Card>
          </DashboardGrid>
        )}

        {activeTab === 'themes' && (
          <DashboardGrid>
            <Card cols={12}>
              <CardHeader>
                <CardTitle>Theme Analysis</CardTitle>
              </CardHeader>
              <ChartContainer>
                <div>Detailed Theme Analysis Coming Soon</div>
              </ChartContainer>
            </Card>
          </DashboardGrid>
        )}

        {activeTab === 'trends' && (
          <DashboardGrid>
            <Card cols={12}>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
              </CardHeader>
              <ChartContainer>
                <div>Detailed Trend Analysis Coming Soon</div>
              </ChartContainer>
            </Card>
          </DashboardGrid>
        )}

        {activeTab === 'insights' && (
          <DashboardGrid>
            <Card cols={12}>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
              </CardHeader>
              <ChartContainer>
                <div>AI-Powered Insights Coming Soon</div>
              </ChartContainer>
            </Card>
          </DashboardGrid>
        )}
      </DashboardContainer>
    </AdminLayout>
  );
};

export default Analytics;

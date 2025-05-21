import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { 
  FaUsers, 
  FaQuestionCircle, 
  FaClipboardList, 
  FaChartBar, 
  FaFileExport, 
  FaEnvelope, 
  FaCalendarAlt, 
  FaFilter, 
  FaInfoCircle,
  FaExclamationTriangle,
  FaBell
} from 'react-icons/fa';
import Countdown from './Countdown';

import { useTracker } from 'meteor/react-meteor-data';
import { useResponses } from '../useResponses';
import { Meteor } from 'meteor/meteor';
import { IconType } from 'react-icons';

import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const DashboardBg = styled.div`
  background: #fafafa;
  min-height: 100vh;
  padding: 1.5rem 2rem 4rem 2rem;
  font-family: 'Inter', sans-serif;
`;

const GoldHeaderCard = styled.div`
  background: #b7a36a;
  border-radius: 12px;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5rem 2rem;
  margin: 0 0 1.5rem 0;
  width: 100%;
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
    background: #b7a36a;
    border-color: #b7a36a;
    color: white;
    
    &:hover {
      background: #a08e54;
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
  color: #b7a36a;
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
  color: #b7a36a;
  font-weight: 600;
`;
const TrendFill = styled.div<{ width: number; color?: string }>`
  height: 14px;
  background: #b7a36a;
  border-radius: 8px;
  margin: 0 12px 0 0;
  width: ${({ width }) => width}%;
`;
const TrendValue = styled.div`
  width: 60px;
  font-weight: 700;
  color: #444;
`;

// Type for filter state
interface DashboardFilters {
  site: string;
  department: string;
  role: string;
  survey: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  // Dynamically import the Questions and Surveys collections for client-side use
  const [QuestionsCollection, setQuestionsCollection] = useState<any>(null);
  const [SurveysCollection, setSurveysCollection] = useState<any>(null);
  
  // Filter state
  const [filters, setFilters] = useState<DashboardFilters>({
    site: 'all',
    department: 'all',
    role: 'all',
    survey: 'all'
  });
  
  // Anonymity warning state
  const [showAnonymityWarning, setShowAnonymityWarning] = useState(false);
  
  // Check if responses for current filter are below the anonymity threshold
  useEffect(() => {
    // This would be a real check against response counts for the selected filters
    // For demo, we'll toggle based on role filter
    setShowAnonymityWarning(filters.role === 'analyst' || filters.department === 'hr');
  }, [filters]);

  useEffect(() => {
    import('../../api/questions').then(mod => {
      setQuestionsCollection(mod.Questions);
    });
    import('../../api/surveys').then(mod => {
      setSurveysCollection(mod.Surveys);
    });
  }, []);

  // Fetch questions from MongoDB (if available)
  const questions = useTracker(() => {
    if (!QuestionsCollection) return [];
    Meteor.subscribe('questions.all');
    return QuestionsCollection.find().fetch();
  }, [QuestionsCollection]);

  // Fetch surveys from MongoDB (if available)
  const surveys = useTracker(() => {
    if (!SurveysCollection) return [];
    Meteor.subscribe('surveys.all');
    return SurveysCollection.find().fetch();
  }, [SurveysCollection]);

  // Filter for active vs all surveys
  const activeSurveys = surveys.filter((s: any) => 
    // In a real implementation, check survey.isActive or startDate/endDate
    true // Placeholder - all surveys are considered active for now
  );

  // Count total questions and unique participants/responses
  const totalQuestions = questions.length;
  const responses = useResponses();

  // Dynamic stats
  const totalResponses = responses.length;
  const completedResponses = responses.filter(r => r.completed).length;
  const pendingResponses = totalResponses - completedResponses;
  const uniqueParticipants = new Set(responses.map(r => r.userId)).size;

  const stats = [
    { label: 'Total Surveys', value: surveys.length, icon: FaClipboardList, link: '/admin/surveys/all' },
    { label: 'Active Surveys', value: activeSurveys.length, icon: FaCalendarAlt, link: '/admin/surveys/all' },
    { label: 'Question Bank', value: totalQuestions, icon: FaQuestionCircle, link: '/admin/questions/all' },
    { label: 'Participants', value: uniqueParticipants, icon: FaUsers, link: '/admin/analytics' },
  ];

  // Participation percentage
  const participationPct = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

  // Response data by site
  const siteData = [
    { name: 'Rainy River', value: 70, color: '#7ec16c' },
    { name: 'New Afton', value: 55, color: '#f7ca51' },
    { name: 'Corporate', value: 40, color: '#f28b63' },
    { name: 'Other', value: 0, color: '#dddddd' }
  ];

  // Heat map data - Themes x Recent Surveys
  const heatMapData = [
    { theme: 'Engagement', surveyScores: [4.2, 3.9, 4.1] },
    { theme: 'Manager Relations', surveyScores: [3.7, 2.9, 3.1] },
    { theme: 'Team Dynamics', surveyScores: [4.5, 4.3, 4.2] },
    { theme: 'Communication', surveyScores: [3.5, 4.1, 3.7] },
    { theme: 'Recognition', surveyScores: [3.1, 3.0, 3.4] },
    { theme: 'Work-Life Balance', surveyScores: [2.8, 2.7, 3.2] },
  ];

  // Flagged issues - based on threshold crossings
  const flaggedIssues = [
    { id: 1, text: 'Communication score dropped from 4.1 → 3.5', severity: 'high' as const },
    { id: 2, text: 'Leadership Trust fell below threshold: 2.9', severity: 'high' as const },
    { id: 3, text: 'Team Collaboration declined by 12% since last survey', severity: 'medium' as const },
    { id: 4, text: 'Work-Life Balance flagged in multiple sites', severity: 'medium' as const },
    { id: 5, text: 'Manager Feedback score critically low at 2.5', severity: 'low' as const }
  ];

  // Handle filter change
  const handleFilterChange = (filterName: keyof DashboardFilters) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: e.target.value
    }));
  };

  return (
    <AdminLayout>
      <DashboardBg>
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
            <option value="all">All Sites</option>
            <option value="rainy-river">Rainy River</option>
            <option value="new-afton">New Afton</option>
            <option value="corporate">Corporate</option>
          </FilterSelect>
          
          <FilterSelect value={filters.department} onChange={handleFilterChange('department')}>
            <option value="all">All Departments</option>
            <option value="engineering">Engineering</option>
            <option value="operations">Operations</option>
            <option value="hr">Human Resources</option>
            <option value="finance">Finance</option>
          </FilterSelect>
          
          <FilterSelect value={filters.role} onChange={handleFilterChange('role')}>
            <option value="all">All Roles</option>
            <option value="manager">Managers</option>
            <option value="supervisor">Supervisors</option>
            <option value="engineer">Engineers</option>
            <option value="analyst">Analysts</option>
          </FilterSelect>
          
          <FilterSelect value={filters.survey} onChange={handleFilterChange('survey')}>
            <option value="all">Current Survey</option>
            <option value="q1-2025">Q1 2025</option>
            <option value="q4-2024">Q4 2024</option>
            <option value="q3-2024">Q3 2024</option>
          </FilterSelect>
        </FilterBar>
        
        {/* Anonymity Alert */}
        {showAnonymityWarning && (
          <AnonymityAlert>
            <FaExclamationTriangle />
            <div>Anonymity Warning: This filter selection contains fewer than 5 responses. Data has been hidden to protect employee privacy.</div>
          </AnonymityAlert>
        )}
        
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {stats.map((stat) => (
            <Card key={stat.label} onClick={() => navigate(stat.link)} style={{ cursor: 'pointer' }}>
              <KpiCard>
                <KpiIcon>
                  <stat.icon size={24} />
                </KpiIcon>
                <div>
                  <MetricValue>{stat.value}</MetricValue>
                  <MetricLabel>{stat.label}</MetricLabel>
                </div>
              </KpiCard>
            </Card>
          ))}
        </div>
        
        <MainGrid>
          {/* Survey Participation */}
          <QuarterWidthCard>
            <SectionTitle>
              <FaChartBar size={14} /> Survey Participation
            </SectionTitle>
            <div style={{ fontSize: '0.875rem', color: '#6c6c6c', marginBottom: '1rem' }}>
              Quickly see how many participants have completed the survey.
            </div>
            
            <DonutChart>
              <svg viewBox="0 0 36 36" style={{ width: '140px', height: '140px' }}>
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f5f5f5"
                  strokeWidth="3.6"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#7ec16c"
                  strokeWidth="3.8"
                  strokeDasharray={`${participationPct}, 100`}
                  strokeLinecap="round"
                />
                <text x="18" y="18" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1c1c1c">
                  {participationPct}%
                </text>
                <text x="18" y="22" textAnchor="middle" fontSize="4" fill="#6c6c6c">
                  COMPLETED
                </text>
              </svg>
            </DonutChart>
            
            <DonutLegend>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 10, height: 10, background: '#7ec16c', borderRadius: 2 }} />
                <div>COMPLETED</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 10, height: 10, background: '#f5f5f5', borderRadius: 2 }} />
                <div>PENDING</div>
              </div>
            </DonutLegend>
          </QuarterWidthCard>
          
          {/* Responses by Site */}
          <HalfWidthCard>
            <SectionTitle>
              <FaChartBar size={14} /> Responses by Site
            </SectionTitle>
            <div style={{ fontSize: '0.875rem', color: '#6c6c6c', marginBottom: '1rem' }}>
              Breakdown of total responses received from each site or department to help monitor participation across locations.
            </div>
            
            <div style={{ fontWeight: 600, color: '#1c1c1c', marginBottom: '0.75rem' }}>
              TOTAL RESPONSES: 165
            </div>
            
            <BarChart>
              {siteData.map((site) => (
                <BarBar key={site.name}>
                  <BarLabel>{site.name}</BarLabel>
                  <div style={{ 
                    height: '14px', 
                    width: `${site.value * 2}px`, 
                    background: site.color,
                    borderRadius: '7px'
                  }} />
                  <div style={{ marginLeft: '10px', fontSize: '0.875rem', fontWeight: 600, color: '#1c1c1c' }}>
                    {site.value}
                  </div>
                </BarBar>
              ))}
            </BarChart>
            
            <div style={{ fontSize: '0.8rem', color: '#6c6c6c', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaInfoCircle size={12} />
                <span>Total invitations sent: 218</span>
              </div>
            </div>
          </HalfWidthCard>
          
          {/* Flagged Issues */}
          <QuarterWidthCard>
            <SectionTitle>
              <FaExclamationTriangle size={14} color="#e74c3c" /> Flagged Issues
            </SectionTitle>
            
            <FlaggedList>
              {flaggedIssues.map(issue => (
                <FlaggedItem key={issue.id} severity={issue.severity}>
                  {issue.text}
                </FlaggedItem>
              ))}
              <FlaggedItem color="#f06292"><span>❗</span> Work-Life Balance flagged in multiple sites</FlaggedItem>
              <FlaggedItem color="#ff9800"><span>⚠️</span> Manager Feedback score critically low at 2.5</FlaggedItem>
            </FlaggedList>
          </QuarterWidthCard>
          <QuarterWidthCard>
            <SectionTitle>Engagement Score Trend</SectionTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#666', fontSize: 15 }}>Track how employee engagement has changed over recent surveys.</div>
              <div style={{ fontWeight: 700, color: '#444' }}>AVERAGE: 4/5</div>
            </div>

            <TrendBar>
              {(() => {
                const data = [
                  { month: 'Sep', score: 4.2 },
                  { month: 'Jun', score: 4.0 },
                  { month: 'Mar', score: 3.6 },
                ];
                return data.map((d, i) => {
                  return (
                    <TrendRow key={i}>
                      <TrendLabel>{d.month}</TrendLabel>
                      <TrendFill width={d.score * 20} />
                      <TrendValue>{d.score}/5</TrendValue>
                    </TrendRow>
                  );
                });
              })()}
            </TrendBar>
          </QuarterWidthCard>
          {/* Heat Map */}
          <HalfWidthCard>
            <SectionTitle>
              <FaChartBar size={14} /> Engagement Score Heat Map
            </SectionTitle>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center', 
              marginBottom: '0.75rem' 
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6c6c6c' }}>
                Track how employee engagement has changed over recent surveys with a quick view of average scores and trends.
              </div>
              <div style={{ fontWeight: 600, color: '#1c1c1c' }}>
                AVERAGE: 4/5
              </div>
            </div>
            
            <HeatMapGrid>
              <HeatMapHeader style={{ background: 'transparent' }}></HeatMapHeader>
              <HeatMapHeader>JAN '25</HeatMapHeader>
              <HeatMapHeader>SEP '24</HeatMapHeader>
              <HeatMapHeader>MAY '24</HeatMapHeader>
              
              {heatMapData.map((row, index) => (
                <HeatMapRow key={index}>
                  <HeatMapLabel>{row.theme}</HeatMapLabel>
                  {row.surveyScores.map((score, i) => (
                    <HeatMapCell key={i} score={score}>
                      {score.toFixed(1)}
                    </HeatMapCell>
                  ))}
                </HeatMapRow>
              ))}
            </HeatMapGrid>
          </HalfWidthCard>
          
          {/* Recent Activity */}
          <HalfWidthCard>
            <SectionTitle>
              <FaBell size={14} /> Recent Activity
            </SectionTitle>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { time: '2 hours ago', action: 'Jane Smith created a new survey: "Q2 Employee Feedback"' },
                { time: '5 hours ago', action: 'John Davis exported survey results for "Leadership Assessment"' },
                { time: 'Yesterday', action: 'Admin sent 45 new invitations to Operations department' },
                { time: '2 days ago', action: 'Survey threshold alert: Communication score below target' },
                { time: '3 days ago', action: 'Mike Johnson added 3 new questions to the Question Bank' }
              ].map((activity, index) => (
                <div key={index} style={{ 
                  padding: '0.75rem', 
                  borderLeft: '3px solid #f0f0f0',
                  background: '#f9f9f9',
                  borderRadius: '4px'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#6c6c6c', marginBottom: '0.25rem' }}>
                    {activity.time}
                  </div>
                  <div style={{ fontSize: '0.875rem' }}>
                    {activity.action}
                  </div>
                </div>
              ))}
            </div>
          </HalfWidthCard>
        </MainGrid>
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

import React, { memo } from 'react';
import styled from 'styled-components';
import { 
  FaChartBar, 
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import { 
  SiteData, 
  HeatMapData, 
  FlaggedIssue, 
  TrendData,
  KpiStat,
  ActivityItem
} from '../../hooks/useDashboardData';

// Styled components for dashboard elements
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

const QuarterWidthCard = styled(Card)`
  grid-column: span 3;
  
  @media (max-width: 768px) {
    grid-column: span 12;
  }
`;

const HalfWidthCard = styled(Card)`
  grid-column: span 6;
  
  @media (max-width: 768px) {
    grid-column: span 12;
  }
`;

const DonutChart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
`;

const DonutLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6c6c6c;
  margin-top: 0.5rem;
`;

const BarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const BarBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BarLabel = styled.div`
  width: 100px;
  font-size: 0.875rem;
  color: #6c6c6c;
`;

const FlaggedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FlaggedItem = styled.div<{ severity?: 'high' | 'medium' | 'low', color?: string }>`
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  background: ${p => {
    if (p.color) return p.color + '15';
    if (p.severity === 'high') return '#f8d7da';
    if (p.severity === 'medium') return '#fff3cd';
    return '#d1ecf1';
  }};
  color: ${p => {
    if (p.color) return p.color;
    if (p.severity === 'high') return '#721c24';
    if (p.severity === 'medium') return '#856404';
    return '#0c5460';
  }};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TrendBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const TrendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TrendLabel = styled.div`
  width: 40px;
  font-size: 0.875rem;
  color: #6c6c6c;
`;

const TrendFill = styled.div<{ width: number }>`
  height: 14px;
  background: linear-gradient(90deg, #7ec16c 0%, #f7ca51 100%);
  border-radius: 7px;
  width: ${p => p.width}%;
`;

const TrendValue = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1c1c1c;
  margin-left: 0.5rem;
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

const HeatMapGrid = styled.div`
  display: grid;
  grid-template-columns: 160px repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
`;

const HeatMapHeader = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c6c6c;
  padding: 0.5rem;
  text-align: center;
`;

const HeatMapTheme = styled.div`
  font-size: 0.875rem;
  color: #1c1c1c;
  padding: 0.5rem;
`;

const HeatMapCell = styled.div<{ score: number }>`
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  color: ${p => p.score >= 4 ? '#fff' : p.score >= 3 ? '#1c1c1c' : '#fff'};
  background: ${p => {
    if (p.score >= 4.5) return '#27ae60';
    if (p.score >= 4) return '#7ec16c';
    if (p.score >= 3.5) return '#f7ca51';
    if (p.score >= 3) return '#f28b63';
    return '#e74c3c';
  }};
  border-radius: 4px;
`;

// Memoized components to prevent unnecessary re-renders

export const KpiStatsGrid = memo(({ stats, onCardClick }: { 
  stats: KpiStat[],
  onCardClick: (link: string) => void
}) => {
  // Map icon strings to actual components
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'FaClipboardList': return <FaChartBar size={24} />;
      case 'FaCalendarAlt': return <FaChartBar size={24} />;
      case 'FaQuestionCircle': return <FaChartBar size={24} />;
      case 'FaUsers': return <FaChartBar size={24} />;
      default: return <FaChartBar size={24} />;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {stats.map((stat) => (
        <Card key={stat.label} onClick={() => onCardClick(stat.link)} style={{ cursor: 'pointer' }}>
          <KpiCard>
            <KpiIcon>
              {getIconComponent(stat.icon)}
            </KpiIcon>
            <div>
              <MetricValue>{stat.value}</MetricValue>
              <MetricLabel>{stat.label}</MetricLabel>
            </div>
          </KpiCard>
        </Card>
      ))}
    </div>
  );
});

export const ParticipationDonut = memo(({ participationPct }: { participationPct: number }) => {
  return (
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
  );
});

export const SiteResponsesChart = memo(({ siteData, totalResponses }: { 
  siteData: SiteData[],
  totalResponses: number
}) => {
  return (
    <HalfWidthCard>
      <SectionTitle>
        <FaChartBar size={14} /> Responses by Site
      </SectionTitle>
      <div style={{ fontSize: '0.875rem', color: '#6c6c6c', marginBottom: '1rem' }}>
        Breakdown of total responses received from each site or department to help monitor participation across locations.
      </div>
      
      <div style={{ fontWeight: 600, color: '#1c1c1c', marginBottom: '0.75rem' }}>
        TOTAL RESPONSES: {totalResponses}
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
  );
});

export const FlaggedIssuesList = memo(({ flaggedIssues }: { flaggedIssues: FlaggedIssue[] }) => {
  return (
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
      </FlaggedList>
    </QuarterWidthCard>
  );
});

export const TrendChart = memo(({ trendData }: { trendData: TrendData[] }) => {
  return (
    <QuarterWidthCard>
      <SectionTitle>Engagement Score Trend</SectionTitle>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#666', fontSize: 15 }}>Track how employee engagement has changed over recent surveys.</div>
        <div style={{ fontWeight: 700, color: '#444' }}>AVERAGE: 4/5</div>
      </div>

      <TrendBar>
        {trendData.map((d, i) => (
          <TrendRow key={i}>
            <TrendLabel>{d.month}</TrendLabel>
            <TrendFill width={d.score * 20} />
            <TrendValue>{d.score}/5</TrendValue>
          </TrendRow>
        ))}
      </TrendBar>
    </QuarterWidthCard>
  );
});

export const HeatMapChart = memo(({ heatMapData }: { heatMapData: HeatMapData[] }) => {
  return (
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
          Compare engagement scores across different themes and recent surveys.
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6c6c6c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>SCALE:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <div style={{ width: 12, height: 12, background: '#e74c3c', borderRadius: 2 }}></div>
            <div style={{ width: 12, height: 12, background: '#f28b63', borderRadius: 2 }}></div>
            <div style={{ width: 12, height: 12, background: '#f7ca51', borderRadius: 2 }}></div>
            <div style={{ width: 12, height: 12, background: '#7ec16c', borderRadius: 2 }}></div>
            <div style={{ width: 12, height: 12, background: '#27ae60', borderRadius: 2 }}></div>
          </div>
          <span>1-5</span>
        </div>
      </div>
      
      <HeatMapGrid>
        <HeatMapHeader>Theme</HeatMapHeader>
        <HeatMapHeader>Sep Survey</HeatMapHeader>
        <HeatMapHeader>Jun Survey</HeatMapHeader>
        <HeatMapHeader>Mar Survey</HeatMapHeader>
        
        {heatMapData.map((row, i) => (
          <React.Fragment key={i}>
            <HeatMapTheme>{row.theme}</HeatMapTheme>
            {row.surveyScores.map((score, j) => (
              <HeatMapCell key={j} score={score}>
                {score.toFixed(1)}
              </HeatMapCell>
            ))}
          </React.Fragment>
        ))}
      </HeatMapGrid>
    </HalfWidthCard>
  );
});

export const AnonymityAlert = styled.div`
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #856404;
  font-size: 0.875rem;
  
  svg {
    color: #856404;
    flex-shrink: 0;
  }
`;

// Activity List Component
const ActivityListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const ActivityRow = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  border-radius: 6px;
  background: #f8f9fa;
  
  &:hover {
    background: #f1f3f5;
  }
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: #6c6c6c;
  margin-bottom: 0.25rem;
`;

const ActivityAction = styled.div`
  font-size: 0.875rem;
  color: #333;
`;

// Memoized ActivityList component to prevent unnecessary re-renders
export const ActivityList = memo(({ activities }: { activities: ActivityItem[] }) => {
  return (
    <ActivityListContainer>
      {activities.map((activity, index) => (
        <ActivityRow key={index}>
          <ActivityTime>{activity.time}</ActivityTime>
          <ActivityAction>{activity.action}</ActivityAction>
        </ActivityRow>
      ))}
    </ActivityListContainer>
  );
});

import React from 'react';
import styled from 'styled-components';
import { FiClock, FiUsers, FiCheckCircle, FiBarChart2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

// Styled components
const Container = styled.div`
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const MetricCard = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f9f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #552a47;
`;

const MetricTitle = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin: 0;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #28211e;
  margin-bottom: 8px;
`;

const MetricTrend = styled.div<{ positive?: boolean; neutral?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => {
    if (props.positive) return '#2ecc71';
    if (props.neutral) return '#666';
    return '#e74c3c';
  }};
`;

const ChartContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const ChartControls = styled.div`
  display: flex;
  gap: 8px;
`;

const ChartControl = styled.button<{ active?: boolean }>`
  background: ${props => props.active ? '#f9f4f8' : 'transparent'};
  border: 1px solid ${props => props.active ? '#552a47' : '#ddd'};
  color: ${props => props.active ? '#552a47' : '#666'};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    border-color: #552a47;
  }
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9f9f9;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
`;

const TableContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const TableTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: #f9f4f8;
  
  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 14px;
    font-weight: 600;
    color: #552a47;
    border-bottom: 1px solid #e5d6c7;
  }
`;

const TableBody = styled.tbody`
  tr {
    &:hover {
      background: #f9f9f9;
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid #f0f0f0;
    }
  }
  
  td {
    padding: 12px 16px;
    font-size: 14px;
    color: #333;
  }
`;

const CompletionBadge = styled.div<{ percent: number }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    if (props.percent >= 100) return 'rgba(46, 204, 113, 0.1)';
    if (props.percent >= 50) return 'rgba(243, 156, 18, 0.1)';
    return 'rgba(231, 76, 60, 0.1)';
  }};
  color: ${props => {
    if (props.percent >= 100) return '#2ecc71';
    if (props.percent >= 50) return '#f39c12';
    return '#e74c3c';
  }};
`;

// Interface for section analytics data
export interface SectionAnalyticsData {
  sectionId: string;
  sectionName: string;
  completionRate: number;
  averageTimeSpent: number;
  responseCount: number;
  skippedCount: number;
  trendCompletionRate: number;
  trendTimeSpent: number;
  questionAnalytics: {
    questionId: string;
    questionText: string;
    completionRate: number;
    averageTimeSpent: number;
    responseDistribution?: {
      label: string;
      value: number;
    }[];
  }[];
}

interface SectionAnalyticsProps {
  sectionId: string;
  data?: SectionAnalyticsData;
  isLoading?: boolean;
}

const SectionAnalytics: React.FC<SectionAnalyticsProps> = ({
  sectionId,
  data,
  isLoading = false
}) => {
  // Mock data for demonstration
  const mockData: SectionAnalyticsData = data || {
    sectionId,
    sectionName: 'Employee Engagement',
    completionRate: 78,
    averageTimeSpent: 145,
    responseCount: 127,
    skippedCount: 23,
    trendCompletionRate: 5.2,
    trendTimeSpent: -8.3,
    questionAnalytics: [
      {
        questionId: 'q1',
        questionText: 'How satisfied are you with your current role?',
        completionRate: 92,
        averageTimeSpent: 18,
        responseDistribution: [
          { label: 'Very Satisfied', value: 42 },
          { label: 'Satisfied', value: 35 },
          { label: 'Neutral', value: 15 },
          { label: 'Dissatisfied', value: 5 },
          { label: 'Very Dissatisfied', value: 3 }
        ]
      },
      {
        questionId: 'q2',
        questionText: 'Do you feel your work is valued by your manager?',
        completionRate: 88,
        averageTimeSpent: 15,
        responseDistribution: [
          { label: 'Strongly Agree', value: 38 },
          { label: 'Agree', value: 32 },
          { label: 'Neutral', value: 18 },
          { label: 'Disagree', value: 8 },
          { label: 'Strongly Disagree', value: 4 }
        ]
      },
      {
        questionId: 'q3',
        questionText: 'How likely are you to recommend our company as a place to work?',
        completionRate: 95,
        averageTimeSpent: 22,
        responseDistribution: [
          { label: 'Very Likely', value: 45 },
          { label: 'Likely', value: 30 },
          { label: 'Neutral', value: 15 },
          { label: 'Unlikely', value: 7 },
          { label: 'Very Unlikely', value: 3 }
        ]
      }
    ]
  };
  
  // Format time from seconds to minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  if (isLoading) {
    return (
      <Container>
        <Header>
          <Title>Section Analytics</Title>
        </Header>
        <div>Loading analytics data...</div>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title>Analytics for {mockData.sectionName}</Title>
      </Header>
      
      {/* Key Metrics */}
      <MetricsGrid>
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <FiCheckCircle size={20} />
            </MetricIcon>
            <MetricTitle>Completion Rate</MetricTitle>
          </MetricHeader>
          <MetricValue>{mockData.completionRate}%</MetricValue>
          <MetricTrend positive={mockData.trendCompletionRate > 0} neutral={mockData.trendCompletionRate === 0}>
            {mockData.trendCompletionRate > 0 ? (
              <FiTrendingUp size={14} />
            ) : mockData.trendCompletionRate < 0 ? (
              <FiTrendingDown size={14} />
            ) : null}
            {mockData.trendCompletionRate > 0 ? '+' : ''}{mockData.trendCompletionRate}% from previous period
          </MetricTrend>
        </MetricCard>
        
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <FiClock size={20} />
            </MetricIcon>
            <MetricTitle>Average Time Spent</MetricTitle>
          </MetricHeader>
          <MetricValue>{formatTime(mockData.averageTimeSpent)}</MetricValue>
          <MetricTrend positive={mockData.trendTimeSpent < 0} neutral={mockData.trendTimeSpent === 0}>
            {mockData.trendTimeSpent < 0 ? (
              <FiTrendingUp size={14} />
            ) : mockData.trendTimeSpent > 0 ? (
              <FiTrendingDown size={14} />
            ) : null}
            {mockData.trendTimeSpent > 0 ? '+' : ''}{mockData.trendTimeSpent}% from previous period
          </MetricTrend>
        </MetricCard>
        
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <FiUsers size={20} />
            </MetricIcon>
            <MetricTitle>Total Responses</MetricTitle>
          </MetricHeader>
          <MetricValue>{mockData.responseCount}</MetricValue>
          <MetricTrend neutral>
            {mockData.skippedCount} skipped this section
          </MetricTrend>
        </MetricCard>
        
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <FiBarChart2 size={20} />
            </MetricIcon>
            <MetricTitle>Question Completion</MetricTitle>
          </MetricHeader>
          <MetricValue>
            {Math.round(
              mockData.questionAnalytics.reduce((sum, q) => sum + q.completionRate, 0) / 
              mockData.questionAnalytics.length
            )}%
          </MetricValue>
          <MetricTrend neutral>
            Across {mockData.questionAnalytics.length} questions
          </MetricTrend>
        </MetricCard>
      </MetricsGrid>
      
      {/* Response Distribution Chart */}
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>Response Distribution</ChartTitle>
          <ChartControls>
            <ChartControl active>Last 7 days</ChartControl>
            <ChartControl>Last 30 days</ChartControl>
            <ChartControl>All time</ChartControl>
          </ChartControls>
        </ChartHeader>
        <ChartPlaceholder>
          Chart visualization would be rendered here with actual data
        </ChartPlaceholder>
      </ChartContainer>
      
      {/* Question Analytics Table */}
      <TableContainer>
        <TableHeader>
          <TableTitle>Question Performance</TableTitle>
        </TableHeader>
        <Table>
          <TableHead>
            <tr>
              <th>Question</th>
              <th>Completion</th>
              <th>Avg. Time</th>
            </tr>
          </TableHead>
          <TableBody>
            {mockData.questionAnalytics.map(question => (
              <tr key={question.questionId}>
                <td>{question.questionText}</td>
                <td>
                  <CompletionBadge percent={question.completionRate}>
                    {question.completionRate}%
                  </CompletionBadge>
                </td>
                <td>{formatTime(question.averageTimeSpent)}</td>
              </tr>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default SectionAnalytics;

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiBarChart2, FiClock, FiUsers, FiCheckSquare, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import { SurveySectionItem } from './SurveySections';

// Styled components for the analytics UI
const Container = styled.div`
  margin-bottom: 24px;
`;

const Header = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin-bottom: 16px;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #fff;
  border: 1px solid #e5d6c7;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #552a47;
    box-shadow: 0 2px 8px rgba(85, 42, 71, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const StatTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin: 0;
`;

const StatIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #f9f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #552a47;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #28211e;
  margin-bottom: 4px;
`;

const StatDescription = styled.div`
  font-size: 13px;
  color: #888;
`;

const SectionAnalyticsContainer = styled.div`
  margin-bottom: 24px;
`;

const SectionAnalyticsHeader = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #552a47;
  margin-bottom: 12px;
`;

const SectionAnalyticsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 12px 16px;
  background: #f9f4f8;
  border-bottom: 1px solid #e5d6c7;
  font-weight: 600;
  color: #552a47;
  font-size: 14px;
`;

const TableCell = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #e5d6c7;
  font-size: 14px;
  color: #333;
`;

const ProgressBar = styled.div<{ progress: number; color?: string }>`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: ${props => props.color || '#552a47'};
    transition: width 0.3s ease;
  }
`;

const ChartContainer = styled.div`
  height: 300px;
  margin-bottom: 24px;
  border: 1px solid #e5d6c7;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
`;

// Types for analytics data
export interface SectionAnalytics {
  sectionId: string;
  sectionName: string;
  completionRate: number;
  averageTimeSpent: number; // in seconds
  responseCount: number;
  color?: string;
}

export interface SurveyAnalyticsData {
  totalResponses: number;
  completionRate: number;
  averageTimeSpent: number; // in seconds
  sectionAnalytics: SectionAnalytics[];
  responseOverTime: {
    date: string;
    count: number;
  }[];
  deviceBreakdown: {
    device: string;
    count: number;
  }[];
}

interface SurveyAnalyticsProps {
  surveyId: string;
  sections: SurveySectionItem[];
  analyticsData?: SurveyAnalyticsData;
  isLoading?: boolean;
}

const SurveyAnalytics: React.FC<SurveyAnalyticsProps> = ({
  surveyId,
  sections,
  analyticsData,
  isLoading = false
}) => {
  // Generate mock data if real data is not provided
  const [data, setData] = useState<SurveyAnalyticsData>({
    totalResponses: 0,
    completionRate: 0,
    averageTimeSpent: 0,
    sectionAnalytics: [],
    responseOverTime: [],
    deviceBreakdown: []
  });
  
  useEffect(() => {
    if (analyticsData) {
      setData(analyticsData);
    } else {
      // Generate mock data for demonstration
      const mockSectionAnalytics = sections.map(section => ({
        sectionId: section.id,
        sectionName: section.name,
        completionRate: Math.floor(Math.random() * 100),
        averageTimeSpent: Math.floor(Math.random() * 300),
        responseCount: Math.floor(Math.random() * 100),
        color: section.color
      }));
      
      const mockResponseOverTime = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 20)
        };
      }).reverse();
      
      const mockDeviceBreakdown = [
        { device: 'Desktop', count: Math.floor(Math.random() * 100) },
        { device: 'Mobile', count: Math.floor(Math.random() * 100) },
        { device: 'Tablet', count: Math.floor(Math.random() * 50) }
      ];
      
      setData({
        totalResponses: mockSectionAnalytics.reduce((acc, section) => acc + section.responseCount, 0),
        completionRate: Math.floor(Math.random() * 100),
        averageTimeSpent: Math.floor(Math.random() * 600),
        sectionAnalytics: mockSectionAnalytics,
        responseOverTime: mockResponseOverTime,
        deviceBreakdown: mockDeviceBreakdown
      });
    }
  }, [analyticsData, sections]);
  
  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  if (isLoading) {
    return (
      <Container>
        <Header>Survey Analytics</Header>
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          Loading analytics data...
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>Survey Analytics</Header>
      
      {/* Overview Stats */}
      <AnalyticsGrid>
        <StatCard>
          <StatHeader>
            <StatTitle>Total Responses</StatTitle>
            <StatIcon>
              <FiUsers size={18} />
            </StatIcon>
          </StatHeader>
          <StatValue>{data.totalResponses}</StatValue>
          <StatDescription>Total number of survey responses</StatDescription>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <StatTitle>Completion Rate</StatTitle>
            <StatIcon>
              <FiCheckSquare size={18} />
            </StatIcon>
          </StatHeader>
          <StatValue>{data.completionRate}%</StatValue>
          <StatDescription>Percentage of surveys completed</StatDescription>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <StatTitle>Average Time</StatTitle>
            <StatIcon>
              <FiClock size={18} />
            </StatIcon>
          </StatHeader>
          <StatValue>{formatTime(data.averageTimeSpent)}</StatValue>
          <StatDescription>Average time to complete the survey</StatDescription>
        </StatCard>
      </AnalyticsGrid>
      
      {/* Section Analytics */}
      <SectionAnalyticsContainer>
        <SectionAnalyticsHeader>Section Performance</SectionAnalyticsHeader>
        
        <SectionAnalyticsTable>
          <thead>
            <tr>
              <TableHeader>Section</TableHeader>
              <TableHeader>Responses</TableHeader>
              <TableHeader>Completion Rate</TableHeader>
              <TableHeader>Avg. Time</TableHeader>
              <TableHeader>Progress</TableHeader>
            </tr>
          </thead>
          <tbody>
            {data.sectionAnalytics.map(section => (
              <tr key={section.sectionId}>
                <TableCell>{section.sectionName}</TableCell>
                <TableCell>{section.responseCount}</TableCell>
                <TableCell>{section.completionRate}%</TableCell>
                <TableCell>{formatTime(section.averageTimeSpent)}</TableCell>
                <TableCell style={{ width: '20%' }}>
                  <ProgressBar progress={section.completionRate} color={section.color} />
                </TableCell>
              </tr>
            ))}
          </tbody>
        </SectionAnalyticsTable>
      </SectionAnalyticsContainer>
      
      {/* Response Trends */}
      <SectionAnalyticsContainer>
        <SectionAnalyticsHeader>Response Trends</SectionAnalyticsHeader>
        
        <ChartContainer>
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <FiTrendingUp size={48} style={{ marginBottom: 16, color: '#552a47' }} />
              <p>Response trend visualization would appear here.</p>
              <p style={{ fontSize: 14 }}>This would show responses over time and identify patterns.</p>
            </div>
          </div>
        </ChartContainer>
      </SectionAnalyticsContainer>
      
      {/* Device Breakdown */}
      <SectionAnalyticsContainer>
        <SectionAnalyticsHeader>Device Breakdown</SectionAnalyticsHeader>
        
        <ChartContainer>
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <FiPieChart size={48} style={{ marginBottom: 16, color: '#552a47' }} />
              <p>Device breakdown visualization would appear here.</p>
              <p style={{ fontSize: 14 }}>This would show the distribution of devices used to complete the survey.</p>
            </div>
          </div>
        </ChartContainer>
      </SectionAnalyticsContainer>
    </Container>
  );
};

export default SurveyAnalytics;

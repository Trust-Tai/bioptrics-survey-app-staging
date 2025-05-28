import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiBarChart2, FiDownload, FiFilter, FiCalendar, FiUsers } from 'react-icons/fi';
import { SurveySectionItem } from './SurveySections';

// Styled components for the analytics UI
const Container = styled.div`
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    border-color: #552a47;
    background: #f9f4f8;
  }
  
  svg {
    color: #552a47;
  }
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  background: #f9f4f8;
  padding: 12px;
  border-radius: 6px;
`;

const FilterLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #552a47;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const DateRangePicker = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
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

const ChartContainer = styled.div`
  height: 300px;
  margin-bottom: 24px;
  border: 1px solid #e5d6c7;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
`;

const SectionResponseTable = styled.table`
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

// Types for analytics data
export interface SectionResponseData {
  sectionId: string;
  sectionName: string;
  responseCount: number;
  completionRate: number;
  averageTimeSpent: number; // in seconds
  color?: string;
}

export interface QuestionResponseData {
  questionId: string;
  questionText: string;
  responseCount: number;
  averageScore?: number;
  distribution?: Record<string, number>;
}

export interface SurveyResponseAnalyticsData {
  totalResponses: number;
  completionRate: number;
  averageTimeSpent: number; // in seconds
  responsesByDate: {
    date: string;
    count: number;
  }[];
  sectionResponses: SectionResponseData[];
  questionResponses: QuestionResponseData[];
  demographicBreakdown?: {
    category: string;
    distribution: Record<string, number>;
  }[];
}

interface SurveyResponseAnalyticsProps {
  surveyId: string;
  sections: SurveySectionItem[];
  analyticsData?: SurveyResponseAnalyticsData;
  isLoading?: boolean;
}

const SurveyResponseAnalytics: React.FC<SurveyResponseAnalyticsProps> = ({
  surveyId,
  sections,
  analyticsData,
  isLoading = false
}) => {
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [data, setData] = useState<SurveyResponseAnalyticsData | null>(null);
  
  useEffect(() => {
    if (analyticsData) {
      setData(analyticsData);
    } else {
      // Generate mock data for demonstration
      const mockSectionResponses = sections.map(section => ({
        sectionId: section.id,
        sectionName: section.name,
        responseCount: Math.floor(Math.random() * 100),
        completionRate: Math.floor(Math.random() * 100),
        averageTimeSpent: Math.floor(Math.random() * 300),
        color: section.color
      }));
      
      const mockResponsesByDate = Array.from({ length: 14 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 20)
        };
      }).reverse();
      
      const mockDemographicBreakdown: Array<{category: string; distribution: Record<string, number>}> = [
        {
          category: 'Age',
          distribution: {
            '18-24': 15,
            '25-34': 35,
            '35-44': 25,
            '45-54': 15,
            '55+': 10
          }
        },
        {
          category: 'Gender',
          distribution: {
            'Male': 48,
            'Female': 49,
            'Non-binary': 2,
            'Prefer not to say': 1
          }
        },
        {
          category: 'Location',
          distribution: {
            'North America': 45,
            'Europe': 30,
            'Asia': 15,
            'Other': 10
          }
        }
      ];
      
      setData({
        totalResponses: mockSectionResponses.reduce((acc, section) => acc + section.responseCount, 0),
        completionRate: Math.floor(Math.random() * 100),
        averageTimeSpent: Math.floor(Math.random() * 600),
        responsesByDate: mockResponsesByDate,
        sectionResponses: mockSectionResponses,
        questionResponses: [],
        demographicBreakdown: mockDemographicBreakdown
      });
    }
  }, [analyticsData, sections]);
  
  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  if (isLoading || !data) {
    return (
      <Container>
        <Header>
          <Title>Survey Response Analytics</Title>
        </Header>
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          Loading analytics data...
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title>Survey Response Analytics</Title>
        <ActionButtons>
          <Button>
            <FiFilter size={16} />
            Filter
          </Button>
          <Button>
            <FiDownload size={16} />
            Export
          </Button>
        </ActionButtons>
      </Header>
      
      <FilterBar>
        <div>
          <FilterLabel>Section:</FilterLabel>
          <FilterSelect 
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="all">All Sections</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>{section.name}</option>
            ))}
          </FilterSelect>
        </div>
        
        <DateRangePicker>
          <FilterLabel>Date Range:</FilterLabel>
          <FiCalendar size={16} style={{ color: '#552a47' }} />
          <DateInput
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
          <span>to</span>
          <DateInput
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </DateRangePicker>
      </FilterBar>
      
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
              <FiBarChart2 size={18} />
            </StatIcon>
          </StatHeader>
          <StatValue>{data.completionRate}%</StatValue>
          <StatDescription>Percentage of surveys completed</StatDescription>
        </StatCard>
        
        <StatCard>
          <StatHeader>
            <StatTitle>Average Time</StatTitle>
            <StatIcon>
              <FiCalendar size={18} />
            </StatIcon>
          </StatHeader>
          <StatValue>{formatTime(data.averageTimeSpent)}</StatValue>
          <StatDescription>Average time to complete the survey</StatDescription>
        </StatCard>
      </AnalyticsGrid>
      
      {/* Response Trend Chart */}
      <ChartContainer>
        <h4 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 16, color: '#552a47' }}>Response Trend</h4>
        <div style={{ height: 'calc(100% - 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <p>Response trend visualization would appear here.</p>
            <p style={{ fontSize: 14 }}>This would show responses over time and identify patterns.</p>
          </div>
        </div>
      </ChartContainer>
      
      {/* Section Response Table */}
      <div>
        <h4 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 16, color: '#552a47' }}>Section Performance</h4>
        <SectionResponseTable>
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
            {data.sectionResponses.map(section => (
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
        </SectionResponseTable>
      </div>
      
      {/* Demographic Breakdown */}
      {data.demographicBreakdown && (
        <div>
          <h4 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: 16, color: '#552a47' }}>Demographic Breakdown</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {data.demographicBreakdown.map(demographic => (
              <StatCard key={demographic.category}>
                <h5 style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: 15, color: '#552a47' }}>{demographic.category}</h5>
                <div>
                  {Object.entries(demographic.distribution).map(([label, value]) => (
                    <div key={label} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>{label}</span>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{value}%</span>
                      </div>
                      <ProgressBar progress={value} />
                    </div>
                  ))}
                </div>
              </StatCard>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

export default SurveyResponseAnalytics;

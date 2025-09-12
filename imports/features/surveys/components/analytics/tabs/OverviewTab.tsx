import React from 'react';
import styled from 'styled-components';

interface OverviewTabProps {
  analyticsData: {
    responseTrends: Array<{
      date: string;
      responses: number;
      completions: number;
    }>;
    completedSurveysCount: number;
  };
  isLoading: boolean;
}

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const ChartContainer = styled.div<{ size?: 'large' | 'medium' | 'small' }>`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  grid-column: ${props => props.size === 'large' ? 'span 2' : 'span 1'};

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const ChartHeader = styled.div`
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #334155;
  }
`;

const ChartPlaceholder = styled.div`
  min-height: 200px;
`;

const ModernLineChart = styled.div`
  position: relative;
  height: 200px;
`;

const ChartYAxis = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 40px;
`;

const YAxisLabel = styled.div`
  position: absolute;
  right: 10px;
  transform: translateY(-50%);
  font-size: 12px;
  color: #6b7280;
`;

const ChartContent = styled.div`
  position: absolute;
  left: 40px;
  right: 0;
  top: 0;
  bottom: 20px;
`;

const ChartXAxis = styled.div`
  position: absolute;
  left: 40px;
  right: 0;
  bottom: 0;
  height: 20px;
  display: flex;
  justify-content: space-between;
`;

const XAxisLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-align: center;
`;

const DonutChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const DonutChartLegend = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
`;

const LegendText = styled.div`
  font-size: 14px;
  color: #4b5563;
  flex: 1;
`;

const LegendCount = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
`;

const LegendTotal = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
`;

const MockBarChart = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  padding: 0 10px;
`;

const MockBar = styled.div`
  width: 30px;
  background-color: #552a47;
  border-radius: 4px 4px 0 0;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
  font-size: 14px;
`;

const OverviewTab: React.FC<OverviewTabProps> = ({ analyticsData, isLoading }) => {
  if (isLoading) {
    return <LoadingIndicator>Loading overview data...</LoadingIndicator>;
  }

  // Format dates for x-axis labels
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get the last 7 days of response trends or use available data
  const trendData = analyticsData.responseTrends.slice(-7);
  
  return (
    <ChartsSection>
      <ChartContainer size="large">
        <ChartHeader>
          <h3>Response Trends</h3>
        </ChartHeader>
        <ChartPlaceholder>
          {/* Modern line chart */}
          <ModernLineChart>
            <ChartYAxis>
              <YAxisLabel style={{ top: '0' }}>5.0</YAxisLabel>
              <YAxisLabel style={{ top: '20%' }}>4.0</YAxisLabel>
              <YAxisLabel style={{ top: '40%' }}>3.0</YAxisLabel>
              <YAxisLabel style={{ top: '60%' }}>2.0</YAxisLabel>
              <YAxisLabel style={{ top: '80%' }}>1.0</YAxisLabel>
              <YAxisLabel style={{ top: '100%', transform: 'translateY(-100%)' }}>0.0</YAxisLabel>
            </ChartYAxis>
            <ChartContent>
              <svg className="line-chart-svg" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="0" x2="600" y2="0" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="40" x2="600" y2="40" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="80" x2="600" y2="80" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="0" y1="200" x2="600" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                
                {/* Line chart path */}
                <path 
                  d="M0,200 C20,80 50,10 100,10 S150,80 200,120 S250,160 300,80 S350,10 400,10 S450,80 500,160 S550,180 600,140" 
                  fill="none"
                  stroke="#552a47"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                <circle cx="0" cy="200" r="4" fill="#552a47" />
                <circle cx="100" cy="10" r="4" fill="#552a47" />
                <circle cx="200" cy="120" r="4" fill="#552a47" />
                <circle cx="300" cy="80" r="4" fill="#552a47" />
                <circle cx="400" cy="10" r="4" fill="#552a47" />
                <circle cx="500" cy="160" r="4" fill="#552a47" />
                <circle cx="600" cy="140" r="4" fill="#552a47" />
              </svg>
              
              <ChartXAxis>
                {trendData.length > 0 ? (
                  trendData.map((item, index) => (
                    <XAxisLabel key={index}>{formatDate(item.date)}</XAxisLabel>
                  ))
                ) : (
                  <>
                    <XAxisLabel>Aug 21</XAxisLabel>
                    <XAxisLabel>Aug 22</XAxisLabel>
                    <XAxisLabel>Aug 23</XAxisLabel>
                    <XAxisLabel>Aug 24</XAxisLabel>
                    <XAxisLabel>Aug 25</XAxisLabel>
                    <XAxisLabel>Aug 26</XAxisLabel>
                    <XAxisLabel>Aug 27</XAxisLabel>
                  </>
                )}
              </ChartXAxis>
            </ChartContent>
          </ModernLineChart>
        </ChartPlaceholder>
      </ChartContainer>
      
      <ChartContainer>
        <ChartHeader>
          <h3>Question Response Distribution</h3>
        </ChartHeader>
        <ChartPlaceholder>
          {/* Enhanced SVG Donut Chart */}
          <DonutChartContainer>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Donut segments - 78% answered, 22% skipped */}
              <circle cx="100" cy="100" r="80" fill="transparent" stroke="#552a47" strokeWidth="30" strokeDasharray="392 503" strokeDashoffset="0" />
              <circle cx="100" cy="100" r="80" fill="transparent" stroke="#c9b7c7" strokeWidth="30" strokeDasharray="111 503" strokeDashoffset="-392" />
              
              {/* Center circle */}
              <circle cx="100" cy="100" r="50" fill="white" />
              
              {/* Center text */}
              <text x="100" y="90" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#334155">30</text>
              <text x="100" y="110" textAnchor="middle" fontSize="14" fill="#334155">Questions</text>
              <text x="100" y="125" textAnchor="middle" fontSize="14" fill="#334155">Total</text>
            </svg>
            
            {/* Legend with total counts */}
            <DonutChartLegend>
              <LegendItem>
                <LegendColor style={{backgroundColor: '#552a47'}}></LegendColor>
                <LegendText>Answered (78%)</LegendText>
                <LegendCount>23 questions</LegendCount>
              </LegendItem>
              <LegendItem>
                <LegendColor style={{backgroundColor: '#c9b7c7'}}></LegendColor>
                <LegendText>Skipped (22%)</LegendText>
                <LegendCount>7 questions</LegendCount>
              </LegendItem>
              <LegendTotal>
                From {analyticsData.completedSurveysCount} survey submissions
              </LegendTotal>
            </DonutChartLegend>
          </DonutChartContainer>
        </ChartPlaceholder>
      </ChartContainer>
      
      <ChartContainer>
        <ChartHeader>
          <h3>Engagement by Question</h3>
        </ChartHeader>
        <ChartPlaceholder>
          {/* Bar chart placeholder */}
          <MockBarChart>
            <MockBar style={{height: '75%'}}></MockBar>
            <MockBar style={{height: '90%'}}></MockBar>
            <MockBar style={{height: '60%'}}></MockBar>
            <MockBar style={{height: '85%'}}></MockBar>
            <MockBar style={{height: '40%'}}></MockBar>
          </MockBarChart>
        </ChartPlaceholder>
      </ChartContainer>
    </ChartsSection>
  );
};

export default OverviewTab;

import React from 'react';
import styled from 'styled-components';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';

interface TrendData {
  name: string;
  score: number;
}

interface EngagementTrendLineProps {
  data: TrendData[];
  isLoading: boolean;
  isBlurred: boolean;
}

const Container = styled.div<{ isBlurred: boolean }>`
  filter: ${props => props.isBlurred ? 'blur(4px)' : 'none'};
  transition: filter 0.3s ease;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  margin-bottom: 16px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  background: rgba(255, 255, 255, 0.8);
`;

const LoadingSpinner = styled.div`
  border: 3px solid #f3f3f3;
  border-top: 3px solid #b7a36a;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AverageBadge = styled.div`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f8f9fa;
  color: #1c1c1c;
  font-size: 14px;
  font-weight: 600;
  margin-left: 12px;
`;

const CustomTooltip = styled.div`
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const EngagementTrendLine: React.FC<EngagementTrendLineProps> = ({ data, isLoading, isBlurred }) => {
  // Calculate average score
  const averageScore = data.length 
    ? (data.reduce((sum, item) => sum + item.score, 0) / data.length).toFixed(1)
    : '0.0';
  
  return (
    <Container isBlurred={isBlurred}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title>Engagement Trend Line</Title>
        <AverageBadge>Average: {averageScore}/5</AverageBadge>
      </div>
      
      {isLoading ? (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      ) : (
        <ChartContainer>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <CustomTooltip>
                        <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{label}</p>
                        <p style={{ margin: '0', color: '#b7a36a' }}>
                          Score: {payload[0].value}/5
                        </p>
                      </CustomTooltip>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={3} stroke="#f39c12" strokeDasharray="3 3" label="Threshold" />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#b7a36a" 
                strokeWidth={2} 
                dot={{ 
                  r: 6, 
                  stroke: '#b7a36a', 
                  strokeWidth: 2, 
                  fill: 'white' 
                }} 
                activeDot={{ 
                  r: 8, 
                  stroke: '#b7a36a', 
                  strokeWidth: 2, 
                  fill: '#b7a36a' 
                }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </Container>
  );
};

export default EngagementTrendLine;

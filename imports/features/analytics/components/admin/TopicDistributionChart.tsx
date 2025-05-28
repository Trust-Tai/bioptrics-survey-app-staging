import React from 'react';
import styled from 'styled-components';

interface TopicDistributionChartProps {
  data: Record<string, number>;
}

const ChartContainer = styled.div`
  height: 250px;
  padding: 10px 0;
`;

const BarContainer = styled.div`
  margin-bottom: 12px;
`;

const BarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const Label = styled.span`
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
`;

const Value = styled.span`
  font-size: 12px;
  color: #333;
  font-weight: 500;
`;

const BarOuter = styled.div`
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;

const BarInner = styled.div<{ width: string; color: string }>`
  height: 100%;
  width: ${props => props.width};
  background-color: ${props => props.color};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

// Generate a color based on the index
const getColor = (index: number) => {
  const colors = [
    '#4a90e2', '#50e3c2', '#b8e986', '#f8e71c', 
    '#f5a623', '#e35050', '#bd10e0', '#9013fe'
  ];
  return colors[index % colors.length];
};

const TopicDistributionChart: React.FC<TopicDistributionChartProps> = ({ data }) => {
  // Sort data by value in descending order
  const sortedData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8); // Only show top 8 items
  
  // Find max value for scaling
  const maxValue = Math.max(...sortedData.map(([_, value]) => value), 1);
  
  return (
    <ChartContainer>
      {sortedData.map(([key, value], index) => (
        <BarContainer key={key}>
          <BarLabel>
            <Label>{key}</Label>
            <Value>{value}</Value>
          </BarLabel>
          <BarOuter>
            <BarInner 
              width={`${(value / maxValue) * 100}%`} 
              color={getColor(index)}
            />
          </BarOuter>
        </BarContainer>
      ))}
      
      {sortedData.length === 0 && (
        <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
          No data available
        </div>
      )}
    </ChartContainer>
  );
};

export default TopicDistributionChart;

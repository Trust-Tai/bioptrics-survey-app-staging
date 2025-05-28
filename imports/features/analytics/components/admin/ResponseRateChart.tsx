import React from 'react';
import styled from 'styled-components';

interface ResponseRateChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
}

const ChartContainer = styled.div`
  height: 250px;
  position: relative;
`;

const BarContainer = styled.div`
  display: flex;
  height: 200px;
  align-items: flex-end;
  gap: 4px;
  margin-top: 20px;
`;

const Bar = styled.div<{ height: string }>`
  flex: 1;
  height: ${props => props.height};
  background-color: #4a90e2;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease;
  min-width: 10px;
  position: relative;
  
  &:hover {
    background-color: #2a70c2;
  }
`;

const XAxis = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 10px;
  color: #999;
`;

const YAxis = styled.div`
  position: absolute;
  left: -30px;
  top: 0;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 10px;
  color: #999;
`;

const DateLabel = styled.div`
  font-size: 10px;
  color: #999;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  white-space: nowrap;
  
  ${Bar}:hover & {
    opacity: 1;
  }
`;

const ResponseRateChart: React.FC<ResponseRateChartProps> = ({ data }) => {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Find max value for scaling
  const maxCount = Math.max(...sortedData.map(item => item.count), 1);
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // Only show a subset of dates on the x-axis to avoid overcrowding
  const displayedDates = sortedData.filter((_, index) => index % Math.ceil(sortedData.length / 10) === 0);
  
  return (
    <ChartContainer>
      <YAxis>
        <div>100%</div>
        <div>75%</div>
        <div>50%</div>
        <div>25%</div>
        <div>0%</div>
      </YAxis>
      
      <BarContainer>
        {sortedData.map((item, index) => (
          <Bar 
            key={item.date} 
            height={`${(item.count / maxCount) * 100}%`}
          >
            <Tooltip>
              {formatDate(item.date)}: {item.count} responses
            </Tooltip>
          </Bar>
        ))}
      </BarContainer>
      
      <XAxis>
        {displayedDates.map(item => (
          <DateLabel key={item.date}>
            {formatDate(item.date)}
          </DateLabel>
        ))}
      </XAxis>
    </ChartContainer>
  );
};

export default ResponseRateChart;

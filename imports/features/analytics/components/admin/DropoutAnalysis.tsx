import React, { useState } from 'react';
import styled from 'styled-components';

interface DropoutReasonsProps {
  data?: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}

const DropoutContainer = styled.div`
  width: 100%;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
  background-color: white;
`;

const DropoutTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
`;

const DropoutSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
`;

const BarChartContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: calc(100% - 60px);
  position: relative;
`;

const BarGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  position: relative;
  cursor: pointer;
  z-index: 2;
`;

const BarLabel = styled.div`
  width: 150px;
  text-align: right;
  padding-right: 15px;
  font-size: 14px;
  color: #555;
  white-space: nowrap;
  font-weight: 500;
`;

const BarWrapper = styled.div`
  flex-grow: 1;
  background-color: #f0f0f0;
  border-radius: 4px;
  height: 24px;
  position: relative;
`;

const Bar = styled.div<{ width: number; color: string }>`
  height: 24px;
  width: ${props => props.width}%;
  background-color: ${props => props.color};
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;
  
  &:after {
    content: attr(data-percentage);
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    font-weight: 500;
    color: white;
  }
`;

const BarValue = styled.div`
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 500;
  color: #555;
`;

const Tooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 10;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.2s ease;
  pointer-events: none;
  white-space: nowrap;
`;

const GridLines = styled.div`
  position: absolute;
  top: 0;
  left: 150px;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
`;

const GridLine = styled.div`
  height: 100%;
  width: 1px;
  border-left: 1px dashed rgba(0, 0, 0, 0.1);
  position: relative;
  
  &:after {
    content: attr(data-value);
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: #666;
  }
`;

// Mock data for the dropout reasons
const mockData = [
  { reason: 'Survey too long', count: 250, percentage: 35 },
  { reason: 'Technical issues', count: 180, percentage: 25 },
  { reason: 'Unclear questions', count: 120, percentage: 17 },
  { reason: 'Privacy concerns', count: 90, percentage: 13 },
  { reason: 'Not interested', count: 70, percentage: 10 },
  { reason: 'Other', count: 50, percentage: 7 },
];

const getColor = (): string => {
  // Use a consistent color for all bars in the horizontal chart
  return '#3B78E7'; // Blue color to match the design
};

const DropoutAnalysis: React.FC<DropoutReasonsProps> = ({ data = mockData }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const gridValues = [0, 0.25, 0.5, 0.75, 1];

  return (
    <DropoutContainer>
      <DropoutTitle>Dropout Reasons</DropoutTitle>
      <DropoutSubtitle>Why users abandon the survey</DropoutSubtitle>
      <BarChartContainer>
        <GridLines>
          {gridValues.map((value, i) => (
            <GridLine key={i} data-value={value} />
          ))}
        </GridLines>
        
        {data.map((item, index) => (
          <BarGroup 
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <BarLabel>{item.reason}</BarLabel>
            <BarWrapper>
              <Bar 
                width={item.percentage * 2} 
                color="#4299e1" 
                data-percentage={`${item.percentage}%`}
              />
              <BarValue>{item.percentage}%</BarValue>
            </BarWrapper>
            <Tooltip visible={hoveredIndex === index}>
              {item.reason}: {item.percentage}% ({item.count} users)
            </Tooltip>
          </BarGroup>
        ))}
      </BarChartContainer>
    </DropoutContainer>
  );
};

export default DropoutAnalysis;

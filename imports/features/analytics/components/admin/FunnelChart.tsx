import React, { useState } from 'react';
import styled from 'styled-components';

interface FunnelChartProps {
  data?: {
    stage: string;
    count: number;
    percentage: number;
  }[];
}

const FunnelContainer = styled.div`
  width: 100%;
  padding: 20px 0;
`;

const FunnelTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const FunnelSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
`;

const FunnelWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  padding-bottom: 30px;
  border-radius: 8px;
  padding: 20px;
`;

const FunnelStage = styled.div<{ width: number; color: string; isLast?: boolean; isFirst?: boolean }>`
  width: ${props => props.width}%;
  height: 50px;
  background-color: ${props => props.color};
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  position: relative;
  border-radius: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  clip-path: ${props => props.isFirst ? 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' : 
    props.isLast ? 'polygon(5% 0, 95% 0, 85% 100%, 15% 100%)' : 
    'polygon(5% 0, 95% 0, 90% 100%, 10% 100%)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const FunnelArrow = styled.div`
  position: absolute;
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -5px;
`;

const Tooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  top: -40px;
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
  display: ${props => props.visible ? 'block' : 'none'};
`;

// Mock data for the funnel chart
const mockData = [
  { stage: 'Started Survey', count: 1000, percentage: 100 },
  { stage: 'First Section', count: 950, percentage: 95 },
  { stage: 'Second Section', count: 600, percentage: 60 },
  { stage: 'Third Section', count: 450, percentage: 45 },
  { stage: 'Fourth Section', count: 350, percentage: 35 },
  { stage: 'Completed Survey', count: 300, percentage: 30 },
];

const getColor = (index: number): string => {
  const colors = [
    '#4285F4', // Google Blue - Lightest
    '#3B78E7', // Slightly darker blue
    '#2D6AD9', // Medium blue
    '#1E5ACB', // Darker blue
    '#1A2F5A', // Darkest blue
  ];
  return colors[index % colors.length];
};

const FunnelChart: React.FC<FunnelChartProps> = ({ data = mockData }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <FunnelContainer>
      <FunnelTitle>Survey Completion Funnel</FunnelTitle>
      <FunnelSubtitle>Track where users drop off during the survey</FunnelSubtitle>
      <FunnelWrapper>
        {data.map((item, index) => (
          <div key={index} style={{ position: 'relative', marginBottom: '5px' }}>
            {/* Regular funnel stages */}
            {index < data.length - 1 ? (
              <FunnelStage 
                width={100 - (index * 12)} 
                color={getColor(index)}
                isFirst={index === 0}
                isLast={false}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ) : (
              /* Last stage as triangle */
              <div 
                style={{
                  width: '0',
                  height: '0',
                  borderLeft: '60px solid transparent',
                  borderRight: '60px solid transparent',
                  borderTop: '40px solid #2a4a7f',
                  margin: '0 auto',
                  position: 'relative',
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Removed the bottom line */}
              </div>
            )}
            
            {/* Tooltip for all stages including the triangle */}
            {hoveredIndex === index && (
              <div style={{
                position: 'absolute',
                top: index === data.length - 1 ? '-40px' : '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 10,
                whiteSpace: 'nowrap'
              }}>
                {item.stage}: {item.percentage}% ({item.count})
              </div>
            )}
          </div>
        ))}
      </FunnelWrapper>
    </FunnelContainer>
  );
};

export default FunnelChart;

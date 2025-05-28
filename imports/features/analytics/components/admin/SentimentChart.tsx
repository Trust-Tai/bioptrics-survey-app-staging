import React from 'react';
import styled from 'styled-components';

interface SentimentChartProps {
  data: {
    totalResponses: number;
    completionRate: number;
    averageSentiment: number;
    responsesByDepartment: Record<string, number>;
    responsesByDate: any[];
    topComments: any[];
  };
}

const ChartContainer = styled.div`
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const GaugeContainer = styled.div`
  position: relative;
  width: 200px;
  height: 100px;
  margin-bottom: 40px;
`;

const GaugeBackground = styled.div`
  position: absolute;
  width: 200px;
  height: 100px;
  border-radius: 100px 100px 0 0;
  background: linear-gradient(90deg, #ff4d4d 0%, #ffff4d 50%, #4dff4d 100%);
  overflow: hidden;
`;

const GaugeLabel = styled.div`
  position: absolute;
  bottom: -30px;
  width: 100%;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const GaugeNeedle = styled.div<{ rotation: number }>`
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 4px;
  height: 100px;
  background-color: #333;
  transform-origin: bottom center;
  transform: translateX(-50%) rotate(${props => props.rotation}deg);
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 20px;
    background-color: #333;
    border-radius: 50%;
  }
`;

const ScaleLabels = styled.div`
  display: flex;
  justify-content: space-between;
  width: 200px;
  margin-top: 10px;
`;

const ScaleLabel = styled.div`
  font-size: 12px;
  color: #666;
`;

const SentimentChart: React.FC<SentimentChartProps> = ({ data }) => {
  // Convert sentiment to a 0-180 degree rotation
  // Assuming sentiment is on a scale of 1-5
  const sentimentRotation = ((data.averageSentiment - 1) / 4) * 180;
  
  // Get sentiment label
  const getSentimentLabel = (value: number) => {
    if (value < 2) return 'Negative';
    if (value < 3) return 'Somewhat Negative';
    if (value < 4) return 'Neutral';
    if (value < 4.5) return 'Positive';
    return 'Very Positive';
  };
  
  return (
    <ChartContainer>
      <GaugeContainer>
        <GaugeBackground />
        <GaugeNeedle rotation={sentimentRotation} />
        <GaugeLabel>
          {data.averageSentiment.toFixed(1)} - {getSentimentLabel(data.averageSentiment)}
        </GaugeLabel>
      </GaugeContainer>
      
      <ScaleLabels>
        <ScaleLabel>Very Negative</ScaleLabel>
        <ScaleLabel>Neutral</ScaleLabel>
        <ScaleLabel>Very Positive</ScaleLabel>
      </ScaleLabels>
    </ChartContainer>
  );
};

export default SentimentChart;

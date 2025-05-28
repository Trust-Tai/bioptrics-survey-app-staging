import React from 'react';
import styled from 'styled-components';

/**
 * Interface for theme data used in the heatmap
 */
export interface ThemeData {
  theme: string;
  scores: number[];
}

/**
 * Props for the ThemeHeatmap component
 */
export interface ThemeHeatmapProps {
  data: ThemeData[];
  surveyLabels?: string[];
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

const HeatmapGrid = styled.div`
  display: grid;
  grid-template-columns: 140px repeat(3, 1fr);
  gap: 8px;
`;

const HeaderCell = styled.div`
  background: #f8f9fa;
  padding: 10px;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  border-radius: 4px;
`;

const ThemeCell = styled.div`
  padding: 10px;
  font-weight: 500;
  font-size: 14px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const ScoreCell = styled.div<{ score: number }>`
  padding: 10px;
  text-align: center;
  font-weight: 600;
  color: white;
  border-radius: 4px;
  background-color: ${props => {
    if (props.score >= 4) return '#27ae60';
    if (props.score >= 3.5) return '#2ecc71';
    if (props.score >= 3) return '#f39c12';
    if (props.score >= 2.5) return '#e67e22';
    return '#e74c3c';
  }};
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
  border-top: 3px solid #552a47;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  gap: 12px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 2px;
  background-color: ${props => props.color};
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 24px;
`;

/**
 * ThemeHeatmap component for displaying theme scores across surveys in a heatmap format
 * Uses color coding to indicate score ranges
 */
const ThemeHeatmap: React.FC<ThemeHeatmapProps> = ({ 
  data, 
  surveyLabels = ['Survey 1', 'Survey 2', 'Survey 3'], 
  isLoading, 
  isBlurred 
}) => {
  return (
    <Card>
      <Container isBlurred={isBlurred}>
        <Title>Theme Heat Map</Title>
        {isLoading ? (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        ) : (
          <>
            <HeatmapGrid>
              <HeaderCell>Theme</HeaderCell>
              {surveyLabels.map((label, index) => (
                <HeaderCell key={index}>{label}</HeaderCell>
              ))}
              
              {data.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <ThemeCell>{row.theme}</ThemeCell>
                  {row.scores.map((score, colIndex) => (
                    <ScoreCell key={colIndex} score={score}>
                      {score.toFixed(1)}
                    </ScoreCell>
                  ))}
                </React.Fragment>
              ))}
            </HeatmapGrid>
            
            <LegendContainer>
              <LegendItem>
                <LegendColor color="#e74c3c" />
                <span>&lt;2.5</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#e67e22" />
                <span>2.5-2.9</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#f39c12" />
                <span>3.0-3.4</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#2ecc71" />
                <span>3.5-3.9</span>
              </LegendItem>
              <LegendItem>
                <LegendColor color="#27ae60" />
                <span>4.0+</span>
              </LegendItem>
            </LegendContainer>
          </>
        )}
      </Container>
    </Card>
  );
};

export default ThemeHeatmap;

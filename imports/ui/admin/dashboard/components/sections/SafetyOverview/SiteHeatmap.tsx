import React from 'react';
import styled from 'styled-components';
import { SafetyHeatmapData } from '../../../types/dashboard.types';

interface SiteHeatmapProps {
  data: SafetyHeatmapData[];
}

const HeatmapContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  flex: 1;
`;

const HeatmapTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
`;

const HeatmapGrid = styled.div`
  display: grid;
  grid-template-columns: 120px repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;
`;

const HeatmapHeader = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-align: center;
  padding: 12px 8px;
  background: #f8f9fa;
  border-radius: 6px;
`;

const HeatmapRowLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  padding: 12px 8px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
`;

const HeatmapCell = styled.div<{ value: number | null }>`
  padding: 12px 8px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  
  background: ${props => {
    if (props.value === null) return '#e9ecef';
    const intensity = props.value / 100;
    if (intensity >= 0.8) return '#27ae60';
    if (intensity >= 0.65) return '#2ecc71';
    if (intensity >= 0.5) return '#f39c12';
    return '#e74c3c';
  }};
  
  color: ${props => props.value === null ? '#666' : 'white'};
`;

const EmptyCell = styled.div`
  padding: 12px 8px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  color: #999;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
`;

export const SiteHeatmap: React.FC<SiteHeatmapProps> = ({ data }) => {
  const sites = ['Workforce', 'Leaders'];
  
  return (
    <HeatmapContainer>
      <HeatmapTitle>Site Heatmap</HeatmapTitle>
      
      <HeatmapGrid>
        {/* Header row */}
        <div></div>
        {sites.map(site => (
          <HeatmapHeader key={site}>{site}</HeatmapHeader>
        ))}
        
        {/* Data rows */}
        {data.map((row, index) => (
          <React.Fragment key={index}>
            <HeatmapRowLabel>{row.category}</HeatmapRowLabel>
            {sites.map(site => {
              const value = row.sites[site];
              return value !== null && value !== undefined ? (
                <HeatmapCell key={`${row.category}-${site}`} value={value}>
                  {value}%
                </HeatmapCell>
              ) : (
                <EmptyCell key={`${row.category}-${site}`}>
                  —
                </EmptyCell>
              );
            })}
          </React.Fragment>
        ))}
      </HeatmapGrid>
    </HeatmapContainer>
  );
};

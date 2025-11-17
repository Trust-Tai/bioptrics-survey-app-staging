import React from 'react';
import styled from 'styled-components';
import { RadarChartData } from '../../../types/dashboard.types';

interface RadarChartProps {
  data: RadarChartData[];
}

const RadarContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RadarTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
`;

const RadarSVG = styled.svg`
  width: 300px;
  height: 300px;
  max-width: 100%;
`;

const RadarPolygon = styled.polygon`
  fill: rgba(237, 104, 1, 0.2);
  stroke: #be5f41;
  stroke-width: 2;
`;

const RadarGrid = styled.polygon`
  fill: none;
  stroke: #e0e0e0;
  stroke-width: 1;
`;

const RadarAxis = styled.line`
  stroke: #e0e0e0;
  stroke-width: 1;
`;

const RadarLabel = styled.text`
  font-size: 12px;
  font-weight: 500;
  fill: #666;
  text-anchor: middle;
  dominant-baseline: middle;
`;

const RadarValue = styled.text`
  font-size: 10px;
  font-weight: 600;
  fill: #333;
  text-anchor: middle;
  dominant-baseline: middle;
`;

export const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 120;
  const numPoints = data.length;
  
  // Calculate points for the data polygon
  const dataPoints = data.map((item, index) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
    const radius = (item.value / 100) * maxRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y, angle, radius: (item.value / 100) * maxRadius };
  });
  
  // Calculate points for grid circles
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridLevels.map(level => {
    return data.map((_, index) => {
      const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
      const radius = level * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });
  
  // Calculate label positions
  const labelPositions = data.map((item, index) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
    const labelRadius = maxRadius + 25;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    return { x, y, label: item.category, value: item.value };
  });
  
  return (
    <RadarContainer>
      <RadarTitle>WPS Zones Radar View</RadarTitle>
      
      <RadarSVG viewBox="0 0 300 300">
        {/* Grid circles */}
        {gridPolygons.map((points, index) => (
          <RadarGrid key={index} points={points} />
        ))}
        
        {/* Axis lines */}
        {data.map((_, index) => {
          const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
          const endX = centerX + maxRadius * Math.cos(angle);
          const endY = centerY + maxRadius * Math.sin(angle);
          return (
            <RadarAxis
              key={index}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
            />
          );
        })}
        
        {/* Data polygon */}
        <RadarPolygon
          points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
        />
        
        {/* Data points */}
        {dataPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#be5f41"
            stroke="white"
            strokeWidth="2"
          />
        ))}
        
        {/* Labels */}
        {labelPositions.map((pos, index) => (
          <g key={index}>
            <RadarLabel x={pos.x} y={pos.y}>
              {pos.label}
            </RadarLabel>
            <RadarValue x={pos.x} y={pos.y + 12}>
              {pos.value}
            </RadarValue>
          </g>
        ))}
        
        {/* Grid value labels */}
        {gridLevels.map((level, index) => (
          <RadarValue
            key={index}
            x={centerX + 5}
            y={centerY - level * maxRadius}
            fill="#999"
          >
            {Math.round(level * 100)}
          </RadarValue>
        ))}
      </RadarSVG>
    </RadarContainer>
  );
};

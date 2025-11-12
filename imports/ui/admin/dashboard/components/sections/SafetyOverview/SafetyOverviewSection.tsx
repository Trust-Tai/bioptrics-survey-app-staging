import React from 'react';
import styled from 'styled-components';
import { SiteHeatmap } from './SiteHeatmap';
import { RadarChart } from './RadarChart';
import { SafetyHeatmapData, RadarChartData } from '../../../types/dashboard.types';

const SectionContainer = styled.div`
  margin-bottom: 32px;
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

interface SafetyOverviewSectionProps {
  className?: string;
}

export const SafetyOverviewSection: React.FC<SafetyOverviewSectionProps> = ({ className }) => {
  // Mock data for heatmap - replace with real data from your backend
  const heatmapData: SafetyHeatmapData[] = [
    {
      category: 'Built Environment',
      sites: {
        'Workforce': 75,
        'Leaders': 82
      }
    },
    {
      category: 'Inclusion',
      sites: {
        'Workforce': 88,
        'Leaders': 72
      }
    },
    {
      category: 'Psychological',
      sites: {
        'Workforce': null,
        'Leaders': 68
      }
    },
    {
      category: 'Physical',
      sites: {
        'Workforce': 72,
        'Leaders': 85
      }
    },
    {
      category: 'Leadership',
      sites: {
        'Workforce': 65,
        'Leaders': null
      }
    },
    {
      category: 'Social',
      sites: {
        'Workforce': 78,
        'Leaders': 72
      }
    }
  ];

  // Mock data for radar chart - replace with real data from your backend
  const radarData: RadarChartData[] = [
    { category: 'Built Environment', value: 75 },
    { category: 'Social', value: 85 },
    { category: 'Inclusion', value: 70 },
    { category: 'Psychological', value: 65 },
    { category: 'Physical', value: 80 },
    { category: 'Leadership', value: 60 }
  ];

  return (
    <SectionContainer className={className}>
      <SectionHeader>
        <SectionTitle>Whole Person Safety Overview</SectionTitle>
        <SectionSubtitle>Six WPS standards across sites</SectionSubtitle>
      </SectionHeader>

      <ChartsContainer>
        <SiteHeatmap data={heatmapData} />
        <RadarChart data={radarData} />
      </ChartsContainer>
    </SectionContainer>
  );
};

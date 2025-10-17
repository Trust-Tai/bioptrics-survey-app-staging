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
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '🛡️';
    font-size: 18px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
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
        'Site A': 75,
        'Site B': 82,
        'Site C': null,
        'Site D': 68
      }
    },
    {
      category: 'Inclusion',
      sites: {
        'Site A': 88,
        'Site B': 72,
        'Site C': 65,
        'Site D': 78
      }
    },
    {
      category: 'Psychological',
      sites: {
        'Site A': null,
        'Site B': 68,
        'Site C': 72,
        'Site D': 82
      }
    },
    {
      category: 'Physical',
      sites: {
        'Site A': 72,
        'Site B': 85,
        'Site C': 78,
        'Site D': null
      }
    },
    {
      category: 'Leadership',
      sites: {
        'Site A': 65,
        'Site B': null,
        'Site C': 88,
        'Site D': 72
      }
    },
    {
      category: 'Social',
      sites: {
        'Site A': 78,
        'Site B': 72,
        'Site C': 68,
        'Site D': 75
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

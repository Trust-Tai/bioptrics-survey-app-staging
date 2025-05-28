import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

/**
 * Interface for site participation data
 */
export interface SiteData {
  name: string;
  completed: number;
  pending: number;
}

/**
 * Props for the SiteParticipationChart component
 */
export interface SiteParticipationChartProps {
  data: SiteData[];
  isLoading: boolean;
  isBlurred: boolean;
}

const ChartContainer = styled.div<{ isBlurred: boolean }>`
  width: 100%;
  height: 300px;
  filter: ${props => props.isBlurred ? 'blur(4px)' : 'none'};
  transition: filter 0.3s ease;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  margin-bottom: 16px;
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

const Card = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 24px;
`;

/**
 * SiteParticipationChart component for displaying site participation data in a bar chart
 * Shows completed and pending participation rates by site
 */
const SiteParticipationChart: React.FC<SiteParticipationChartProps> = ({ data, isLoading, isBlurred }) => {
  return (
    <Card>
      <Title>Site Participation Rates</Title>
      
      {isLoading ? (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      ) : (
        <ChartContainer isBlurred={isBlurred}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  return [`${value}%`, name === 'completed' ? 'Completed' : 'Pending'];
                }}
              />
              <Legend />
              <Bar dataKey="completed" name="Completed" fill="#28a745" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#ffc107" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </Card>
  );
};

export default SiteParticipationChart;

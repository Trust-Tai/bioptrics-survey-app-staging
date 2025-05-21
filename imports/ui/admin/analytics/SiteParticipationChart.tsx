import React from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, TooltipProps } from 'recharts';

interface SiteData {
  name: string;
  completed: number;
  pending: number;
}

interface SiteParticipationChartProps {
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
  border-top: 3px solid #b7a36a;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CustomTooltip = styled.div`
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const SiteParticipationChart: React.FC<SiteParticipationChartProps> = ({ data, isLoading, isBlurred }) => {
  return (
    <div>
      <Title>Participation by Site</Title>
      <ChartContainer isBlurred={isBlurred}>
        {isLoading ? (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                content={({ active, payload, label }: TooltipProps<number, string>) => {
                  if (active && payload && payload.length) {
                    return (
                      <CustomTooltip>
                        <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{label}</p>
                        <p style={{ margin: '0', color: '#7ec16c' }}>
                          Completed: {payload[0].value}
                        </p>
                        <p style={{ margin: '0', color: '#f5e5a0' }}>
                          Pending: {payload[1].value}
                        </p>
                        <p style={{ margin: '5px 0 0', fontWeight: 'bold' }}>
                          Total: {Number(payload[0].value) + Number(payload[1].value)}
                        </p>
                      </CustomTooltip>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#7ec16c" name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="#f5e5a0" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </div>
  );
};

export default SiteParticipationChart;

import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';

interface DatabaseStatsData {
  totalSurveys: number;
  totalResponses: number;
  completedResponses: number;
  inProgressResponses: number;
  sampleResponses: Array<{
    _id: string;
    surveyId: string;
    completed: boolean;
    createdAt: Date;
  }>;
}

const StatsContainer = styled.div`
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatsTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #7f8c8d;
`;

const SampleResponsesContainer = styled.div`
  margin-top: 20px;
`;

const SampleResponsesTitle = styled.h4`
  margin-bottom: 10px;
`;

const ResponseTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f2f2f2;
  }
`;

const RefreshButton = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 15px;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const DatabaseStats: React.FC = () => {
  const [stats, setStats] = useState<DatabaseStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStats = () => {
    setLoading(true);
    setError(null);
    
    Meteor.call('getDatabaseStats', (err: any, result: DatabaseStatsData) => {
      setLoading(false);
      
      if (err) {
        console.error('Error fetching database stats:', err);
        setError(err.message || 'Failed to fetch database statistics');
        return;
      }
      
      setStats(result);
    });
  };
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  if (loading) {
    return <StatsContainer>Loading database statistics...</StatsContainer>;
  }
  
  if (error) {
    return (
      <StatsContainer>
        <div style={{ color: 'red' }}>Error: {error}</div>
        <RefreshButton onClick={fetchStats}>Try Again</RefreshButton>
      </StatsContainer>
    );
  }
  
  if (!stats) {
    return (
      <StatsContainer>
        <div>No statistics available</div>
        <RefreshButton onClick={fetchStats}>Refresh</RefreshButton>
      </StatsContainer>
    );
  }
  
  return (
    <StatsContainer>
      <StatsTitle>Database Statistics</StatsTitle>
      <RefreshButton onClick={fetchStats}>Refresh Stats</RefreshButton>
      
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.totalSurveys}</StatValue>
          <StatLabel>Total Surveys</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.totalResponses}</StatValue>
          <StatLabel>Total Responses</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.completedResponses}</StatValue>
          <StatLabel>Completed Surveys</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.inProgressResponses}</StatValue>
          <StatLabel>In Progress</StatLabel>
        </StatCard>
      </StatsGrid>
      
      {stats.sampleResponses && stats.sampleResponses.length > 0 && (
        <SampleResponsesContainer>
          <SampleResponsesTitle>Sample Survey Responses</SampleResponsesTitle>
          <ResponseTable>
            <thead>
              <tr>
                <th>ID</th>
                <th>Survey ID</th>
                <th>Completed</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {stats.sampleResponses.map(response => (
                <tr key={response._id}>
                  <td>{response._id}</td>
                  <td>{response.surveyId}</td>
                  <td>{response.completed ? 'Yes' : 'No'}</td>
                  <td>{formatDate(response.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </ResponseTable>
        </SampleResponsesContainer>
      )}
    </StatsContainer>
  );
};

export default DatabaseStats;

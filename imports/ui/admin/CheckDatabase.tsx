import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  margin-top: 0;
  color: #333;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: #f5f5f5;
  border-radius: 6px;
  padding: 15px;
  text-align: center;
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

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const ResponseTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
  th, td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }
  
  tr:hover {
    background-color: #f5f5f5;
  }
`;

const CheckDatabase: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchStats = () => {
    setLoading(true);
    setError(null);
    
    Meteor.call('getDatabaseStats', (err: any, result: any) => {
      setLoading(false);
      
      if (err) {
        console.error('Error fetching database stats:', err);
        setError(err.message || 'Failed to fetch database statistics');
        return;
      }
      
      console.log('Database stats:', result);
      setStats(result);
    });
  };
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  return (
    <Container>
      <Title>Database Statistics</Title>
      <Button onClick={fetchStats}>Refresh Data</Button>
      
      {loading && <p>Loading database statistics...</p>}
      
      {error && (
        <div style={{ color: 'red', marginBottom: '15px' }}>
          Error: {error}
        </div>
      )}
      
      {stats && (
        <>
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
          
          <h3>Sample Survey Responses</h3>
          {stats.sampleResponses && stats.sampleResponses.length > 0 ? (
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
                {stats.sampleResponses.map((response: any) => (
                  <tr key={response._id}>
                    <td>{response._id}</td>
                    <td>{response.surveyId}</td>
                    <td>{response.completed ? 'Yes' : 'No'}</td>
                    <td>{formatDate(response.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </ResponseTable>
          ) : (
            <p>No survey responses found in the database.</p>
          )}
        </>
      )}
    </Container>
  );
};

export default CheckDatabase;

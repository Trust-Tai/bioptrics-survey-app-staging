import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin-top: 0;
  color: #333;
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

const Table = styled.table`
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

const DbChecker: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  
  const checkDatabase = () => {
    setLoading(true);
    setError(null);
    
    Meteor.call('checkDatabase', (err: any, result: any) => {
      setLoading(false);
      
      if (err) {
        console.error('Error checking database:', err);
        setError(err.message || 'Failed to check database');
        return;
      }
      
      console.log('Database check results:', result);
      setStats(result);
    });
  };
  
  const testDatabaseWrite = () => {
    setTestLoading(true);
    setTestError(null);
    setTestResult(null);
    
    Meteor.call('testDatabaseWrite', (err: any, result: any) => {
      setTestLoading(false);
      
      if (err) {
        console.error('Error testing database write:', err);
        setTestError(err.message || 'Failed to write test data to database');
        return;
      }
      
      console.log('Test database write result:', result);
      setTestResult(result);
      
      // Refresh stats after successful write
      checkDatabase();
    });
  };
  
  return (
    <Container>
      <Title>Database Check</Title>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Button onClick={checkDatabase} disabled={loading}>
          {loading ? 'Checking...' : 'Check Database'}
        </Button>
        
        <Button 
          onClick={testDatabaseWrite} 
          disabled={testLoading}
          style={{ backgroundColor: '#27ae60' }}
        >
          {testLoading ? 'Creating Test Data...' : 'Create Test Survey Response'}
        </Button>
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}
      
      {testError && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Test Error: {testError}
        </div>
      )}
      
      {testResult && (
        <div style={{ 
          backgroundColor: '#e8f7f0', 
          padding: '15px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          border: '1px solid #27ae60'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>Test Result</h3>
          <p><strong>Status:</strong> {testResult.success ? 'Success' : 'Failed'}</p>
          <p><strong>Response ID:</strong> {testResult.responseId}</p>
          <p><strong>Message:</strong> {testResult.message}</p>
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
          </StatsGrid>
          
          <h3>Recent Survey Responses</h3>
          {stats.recentResponses && stats.recentResponses.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Survey ID</th>
                  <th>Completed</th>
                  <th>Created At</th>
                  <th>Response Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentResponses.map((response: any) => (
                  <tr key={response._id}>
                    <td>{response._id}</td>
                    <td>{response.surveyId}</td>
                    <td>{response.completed ? 'Yes' : 'No'}</td>
                    <td>{new Date(response.createdAt).toLocaleString()}</td>
                    <td>{response.responseCount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No survey responses found.</p>
          )}
        </>
      )}
    </Container>
  );
};

export default DbChecker;

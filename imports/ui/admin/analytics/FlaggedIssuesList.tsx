import React from 'react';
import styled from 'styled-components';
import { FiAlertTriangle, FiAlertCircle, FiAlertOctagon } from 'react-icons/fi';

interface Issue {
  id: number;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

interface FlaggedIssuesListProps {
  issues: Issue[];
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

const IssuesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #b7a36a;
    border-radius: 10px;
  }
`;

const IssueCard = styled.div<{ severity: 'high' | 'medium' | 'low' }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  background-color: ${props => {
    switch (props.severity) {
      case 'high': return '#fff5f5';
      case 'medium': return '#fff9db';
      case 'low': return '#f6fff8';
      default: return '#f8f9fa';
    }
  }};
  border-left: 3px solid ${props => {
    switch (props.severity) {
      case 'high': return '#e53e3e';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#718096';
    }
  }};
`;

const IconContainer = styled.div<{ severity: 'high' | 'medium' | 'low' }>`
  color: ${props => {
    switch (props.severity) {
      case 'high': return '#e53e3e';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#718096';
    }
  }};
  font-size: 20px;
  margin-top: 2px;
`;

const IssueContent = styled.div`
  flex: 1;
`;

const IssueMessage = styled.p`
  margin: 0;
  font-size: 14px;
  color: #1c1c1c;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #718096;
  text-align: center;
  
  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
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

const FlaggedIssuesList: React.FC<FlaggedIssuesListProps> = ({ issues, isLoading, isBlurred }) => {
  // Get icon based on severity
  const getIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <FiAlertOctagon />;
      case 'medium': return <FiAlertTriangle />;
      case 'low': return <FiAlertCircle />;
      default: return <FiAlertCircle />;
    }
  };
  
  return (
    <Container isBlurred={isBlurred}>
      <Title>Flagged Issues</Title>
      
      {isLoading ? (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      ) : issues.length > 0 ? (
        <IssuesList>
          {issues.map(issue => (
            <IssueCard key={issue.id} severity={issue.severity}>
              <IconContainer severity={issue.severity}>
                {getIcon(issue.severity)}
              </IconContainer>
              <IssueContent>
                <IssueMessage>{issue.message}</IssueMessage>
              </IssueContent>
            </IssueCard>
          ))}
        </IssuesList>
      ) : (
        <EmptyState>
          <FiAlertCircle />
          <p>No issues detected</p>
          <p>Everything looks good with the current survey data</p>
        </EmptyState>
      )}
    </Container>
  );
};

export default FlaggedIssuesList;

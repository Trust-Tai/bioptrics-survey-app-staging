import React from 'react';
import styled from 'styled-components';
import { 
  FiCalendar, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClipboard,
  FiEdit,
  FiUsers,
  FiLink
} from 'react-icons/fi';

import { Survey } from '../types/surveyTypes';

interface ReviewStepProps {
  survey: Survey;
  questions: any[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionContainer = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionContent = styled.div`
  padding: 16px;
`;

const EditButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  color: #4a5568;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #f7fafc;
  }
`;

const SurveyDetail = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  font-weight: 500;
  color: #4a5568;
`;

const DetailValue = styled.div`
  color: #1c1c1c;
  max-width: 60%;
  text-align: right;
`;

const Badge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  
  ${props => {
    switch (props.status) {
      case 'Draft':
        return `
          background-color: #e2e8f0;
          color: #4a5568;
        `;
      case 'Active':
        return `
          background-color: #c6f6d5;
          color: #2f855a;
        `;
      case 'Closed':
        return `
          background-color: #fed7d7;
          color: #c53030;
        `;
      default:
        return '';
    }
  }}
`;

const QuestionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const QuestionItem = styled.li`
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:nth-child(odd) {
    background: #f8f9fa;
  }
`;

const QuestionNumber = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #b7a36a;
  color: white;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 8px;
`;

const SummaryContainer = styled.div`
  background: #fffcf5;
  border: 1px solid #b7a36a;
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SummaryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const SummaryItem = styled.div`
  flex: 1;
  min-width: 200px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SummaryValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1c1c1c;
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  color: #4a5568;
  text-align: center;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  color: #4a5568;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background: #f7fafc;
  }
`;

const ReviewStep: React.FC<ReviewStepProps> = ({ survey, questions }) => {
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get question text by ID
  const getQuestionText = (id: string) => {
    const question = questions.find(q => q._id === id);
    if (!question || !question.versions || question.versions.length === 0) {
      return 'Unknown Question';
    }
    return question.versions[question.versions.length - 1].questionText;
  };
  
  // Calculate survey duration in days
  const surveyDuration = Math.ceil((survey.endDate.getTime() - survey.startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Generate public survey URL
  const publicSurveyUrl = `https://app.bioptrics.com/survey/${survey.publicSlug || survey._id}`;
  
  // Handle copy link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicSurveyUrl);
    alert('Survey link copied to clipboard!');
  };
  
  return (
    <Container>
      {/* Basic Survey Information */}
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>
            <FiClipboard />
            Survey Details
          </SectionTitle>
          <EditButton onClick={() => window.scrollTo(0, 0)}>
            <FiEdit size={14} />
            Edit
          </EditButton>
        </SectionHeader>
        <SectionContent>
          <SurveyDetail>
            <DetailLabel>Title</DetailLabel>
            <DetailValue>{survey.title}</DetailValue>
          </SurveyDetail>
          <SurveyDetail>
            <DetailLabel>Description</DetailLabel>
            <DetailValue>{survey.description}</DetailValue>
          </SurveyDetail>
          <SurveyDetail>
            <DetailLabel>Status</DetailLabel>
            <DetailValue>
              <Badge status={survey.status}>{survey.status}</Badge>
            </DetailValue>
          </SurveyDetail>
          <SurveyDetail>
            <DetailLabel>Public URL</DetailLabel>
            <DetailValue>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                <span>{publicSurveyUrl}</span>
                <CopyButton onClick={handleCopyLink}>
                  <FiLink size={12} />
                  Copy
                </CopyButton>
              </div>
            </DetailValue>
          </SurveyDetail>
        </SectionContent>
      </SectionContainer>
      
      {/* Schedule Information */}
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>
            <FiCalendar />
            Schedule
          </SectionTitle>
          <EditButton onClick={() => window.scrollTo(0, 0)}>
            <FiEdit size={14} />
            Edit
          </EditButton>
        </SectionHeader>
        <SectionContent>
          <SurveyDetail>
            <DetailLabel>Start Date</DetailLabel>
            <DetailValue>{formatDate(survey.startDate)}</DetailValue>
          </SurveyDetail>
          <SurveyDetail>
            <DetailLabel>End Date</DetailLabel>
            <DetailValue>{formatDate(survey.endDate)}</DetailValue>
          </SurveyDetail>
          <SurveyDetail>
            <DetailLabel>Duration</DetailLabel>
            <DetailValue>{surveyDuration} days</DetailValue>
          </SurveyDetail>
        </SectionContent>
      </SectionContainer>
      
      {/* Questions */}
      <SectionContainer>
        <SectionHeader>
          <SectionTitle>
            <FiCheckCircle />
            Questions ({survey.questions.length})
          </SectionTitle>
          <EditButton onClick={() => window.scrollTo(0, 0)}>
            <FiEdit size={14} />
            Edit
          </EditButton>
        </SectionHeader>
        <SectionContent>
          {survey.questions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#718096', padding: '16px' }}>
              No questions added yet.
            </div>
          ) : (
            <QuestionList>
              {survey.questions.map((questionId, index) => (
                <QuestionItem key={`question-${questionId}`}>
                  <QuestionNumber>{index + 1}</QuestionNumber>
                  {getQuestionText(questionId)}
                </QuestionItem>
              ))}
            </QuestionList>
          )}
        </SectionContent>
      </SectionContainer>
      
      {/* Summary */}
      <SummaryContainer>
        <SummaryTitle>
          <FiAlertCircle />
          Survey Summary
        </SummaryTitle>
        <SummaryList>
          <SummaryItem>
            <SummaryValue>{survey.questions.length}</SummaryValue>
            <SummaryLabel>Questions</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>{surveyDuration}</SummaryValue>
            <SummaryLabel>Days Duration</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>
              <FiUsers />
            </SummaryValue>
            <SummaryLabel>Anonymous Responses</SummaryLabel>
          </SummaryItem>
        </SummaryList>
      </SummaryContainer>
    </Container>
  );
};

export default ReviewStep;

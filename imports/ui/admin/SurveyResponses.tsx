import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys, SurveyResponses as SurveyResponsesCollection } from '/imports/api/surveys';
import styled from 'styled-components';
import { FiChevronDown, FiChevronRight, FiDownload, FiFilter } from 'react-icons/fi';

// Styled components
const Container = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e9e9e9;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #b0802b;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #9a7025;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid #ddd;
  font-weight: 600;
  color: #555;
`;

const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  vertical-align: top;
`;

const SurveyRow = styled.tr`
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const ResponseRow = styled.tr<{ expanded: boolean }>`
  background-color: ${props => props.expanded ? '#f5f5f5' : 'transparent'};
`;

const ResponseDetails = styled.div`
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  margin-top: 8px;
`;

const NoData = styled.div`
  text-align: center;
  padding: 32px;
  color: #777;
  font-style: italic;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: #777;
  
  &:hover {
    color: #333;
  }
`;

// Use the actual types from the collections
interface SurveyResponse {
  _id?: string;
  surveyId: string;
  answers: Record<string, any>;
  submittedAt: Date;
}

interface Survey {
  _id?: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  color?: string;
  createdBy?: string;
  shareToken?: string;
}

const SurveyResponses: React.FC = () => {
  // State for expanded rows
  const [expandedSurveys, setExpandedSurveys] = React.useState<Record<string, boolean>>({});
  const [expandedResponses, setExpandedResponses] = React.useState<Record<string, boolean>>({});
  
  // Load surveys and responses
  const { surveys, responses, loading, error } = useTracker(() => {
    try {
      const surveysHandle = Meteor.subscribe('surveys.all');
      const responsesHandle = Meteor.subscribe('survey_responses.all');
      
      const isLoading = !surveysHandle.ready() || !responsesHandle.ready();
      
      // Only fetch data if subscriptions are ready
      let surveyDocs: Survey[] = [];
      let responseDocs: SurveyResponse[] = [];
      
      if (!isLoading) {
        surveyDocs = Surveys.find({}, { sort: { updatedAt: -1 } }).fetch() || [];
        responseDocs = SurveyResponsesCollection.find({}).fetch() || [];
      }
      
      return {
        surveys: surveyDocs,
        responses: responseDocs,
        loading: isLoading,
        error: null as string | null
      };
    } catch (err: unknown) {
      console.error('Error loading survey responses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load survey responses';
      return {
        surveys: [] as Survey[],
        responses: [] as SurveyResponse[],
        loading: false,
        error: errorMessage
      };
    }
  }, []);
  
  // Group responses by survey
  const responsesBySurvey = React.useMemo(() => {
    const grouped: Record<string, SurveyResponse[]> = {};
    
    if (responses) {
      responses.forEach(response => {
        if (!grouped[response.surveyId]) {
          grouped[response.surveyId] = [];
        }
        grouped[response.surveyId].push(response);
      });
    }
    
    return grouped;
  }, [responses]);
  
  // Toggle survey expansion
  const toggleSurveyExpansion = (surveyId: string) => {
    setExpandedSurveys(prev => ({
      ...prev,
      [surveyId]: !prev[surveyId]
    }));
  };
  
  // Toggle response expansion
  const toggleResponseExpansion = (responseId: string) => {
    setExpandedResponses(prev => ({
      ...prev,
      [responseId]: !prev[responseId]
    }));
  };
  
  // Export responses as CSV
  const exportResponses = (surveyId: string, surveyTitle: string) => {
    const surveyResponses = responsesBySurvey[surveyId] || [];
    if (surveyResponses.length === 0) return;
    
    // Get all unique question IDs
    const allQuestionIds = new Set<string>();
    surveyResponses.forEach(response => {
      Object.keys(response.answers).forEach(qId => allQuestionIds.add(qId));
    });
    
    // Create CSV header
    let csv = 'Response ID,Submitted Date';
    allQuestionIds.forEach(qId => {
      csv += `,Question ${qId}`;
    });
    csv += '\n';
    
    // Add response data
    surveyResponses.forEach(response => {
      // Use a default ID if _id is undefined
      const responseId = response._id || 'unknown';
      csv += `${responseId},${response.submittedAt.toISOString()}`;
      
      allQuestionIds.forEach(qId => {
        const answer = response.answers[qId];
        let formattedAnswer = '';
        
        if (answer !== undefined) {
          if (typeof answer === 'object') {
            if (answer.label) {
              formattedAnswer = answer.label;
            } else if (Array.isArray(answer)) {
              formattedAnswer = answer.map((a: any) => a.label || a).join('; ');
            } else {
              formattedAnswer = JSON.stringify(answer);
            }
          } else {
            formattedAnswer = String(answer);
          }
        }
        
        // Escape commas and quotes
        formattedAnswer = formattedAnswer.replace(/"/g, '""');
        if (formattedAnswer.includes(',')) {
          formattedAnswer = `"${formattedAnswer}"`;
        }
        
        csv += `,${formattedAnswer}`;
      });
      
      csv += '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    // Ensure title is a string before using replace
    const safeTitle = (surveyTitle || 'survey').replace(/\s+/g, '_');
    link.setAttribute('download', `${safeTitle}_responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Format response for display
  const formatResponse = (answer: any): string => {
    if (answer === undefined || answer === null) {
      return 'No response';
    }
    
    if (typeof answer === 'object') {
      if (answer.label) {
        return answer.label;
      } else if (Array.isArray(answer)) {
        return answer.map((a: any) => a.label || a).join(', ');
      } else {
        return JSON.stringify(answer);
      }
    }
    
    return String(answer);
  };
  
  if (loading) {
    return <Container>Loading survey responses...</Container>;
  }
  
  return (
    <Container>
      <Header>
        <Title>Survey Responses</Title>
        <FilterContainer>
          <FilterButton>
            <FiFilter />
            Filter
          </FilterButton>
        </FilterContainer>
      </Header>
      
      {surveys.length === 0 ? (
        <NoData>No surveys found</NoData>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th style={{ width: '5%' }}></Th>
              <Th style={{ width: '30%' }}>Survey</Th>
              <Th style={{ width: '15%' }}>Created</Th>
              <Th style={{ width: '15%' }}>Last Updated</Th>
              <Th style={{ width: '15%' }}>Status</Th>
              <Th style={{ width: '10%' }}>Responses</Th>
              <Th style={{ width: '10%' }}>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {surveys.map(survey => {
              // Ensure survey._id is defined with a fallback
              const surveyId = survey._id || `survey-${Math.random().toString(36).substring(2, 9)}`;
              const surveyResponses = responsesBySurvey[surveyId] || [];
              const isExpanded = expandedSurveys[surveyId] || false;
              
              return (
                <React.Fragment key={surveyId}>
                  <SurveyRow onClick={() => toggleSurveyExpansion(surveyId)}>
                    <Td>
                      <ExpandButton>
                        {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                      </ExpandButton>
                    </Td>
                    <Td>
                      <div style={{ fontWeight: 500 }}>{survey.title}</div>
                      {survey.description && (
                        <div style={{ fontSize: '0.9em', color: '#777', marginTop: 4 }}>
                          {survey.description}
                        </div>
                      )}
                    </Td>
                    <Td>{survey.createdAt.toLocaleDateString()}</Td>
                    <Td>{survey.updatedAt.toLocaleDateString()}</Td>
                    <Td>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 12, 
                        fontSize: '0.85em',
                        backgroundColor: survey.published ? '#e6f7e6' : '#f7f7e7',
                        color: survey.published ? '#2e7d32' : '#9e9d24'
                      }}>
                        {survey.published ? 'Published' : 'Draft'}
                      </span>
                    </Td>
                    <Td>{surveyResponses.length}</Td>
                    <Td>
                      {surveyResponses.length > 0 && (
                        <ExportButton onClick={(e) => {
                          e.stopPropagation();
                          exportResponses(surveyId, survey.title || 'Survey');
                        }}>
                          <FiDownload />
                          Export
                        </ExportButton>
                      )}
                    </Td>
                  </SurveyRow>
                  
                  {isExpanded && (
                    <tr>
                      <Td colSpan={7} style={{ padding: 0 }}>
                        <div style={{ padding: '0 16px 16px 48px' }}>
                          {surveyResponses.length === 0 ? (
                            <NoData>No responses for this survey</NoData>
                          ) : (
                            <Table>
                              <thead>
                                <tr>
                                  <Th style={{ width: '5%' }}></Th>
                                  <Th style={{ width: '30%' }}>Response ID</Th>
                                  <Th style={{ width: '65%' }}>Submitted</Th>
                                </tr>
                              </thead>
                              <tbody>
                                {surveyResponses.map((response: SurveyResponse) => {
                                  const responseId = response._id || 'unknown';
                                  const isResponseExpanded = expandedResponses[responseId] || false;
                                  
                                  return (
                                    <React.Fragment key={responseId}>
                                      <ResponseRow 
                                        expanded={isResponseExpanded}
                                        onClick={() => toggleResponseExpansion(responseId)}
                                      >
                                        <Td>
                                          <ExpandButton>
                                            {isResponseExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                          </ExpandButton>
                                        </Td>
                                        <Td>{responseId}</Td>
                                        <Td>{response.submittedAt.toLocaleString()}</Td>
                                      </ResponseRow>
                                      
                                      {isResponseExpanded && (
                                        <tr>
                                          <Td colSpan={3} style={{ padding: '0 16px 16px 48px' }}>
                                            <ResponseDetails>
                                              <h4>Response Details</h4>
                                              {Object.entries(response.answers).map(([questionId, answer]) => (
                                                <div key={questionId} style={{ marginBottom: 12 }}>
                                                  <div style={{ fontWeight: 500 }}>Question ID: {questionId}</div>
                                                  <div style={{ marginTop: 4 }}>
                                                    {formatResponse(answer)}
                                                  </div>
                                                </div>
                                              ))}
                                            </ResponseDetails>
                                          </Td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </Table>
                          )}
                        </div>
                      </Td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default SurveyResponses;

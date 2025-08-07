import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiChevronUp, FiMessageSquare } from 'react-icons/fi';
import { FaUsers, FaTags, FaChartPie, FaHeart } from 'react-icons/fa';

// Styled components
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: #ffffff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const IconContainer = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${props => `${props.color}20`};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  padding: 0;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const ResponseDetailsContainer = styled.div`
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 0 0 8px 8px;
`;

const ResponseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const QuestionItem = styled.div`
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const SectionName = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
`;

const QuestionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const AnswerText = styled.div`
  font-size: 14px;
  color: #334155;
`;

const Spinner = styled.div`
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid #552a47;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 40px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
`;

const PaginationButton = styled.button<{ disabled: boolean }>`
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: ${props => props.disabled ? '#f1f5f9' : '#ffffff'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  color: ${props => props.disabled ? '#94a3b8' : '#64748b'};
  
  &:hover {
    background-color: ${props => props.disabled ? '#f1f5f9' : '#f8fafc'};
  }
`;

const PaginationInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 14px;
  color: #64748b;
`;

interface ResponsesTabProps {
  surveyResponses: any[];
  isLoadingResponses: boolean;
  responseStats: any;
  surveyData: any;
}

const ResponsesTab: React.FC<ResponsesTabProps> = ({ 
  surveyResponses, 
  isLoadingResponses, 
  responseStats, 
  surveyData 
}) => {
  const [expandedResponseIds, setExpandedResponseIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Reset pagination when responses change
  useEffect(() => {
    setCurrentPage(1);
  }, [surveyResponses]);

  const toggleResponseDetails = (responseId: string) => {
    setExpandedResponseIds(prev => 
      prev.includes(responseId) 
        ? prev.filter(id => id !== responseId) 
        : [...prev, responseId]
    );
  };

  // Filter responses based on search term
  const filteredResponses = surveyResponses.filter(response => {
    if (!searchTerm) return true;
    
    const respondentId = response.respondentId || response._id || '';
    return respondentId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResponses = filteredResponses.slice(indexOfFirstItem, indexOfLastItem);
  
  // Helper function to get question details
  const getQuestionDetails = (questionId: string, sectionId: string, surveyData: any) => {
    let questionText = 'Question not found';
    let sectionName = '';
    
    // Early return if no survey data
    if (!surveyData) return { questionText, sectionName };
    
    // Try multiple approaches to find the question
    
    // Approach 1: Check in surveySections (primary structure)
    if (surveyData.surveySections && Array.isArray(surveyData.surveySections)) {
      const section = surveyData.surveySections.find((s: any) => s._id === sectionId);
      if (section) {
        sectionName = section.title || section.name || 'Unnamed Section';
        
        if (section.questions && Array.isArray(section.questions)) {
          const question = section.questions.find((q: any) => q._id === questionId);
          if (question) {
            questionText = question.questionText || question.text || 'No question text';
            return { questionText, sectionName };
          }
        }
      }
    }
    
    // Approach 2: Check in sections (alternative structure)
    if (surveyData.sections && Array.isArray(surveyData.sections)) {
      const section = surveyData.sections.find((s: any) => s._id === sectionId);
      if (section) {
        sectionName = section.title || section.name || 'Unnamed Section';
        
        if (section.questions && Array.isArray(section.questions)) {
          const question = section.questions.find((q: any) => q._id === questionId);
          if (question) {
            questionText = question.questionText || question.text || 'No question text';
            return { questionText, sectionName };
          }
        }
      }
    }
    
    // Approach 3: Check in direct questions array (for non-sectioned questions)
    if (surveyData.questions && Array.isArray(surveyData.questions)) {
      const question = surveyData.questions.find((q: any) => q._id === questionId);
      if (question) {
        questionText = question.questionText || question.text || 'No question text';
        return { questionText, sectionName };
      }
    }
    
    // Approach 4: Check in sectionQuestions (used in EnhancedSurveyBuilder)
    if (surveyData.sectionQuestions && Array.isArray(surveyData.sectionQuestions)) {
      const question = surveyData.sectionQuestions.find((q: any) => q.id === questionId || q._id === questionId);
      if (question) {
        questionText = question.questionText || question.text || 'No question text';
        
        // Try to find section name if we have a sectionId
        if (question.sectionId && (surveyData.sections || surveyData.surveySections)) {
          const sections = surveyData.sections || surveyData.surveySections;
          const section = sections.find((s: any) => s._id === question.sectionId || s.id === question.sectionId);
          if (section) {
            sectionName = section.title || section.name || 'Unnamed Section';
          }
        }
        
        return { questionText, sectionName };
      }
    }
    
    // If we still haven't found the question, log for debugging
    console.log(`Question not found: ID=${questionId}, Section=${sectionId}`);
    
    return { questionText, sectionName };
  };

  return (
    <div className="survey-responses-container">
      {isLoadingResponses ? (
        <Spinner />
      ) : surveyResponses.length > 0 ? (
        <div>
          {/* Stats Summary Bar */}
          <StatsContainer>
            <StatCard>
              <IconContainer color="#4285F4">
                <FaUsers />
              </IconContainer>
              <StatContent>
                <StatValue>{responseStats.totalResponses}</StatValue>
                <StatLabel>Total Responses</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <IconContainer color="#0F9D58">
                <FaTags />
              </IconContainer>
              <StatContent>
                <StatValue>{responseStats.totalTags}</StatValue>
                <StatLabel>Total Tags</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <IconContainer color="#AA47BC">
                <FaChartPie />
              </IconContainer>
              <StatContent>
                <StatValue>{responseStats.completionRate}%</StatValue>
                <StatLabel>Completion Rate</StatLabel>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <IconContainer color="#F4B400">
                <FaHeart />
              </IconContainer>
              <StatContent>
                <StatValue>{responseStats.avgEngagement}%</StatValue>
                <StatLabel>Avg. Engagement</StatLabel>
              </StatContent>
            </StatCard>
          </StatsContainer>
          
          {/* Responses Table */}
          <div style={{ marginTop: '20px', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>All Responses</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Search responses..." 
                  style={{ 
                    padding: '8px 12px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 150px 120px', 
                gap: '16px', 
                padding: '12px 16px', 
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                fontWeight: 600,
                fontSize: '14px',
                color: '#64748b'
              }}>
                <div>Respondent ID</div>
                <div>Date</div>
                <div style={{ textAlign: 'center' }}>Answers</div>
              </div>
              <div>
                {currentResponses.map((response: any, index: number) => (
                  <div key={response._id}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 150px 120px',
                        gap: '16px',
                        padding: '16px',
                        borderBottom: expandedResponseIds.includes(response._id) ? 'none' : '1px solid #e2e8f0',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div>
                          {response.respondentId || response._id}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {response.submittedAt ? new Date(response.submittedAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ExpandButton 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleResponseDetails(response._id);
                          }}
                        >
                          {expandedResponseIds.includes(response._id) ? (
                            <>
                              <span style={{ marginRight: '4px' }}>Hide Answers</span>
                              <FiChevronUp size={16} />
                            </>
                          ) : (
                            <>
                              <span style={{ marginRight: '4px' }}>Show Answers</span>
                              <FiChevronDown size={16} />
                            </>
                          )}
                        </ExpandButton>
                      </div>
                    </div>
                    {expandedResponseIds.includes(response._id) && (
                      <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                        <ResponseDetailsContainer>
                          {response.responses && Array.isArray(response.responses) && response.responses.length > 0 ? (
                            <>
                              <div style={{ marginBottom: '16px', fontSize: '14px', color: '#64748b', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>Showing {response.responses.length} answers</span>
                                <span style={{ fontSize: '13px', color: '#94a3b8' }}>3-column view</span>
                              </div>
                              <ResponseGrid>
                                {response.responses.map((item: any, idx: number) => {
                                  const { questionText, sectionName } = getQuestionDetails(
                                    item.questionId,
                                    item.sectionId,
                                    surveyData
                                  );
                                  
                                  return (
                                    <QuestionItem key={`${item.questionId}-${idx}`}>
                                      {sectionName && <SectionName>{sectionName}</SectionName>}
                                      <QuestionTitle>{questionText}</QuestionTitle>
                                      <AnswerText>
                                        {item.answer !== undefined ? (
                                          item.answer
                                        ) : item.answers ? (
                                          Array.isArray(item.answers) ? (
                                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                                              {item.answers.map((ans: string, i: number) => (
                                                <li key={i}>{ans}</li>
                                              ))}
                                            </ul>
                                          ) : (
                                            JSON.stringify(item.answers)
                                          )
                                        ) : (
                                          'No answer provided'
                                        )}
                                      </AnswerText>
                                    </QuestionItem>
                                  );
                                })}
                              </ResponseGrid>
                            </>
                          ) : (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                              No detailed response data available
                            </div>
                          )}
                        </ResponseDetailsContainer>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {filteredResponses.length > itemsPerPage && (
                <PaginationContainer>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <PaginationButton 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </PaginationButton>
                    <PaginationInfo>
                      Page {currentPage} of {Math.ceil(filteredResponses.length / itemsPerPage)}
                    </PaginationInfo>
                    <PaginationButton 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredResponses.length / itemsPerPage)))}
                      disabled={currentPage === Math.ceil(filteredResponses.length / itemsPerPage)}
                    >
                      Next
                    </PaginationButton>
                  </div>
                </PaginationContainer>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '40px 20px', 
          textAlign: 'center', 
          color: '#64748b',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px dashed #cbd5e1'
        }}>
          <FiMessageSquare size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px', color: '#475569' }}>No Responses Yet</h3>
          <p>Once people start responding to your survey, their responses will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ResponsesTab;

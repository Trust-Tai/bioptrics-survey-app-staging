import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { FaUsers, FaTags, FaChartPie, FaHeart, FaClock, FaPercentage, FaTimes } from 'react-icons/fa';
import { SurveyResponses } from '../../../features/surveys/api/surveyResponses';
import { IncompleteSurveyResponses } from '../../../features/surveys/api/incompleteSurveyResponses';

// Helper function to calculate total questions in a survey
const getTotalQuestionCount = (survey: any): number => {
  if (!survey) return 1; // Default to 1 to avoid division by zero
  
  // If survey has sections, count questions across all sections
  if (survey.sections && Array.isArray(survey.sections)) {
    return survey.sections.reduce((total: number, section: any) => {
      return total + (section.questions?.length || 0);
    }, 0) || 1; // Default to 1 if no questions found
  }
  
  // If survey has questions directly (not in sections)
  if (survey.questions && Array.isArray(survey.questions)) {
    return survey.questions.length || 1;
  }
  
  return 1; // Default fallback
};

// Helper function to calculate progress percentage
const calculateProgress = (responses: any[], survey: any): number => {
  if (!responses || !Array.isArray(responses) || responses.length === 0) return 0;
  
  const totalQuestions = getTotalQuestionCount(survey);
  // For incomplete responses, we count the number of answered questions
  const answeredQuestions = responses.filter(response => 
    response && (response.answer !== undefined || response.answers !== undefined)
  ).length;
  
  return Math.min(Math.round((answeredQuestions / totalQuestions) * 100), 100);
};

// Styled components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  width: 90%;
  max-width: 1400px;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
  
  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background-color: #f8f9fa;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #552a47;
  font-size: 24px;
  font-weight: 700;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f1f3f5;
    color: #212529;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  flex: 1;
  overflow-y: auto;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  overflow-x: auto;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
`;

const IconContainer = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${props => `${props.color}15`};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 16px;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #212529;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6c757d;
  margin-top: 4px;
`;

const ResponsesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
`;

const TableHeader = styled.thead`
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const TableHeaderCell = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e9ecef;
  &:hover {
    background-color: #f8f9fa;
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px 8px;
  margin-left: 8px;
  border-radius: 4px;
  font-size: 12px;
  
  &:hover {
    background-color: #e9ecef;
    color: #212529;
  }
`;

const ResponseDetails = styled.div`
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 14px;
`;

const QuestionItem = styled.div`
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const QuestionTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const SectionName = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
`;

const AnswerText = styled.div`
  padding: 4px 0;
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #212529;
`;

const StatusBadge = styled.span<{ complete: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.complete ? '#e6f7ed' : '#fff4e5'};
  color: ${props => props.complete ? '#0a8043' : '#ff9800'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background-color: ${props => {
    if (props.percentage >= 70) return '#0a8043';
    if (props.percentage >= 30) return '#ff9800';
    return '#dc3545';
  }};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #6c757d;
`;

interface SurveyResponsesModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyId: string;
  surveyTitle: string;
}

const SurveyResponsesModal: React.FC<SurveyResponsesModalProps> = ({ 
  isOpen, 
  onClose, 
  surveyId, 
  surveyTitle 
}) => {
  const [isLoadingResponses, setIsLoadingResponses] = useState(true);
  const [surveyResponses, setSurveyResponses] = useState<any[]>([]);
  const [expandedResponseIds, setExpandedResponseIds] = useState<string[]>([]);
  const [surveyData, setSurveyData] = useState<any>(null);
  const [responseStats, setResponseStats] = useState({
    totalResponses: 0,
    totalTags: 0,
    completionRate: 0,
    avgEngagement: 0,
    timeToComplete: 0,
    responseRate: 0
  });

  // Toggle expanded state for a response
  const toggleResponseDetails = (responseId: string) => {
    setExpandedResponseIds(prev => 
      prev.includes(responseId) 
        ? prev.filter(id => id !== responseId)
        : [...prev, responseId]
    );
  };

  // Calculate engagement score for a response
  const calculateEngagementScore = (response: any) => {
    // Base score: 50 for completed, 25 for incomplete
    let score = response.isCompleted ? 50 : 25;
    
    // Add points for each answered question (max 50 additional points)
    const responseCount = response.responses?.length || 0;
    const additionalPoints = Math.min(responseCount * 5, 50);
    
    return score + additionalPoints;
  };
  
  // Helper function to get question details from survey data
  const getQuestionDetails = (questionId: string, sectionId?: string) => {
    if (!surveyData) return { questionText: "Unknown Question", sectionName: "" };
    
    let questionText = "Unknown Question";
    let sectionName = "";
    
    // Debug the question we're looking for
    console.log(`Looking for question ID: ${questionId}, section ID: ${sectionId || 'none'}`);
    
    // APPROACH 1: Direct lookup in questions array if it exists
    if (surveyData.questions && Array.isArray(surveyData.questions)) {
      const question = surveyData.questions.find((q: any) => 
        q._id === questionId || q.id === questionId
      );
      
      if (question) {
        questionText = question.text || question.title || question.question || question.label || "Question";
        console.log(`Found question in direct questions array: ${questionText}`);
      }
    }
    
    // APPROACH 2: Check in sections
    if (questionText === "Unknown Question" && surveyData.sections && Array.isArray(surveyData.sections)) {
      // First try with section ID if provided
      if (sectionId) {
        const section = surveyData.sections.find((s: any) => 
          s._id === sectionId || s.id === sectionId
        );
        
        if (section) {
          sectionName = section.title || section.name || "";
          
          if (section.questions && Array.isArray(section.questions)) {
            const question = section.questions.find((q: any) => 
              q._id === questionId || q.id === questionId
            );
            
            if (question) {
              questionText = question.text || question.title || question.question || question.label || "Question";
              console.log(`Found question in section by ID: ${questionText}`);
            }
          }
        }
      }
      
      // If still not found, search all sections
      if (questionText === "Unknown Question") {
        for (const section of surveyData.sections) {
          if (section.questions && Array.isArray(section.questions)) {
            const question = section.questions.find((q: any) => 
              q._id === questionId || q.id === questionId
            );
            
            if (question) {
              questionText = question.text || question.title || question.question || question.label || "Question";
              sectionName = section.title || section.name || "";
              console.log(`Found question in section search: ${questionText}`);
              break;
            }
          }
        }
      }
    }
    
    // APPROACH 3: Check in selectedQuestions object
    if (questionText === "Unknown Question" && surveyData.selectedQuestions) {
      // Try to find in selectedQuestions
      const questionKeys = Object.keys(surveyData.selectedQuestions);
      for (const key of questionKeys) {
        const question = surveyData.selectedQuestions[key];
        if (question && typeof question === 'object') {
          if ((question._id === questionId || question.id === questionId)) {
            questionText = question.text || question.title || question.question || question.label || "Question";
            console.log(`Found question in selectedQuestions: ${questionText}`);
            break;
          }
        }
      }
    }
    
    // APPROACH 4: Check in siteTextQuestions array
    if (questionText === "Unknown Question" && surveyData.siteTextQuestions && Array.isArray(surveyData.siteTextQuestions)) {
      const question = surveyData.siteTextQuestions.find((q: any) => 
        q._id === questionId || q.id === questionId
      );
      
      if (question) {
        questionText = question.text || question.title || question.question || question.label || "Question";
        console.log(`Found question in siteTextQuestions: ${questionText}`);
      }
    }
    
    // APPROACH 5: Check in siteTextQForm object
    if (questionText === "Unknown Question" && surveyData.siteTextQForm) {
      const formKeys = Object.keys(surveyData.siteTextQForm);
      for (const key of formKeys) {
        const item = surveyData.siteTextQForm[key];
        if (item && typeof item === 'object' && (item._id === questionId || item.id === questionId)) {
          questionText = item.text || item.title || item.question || item.label || "Question";
          console.log(`Found question in siteTextQForm: ${questionText}`);
          break;
        }
      }
    }
    
    // APPROACH 6: Last resort - check for any property in the survey that might match the question ID
    if (questionText === "Unknown Question") {
      // Recursively search the survey object for the question ID
      const findQuestionInObject = (obj: any, depth = 0): any => {
        if (!obj || typeof obj !== 'object' || depth > 5) return null;
        
        // Check if this object is the question we're looking for
        if ((obj._id === questionId || obj.id === questionId) && 
            (obj.text || obj.title || obj.question || obj.label)) {
          return obj;
        }
        
        // Search in arrays
        if (Array.isArray(obj)) {
          for (const item of obj) {
            const result = findQuestionInObject(item, depth + 1);
            if (result) return result;
          }
        } else {
          // Search in object properties
          for (const key of Object.keys(obj)) {
            if (key !== '_id' && key !== 'id' && typeof obj[key] === 'object') {
              const result = findQuestionInObject(obj[key], depth + 1);
              if (result) return result;
            }
          }
        }
        
        return null;
      };
      
      const foundQuestion = findQuestionInObject(surveyData);
      if (foundQuestion) {
        questionText = foundQuestion.text || foundQuestion.title || foundQuestion.question || foundQuestion.label || "Question";
        console.log(`Found question in deep search: ${questionText}`);
      }
    }
    
    return { questionText, sectionName };
  };

  // Load survey responses
  useEffect(() => {
    if (isOpen && surveyId) {
      setIsLoadingResponses(true);
      const completedSubscription = Meteor.subscribe('surveyResponses.bySurvey', surveyId);
      const incompleteSubscription = Meteor.subscribe('incompleteSurveyResponses.all');
      
      const checkSubscription = setInterval(() => {
        if (completedSubscription.ready() && incompleteSubscription.ready()) {
          clearInterval(checkSubscription);
          
          const completedResponses = SurveyResponses.find({ surveyId }).fetch();
          const incompleteResponses = IncompleteSurveyResponses.find({ surveyId, isCompleted: false }).fetch();
          
          // Get survey to calculate response rate
          Meteor.call('surveys.get', surveyId, (error: any, survey: any) => {
            if (error) {
              console.error('Error fetching survey:', error);
            } else {
              // Store survey data for question details
              console.log('Survey data structure:', JSON.stringify(survey, null, 2));
              setSurveyData(survey);
              const formattedResponses = [
                ...completedResponses.map(response => ({
                  _id: response._id,
                  respondentName: response.demographics?.name || (response.userId ? 'User ' + response.userId.substring(0, 5) : 'Anonymous'),
                  email: response.demographics?.email || 'No email provided',
                  submittedAt: response.endTime || response.updatedAt,
                  isComplete: true,
                  progress: 100,
                  responses: response.responses || [],
                  timeToComplete: response.completionTime || 0,
                  engagementScore: response.engagementScore || calculateEngagementScore({...response, isCompleted: true, responses: response.responses || []})
                })),
                ...incompleteResponses.map(response => ({
                  _id: response._id,
                  respondentName: 'Anonymous',
                  email: 'No email provided',
                  submittedAt: response.lastUpdatedAt,
                  isComplete: false,
                  progress: 50, // Always show 50% for incomplete responses
                  responses: response.responses || [],
                  timeToComplete: 0,
                  engagementScore: response.engagementScore || calculateEngagementScore({...response, isCompleted: false, responses: response.responses || []})
                }))
              ];
              
              // Sort responses by submission date (newest first)
              formattedResponses.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
              
              // Calculate stats
              const totalResponses = formattedResponses.length;
              const completedResponsesForStats = formattedResponses.filter(r => r.isComplete);
              const completionRate = totalResponses > 0 ? Math.round((completedResponsesForStats.length / totalResponses) * 100) : 0;
              
              // Calculate total engagement and average
              const totalEngagement = formattedResponses.reduce((sum, r) => sum + (r.engagementScore || 0), 0);
              const avgEngagement = totalResponses > 0 ? Math.round(totalEngagement / totalResponses) : 0;
              
              // Calculate average time to complete (in seconds)
              const totalTime = completedResponsesForStats.reduce((sum, r) => sum + (r.timeToComplete || 0), 0);
              const avgTimeToComplete = completedResponsesForStats.length > 0 ? Math.round(totalTime / completedResponsesForStats.length) : 0;
              
              // Calculate response rate
              const totalInvited = survey.invitedCount || totalResponses;
              const responseRate = totalInvited > 0 ? Math.round((totalResponses / totalInvited) * 100) : 0;
              
              // Calculate total tags from the survey
              const totalTags = survey.selectedTags?.length || 0;
              
              // Update state
              setSurveyResponses(formattedResponses);
              setResponseStats({
                totalResponses,
                totalTags,
                completionRate,
                avgEngagement,
                timeToComplete: avgTimeToComplete,
                responseRate
              });
              setIsLoadingResponses(false);
            }
          });
        }
      }, 100);
      
      return () => {
        clearInterval(checkSubscription);
        completedSubscription.stop();
        incompleteSubscription.stop();
      };
    }
  }, [isOpen, surveyId]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{surveyTitle} - Responses</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          {isLoadingResponses ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <div style={{
                border: '6px solid #f3e9d7',
                borderTop: '6px solid #552a47',
                borderRadius: '50%',
                width: 56,
                height: 56,
                animation: 'spin 1s linear infinite',
              }} />
              <style>{`@keyframes spin {0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);}}`}</style>
            </div>
          ) : surveyResponses.length > 0 ? (
            <>
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
                
                <StatCard>
                  <IconContainer color="#DB4437">
                    <FaClock />
                  </IconContainer>
                  <StatContent>
                    <StatValue>
                      {responseStats.timeToComplete > 60 
                        ? `${Math.floor(responseStats.timeToComplete / 60)}m ${responseStats.timeToComplete % 60}s` 
                        : `${responseStats.timeToComplete}s`}
                    </StatValue>
                    <StatLabel>Time to Complete</StatLabel>
                  </StatContent>
                </StatCard>
                
                <StatCard>
                  <IconContainer color="#34A853">
                    <FaPercentage />
                  </IconContainer>
                  <StatContent>
                    <StatValue>{responseStats.responseRate}%</StatValue>
                    <StatLabel>Response Rate</StatLabel>
                  </StatContent>
                </StatCard>
              </StatsContainer>
              
              {/* Responses Table */}
              <ResponsesTable>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>Respondent</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Date Submitted</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {surveyResponses.map(response => (
                    <React.Fragment key={response._id}>
                      <TableRow>
                        <TableCell>{response.respondentName}</TableCell>
                        <TableCell>{response.email}</TableCell>
                        <TableCell>
                          {new Date(response.submittedAt).toLocaleDateString()} at {new Date(response.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div>
                              <StatusBadge complete={response.isComplete}>
                                {response.isComplete ? 'Complete' : 'Incomplete'}
                              </StatusBadge>
                              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                                Progress: {response.progress}%
                              </div>
                              <ProgressBar>
                                <ProgressFill percentage={response.progress} />
                              </ProgressBar>
                            </div>
                            <ExpandButton onClick={() => toggleResponseDetails(response._id)}>
                              {expandedResponseIds.includes(response._id) ? 'Hide Details' : 'Show Details'}
                            </ExpandButton>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedResponseIds.includes(response._id) && (
                        <tr>
                          <td colSpan={4}>
                            <ResponseDetails>
                              <h4 style={{ marginTop: 0, marginBottom: '16px' }}>Response Details</h4>
                              {response.responses && response.responses.length > 0 ? (
                                response.responses.map((answer: any, index: number) => {
                                  // Get question details using our helper function
                                  const { questionText, sectionName } = getQuestionDetails(answer.questionId, answer.sectionId);
                                  
                                  return (
                                    <QuestionItem key={index}>
                                      {sectionName && <SectionName>Section: {sectionName}</SectionName>}
                                      <QuestionTitle>{questionText}</QuestionTitle>
                                      <AnswerText>
                                        <strong>Answer:</strong> {answer.answer || 
                                          (answer.answers && Array.isArray(answer.answers) 
                                            ? answer.answers.join(", ") 
                                            : JSON.stringify(answer.answers || ""))}
                                      </AnswerText>
                                    </QuestionItem>
                                  );
                                })
                              ) : (
                                <div>No detailed response data available</div>
                              )}
                            </ResponseDetails>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </ResponsesTable>
            </>
          ) : (
            <EmptyState>
              <div style={{ fontSize: '24px', marginBottom: '16px' }}>No responses yet</div>
              <div>This survey hasn't received any responses yet.</div>
            </EmptyState>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SurveyResponsesModal;

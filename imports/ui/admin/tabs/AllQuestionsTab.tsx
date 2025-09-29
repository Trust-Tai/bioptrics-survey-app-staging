import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Meteor } from 'meteor/meteor';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FiAlertCircle, FiInfo } from 'react-icons/fi';

interface AllQuestionsTabProps {
  isLoading: boolean;
  surveyId?: string;
  filterParams?: {
    surveyIds?: string[];
    tagIds?: string[];
    questionIds?: string[];
    startDate?: string;
    endDate?: string;
  };
}

// Interface for analytics question data
interface AnalyticsQuestion {
  questionId: string;
  questionText: string;
  questionType: string;
  progress: Record<string, number>;
  responseCount?: number; // Add responseCount field
  latestResponses?: Array<{
    answer: string;
    date: Date;
  }>;
  surveyId?: string; // Add survey ID
  surveyTitle?: string; // Add survey title
}

// Interface for pagination data
interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

// Sample question response data
const sampleQuestionData = [
  {
    id: 'q1',
    text: 'I have the tools and resources I need to do my job effectively.',
    responses: {
      'Strongly Disagree': 4.9,
      'Disagree': 7.3,
      'Neutral': 30.0,
      'Agree': 39.7,
      'Strongly Agree': 18.2
    },
    stats: {
      mean: 3.6,
      median: 4,
      stdDev: 1.2
    },
    flags: []
  },
  {
    id: 'q2',
    text: 'My workspace is comfortable and conducive to productivity.',
    responses: {
      'Strongly Disagree': 3.2,
      'Disagree': 6.1,
      'Neutral': 36.0,
      'Agree': 35.2,
      'Strongly Agree': 19.4
    },
    stats: {
      mean: 3.7,
      median: 4,
      stdDev: 1.1
    },
    flags: ['high-neutral', 'high-variance']
  }
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const QuestionCard = styled.div`
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 24px;
`;

const QuestionText = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const FlagsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const Flag = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.type === 'high-neutral' ? '#f59e0b' : '#ef4444'};
  background-color: ${props => props.type === 'high-neutral' ? '#fef3c7' : '#fee2e2'};
  padding: 2px 8px;
  border-radius: 4px;
`;

const BarChartContainer = styled.div`
  margin-bottom: 24px;
  width: 100%;
`;

const BarContainer = styled.div`
  display: flex;
  height: 40px;
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 16px;
  background-color: #f1f5f9;
`;

const Bar = styled.div<{ width: number; color: string }>`
  width: ${props => props.width}%;
  background-color: ${props => props.color};
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${props => props.width > 0 ? '30px' : '0'};
`;

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
  justify-content: flex-start;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  margin-right: 16px;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
  flex-shrink: 0;
`;

const StatsContainer = styled.div`
  gap: 24px;
  margin-top: 16px;
  display: none;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #334155;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  color: #64748b;
`;

const LatestResponsesContainer = styled.div`
  margin-top: 16px;
`;

const ResponsesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const ResponseItem = styled.div`
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
`;

const ResponseText = styled.div`
  font-size: 14px;
  color: #334155;
  margin-bottom: 4px;
`;

const ResponseDate = styled.div`
  font-size: 12px;
  color: #64748b;
  font-style: italic;
`;

const ResponseCount = styled.div`
  display: flex;
  align-items: center;
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 16px;
`;

const PercentageLabel = styled.div<{ dark?: boolean }>`
  font-size: 12px;
  color: ${props => props.dark ? '#333' : 'white'};
  font-weight: 500;
  text-shadow: 0 0 2px rgba(0,0,0,0.2);
  pointer-events: none;
`;

// Pagination components
const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const PaginationInfo = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid ${props => props.active ? '#552a47' : '#e2e8f0'};
  background-color: ${props => props.active ? '#552a47' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#552a47' : '#f8fafc'};
    border-color: ${props => props.active ? '#552a47' : '#cbd5e1'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f1f5f9;
  }
`;

const PageSizeSelector = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #64748b;
  font-size: 14px;
  margin-left: 16px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

// Define the ref interface
export interface QuestionsTabRef {
  getAnalyticsQuestions: () => Promise<AnalyticsQuestion[]>;
}

const AllQuestionsTab = forwardRef<QuestionsTabRef, AllQuestionsTabProps>(({ isLoading: initialLoading, surveyId: propsSurveyId, filterParams }, ref) => {
  // State for loading status
  const [loading, setLoading] = useState(initialLoading);
  
  // State for analytics questions
  const [analyticsQuestions, setAnalyticsQuestions] = useState<AnalyticsQuestion[]>([]);
  
  // Always show dynamic data
  const [showDynamicData, setShowDynamicData] = useState(true);
  
  // State for survey details
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0
  });
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };
  
  // State for all questions (used for PDF export)
  const [allQuestionsForPdf, setAllQuestionsForPdf] = useState<AnalyticsQuestion[]>([]);
  
  // State to track if we're loading all questions for PDF
  const [loadingAllQuestions, setLoadingAllQuestions] = useState(false);

  // Function to fetch all questions for PDF export (without pagination)
  const fetchAllQuestionsForPdf = async () => {
    console.log('Starting to fetch all questions for PDF export...');
    setLoadingAllQuestions(true);
    
    // Create effective filter params
    const effectiveFilterParams = filterParams || {};
    
    // If propsSurveyId is provided and filterParams doesn't have surveyIds, add it
    if (propsSurveyId && (!effectiveFilterParams.surveyIds || effectiveFilterParams.surveyIds.length === 0)) {
      effectiveFilterParams.surveyIds = [propsSurveyId];
    }
    
    console.log('Filter params for fetching all questions:', effectiveFilterParams);
    
    return new Promise<AnalyticsQuestion[]>((resolve, reject) => {
      // Call the method without pagination to get all questions
      console.log('Calling getFilteredAnalyticsQuestions with large limit...');
      Meteor.call(
        'getFilteredAnalyticsQuestions',
        effectiveFilterParams,
        { page: 1, limit: 1000 }, // Use a large limit to get all questions
        (error: any, result: { questions: AnalyticsQuestion[], totalCount: number }) => {
          setLoadingAllQuestions(false);
          
          if (error) {
            console.error('Error fetching all questions for PDF:', error);
            reject(error);
            return;
          }
          
          if (!result) {
            console.error('No result returned from getFilteredAnalyticsQuestions');
            resolve([]);
            return;
          }
          
          if (!result.questions || !Array.isArray(result.questions)) {
            console.error('Invalid questions array returned:', result);
            resolve([]);
            return;
          }
          
          console.log(`Successfully fetched all ${result.questions.length} questions for PDF export`);
          
          // Store all questions for PDF
          setAllQuestionsForPdf(result.questions);
          resolve(result.questions);
        }
      );
    });
  };
  
  // Expose analyticsQuestions via ref
  useImperativeHandle(ref, () => ({
    getAnalyticsQuestions: async () => {
      // If we already have all questions loaded for PDF, return them
      if (allQuestionsForPdf.length > 0) {
        return allQuestionsForPdf;
      }
      
      // Otherwise fetch all questions
      try {
        const questions = await fetchAllQuestionsForPdf();
        return questions;
      } catch (error) {
        console.error('Error getting all questions for PDF:', error);
        // Fall back to current page questions if there's an error
        return analyticsQuestions;
      }
    }
  }));
  
  // For AllQuestionsTab, we don't need a specific surveyId
  // We'll fetch data for all surveys
  
  // Base color mapping for common response categories
  const baseColorMap = {
    'Strongly Agree': '#27D67B', // Green
    'Agree': '#A8F0C6', // Light Green
    'Neutral': '#C7CDD8', // Gray
    'Neither Agree nor Disagree': '#C7CDD8', // Gray (same as Neutral)
    'Disagree': '#F9C89B', // Light Orange
    'Strongly Disagree': '#F05454', // Red
  };
  
  // Predefined colors for dynamic options
  const predefinedColors = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#6b7280', // Gray
    '#3b82f6', // Blue
    '#10b981', // Green
    '#059669', // Dark Green
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#0891b2', // Cyan
  ];
  
  // Function to get color for any option name
  const getColorForOption = (optionName: string): string => {
    // First check if we have a predefined color
    if (baseColorMap[optionName as keyof typeof baseColorMap]) {
      return baseColorMap[optionName as keyof typeof baseColorMap];
    }
    
    // For custom options, hash the name to get a consistent color
    const hashCode = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    // Use the hash to select a color from our predefined list
    const colorIndex = hashCode(optionName) % predefinedColors.length;
    return predefinedColors[colorIndex];
  };
  
  // Fetch question data with filtering and pagination
  useEffect(() => {
    setLoading(true);
    
    // Create effective filter params
    const effectiveFilterParams = filterParams || {};
    
    // If propsSurveyId is provided and filterParams doesn't have surveyIds, add it
    if (propsSurveyId && (!effectiveFilterParams.surveyIds || effectiveFilterParams.surveyIds.length === 0)) {
      effectiveFilterParams.surveyIds = [propsSurveyId];
    }
    
    // Create pagination params
    const paginationParams = {
      page: pagination.page,
      limit: pagination.limit
    };
    
    console.log('Fetching questions with filters:', effectiveFilterParams);
    console.log('Pagination:', paginationParams);
    
    // Call the new filtered method with pagination
    Meteor.call(
      'getFilteredAnalyticsQuestions',
      effectiveFilterParams,
      paginationParams,
      (error: any, result: { questions: AnalyticsQuestion[], totalCount: number, page: number, limit: number, totalPages: number }) => {
        if (error) {
          console.error('Error fetching filtered questions:', error);
          setLoading(false);
          return;
        }
        
        console.log('Fetched filtered questions:', result);
        
        if (!result || !result.questions) {
          setAnalyticsQuestions([]);
          setLoading(false);
          return;
        }
        
        // Update questions and pagination data
        setAnalyticsQuestions(result.questions);
        setPagination({
          page: result.page,
          limit: result.limit,
          totalCount: result.totalCount,
          totalPages: result.totalPages
        });
        
        setShowDynamicData(true);
        setLoading(false);
      }
    );
  }, [propsSurveyId, filterParams, pagination.page, pagination.limit]);
  
  // No PDF export function here - moved to parent component
  
  // Function to render flags
  const renderFlags = (flags: string[]) => {
    if (!flags || flags.length === 0) return null;
    
    return (
      <FlagsContainer>
        {flags.includes('high-neutral') && (
          <Flag type="high-neutral">
            <FiAlertCircle size={12} />
            High Neutral
          </Flag>
        )}
        {flags.includes('high-variance') && (
          <Flag type="high-variance">
            <FiInfo size={12} />
            High Variance
          </Flag>
        )}
      </FlagsContainer>
    );
  };
  
  // Render function for dynamic questions
  const renderDynamicQuestionData = () => {
    if (analyticsQuestions.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
          <p>No questions found across all surveys.</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>Try creating some surveys with questions to see analytics data here.</p>
        </div>
      );
    }
    
    return (
      <Container>
        {analyticsQuestions.map(question => (
          <QuestionCard key={question.questionId}>
            <QuestionText>
              <div>
                <div dangerouslySetInnerHTML={{ __html: question.questionText }} />
                {question.surveyTitle && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#64748b', 
                    marginTop: '4px',
                    fontStyle: 'italic'
                  }}>
                    From survey: {question.surveyTitle}
                  </div>
                )}
              </div>
              <div style={{ 
                display: 'inline-flex', 
                marginLeft: '10px',
                padding: '2px 8px', 
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: '#552a47',
                color: 'white'
              }}>
                {question.questionType}
              </div>
            </QuestionText>
            
            {/* For text, textarea, and date questions, show latest responses */}
            {(question.questionType === 'text' || 
              question.questionType === 'textarea' || 
              question.questionType === 'date') && question.latestResponses ? (
              <LatestResponsesContainer>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#4b5563',
                  marginBottom: '8px'
                }}>
                  Latest Responses ({question.latestResponses.length})
                </div>
                
                {question.latestResponses.length > 0 ? (
                  <ResponsesList>
                    {question.latestResponses.map((response, index) => (
                      <ResponseItem key={index}>
                        <ResponseText>{response.answer}</ResponseText>
                        <ResponseDate>
                          {new Date(response.date).toLocaleDateString()} {new Date(response.date).toLocaleTimeString()}
                        </ResponseDate>
                      </ResponseItem>
                    ))}
                  </ResponsesList>
                ) : (
                  <div style={{ 
                    padding: '20px 0', 
                    textAlign: 'center', 
                    color: '#666',
                    backgroundColor: '#f9fafb',
                    borderRadius: '4px',
                    border: '1px dashed #d1d5db'
                  }}>
                    <p style={{ margin: 0 }}>No responses yet</p>
                  </div>
                )}
              </LatestResponsesContainer>
            ) : (
              /* For other question types, show progress bars */
              <BarChartContainer>
                {/* Response count display */}
                <ResponseCount>
                  {question.responseCount || Object.values(question.progress).reduce((sum, value) => sum + value, 0)} responses
                </ResponseCount>
                
                {/* Check if there are any non-zero responses */}
                {Object.values(question.progress).some(value => value > 0) ? (
                  <>
                    <BarContainer>
                      {/* Use the actual options from question.progress */}
                      {Object.entries(question.progress)
                        .sort((a, b) => {
                          // Sort options in a logical order (Strongly Agree to Strongly Disagree)
                          const order = {
                            'Strongly Agree': 1,
                            'Agree': 2,
                            'Neutral': 3,
                            'Neither Agree nor Disagree': 3, // Same level as Neutral
                            'Disagree': 4,
                            'Strongly Disagree': 5
                          };
                          
                          // Get the order value, default to 99 for unknown options
                          const orderA = order[a[0] as keyof typeof order] || 99;
                          const orderB = order[b[0] as keyof typeof order] || 99;
                          
                          return orderA - orderB;
                        })
                        .map(([label, percentage]) => {
                          // Determine if we should use dark text (for light backgrounds)
                          const useDarkText = label === 'Agree' || label === 'Neutral' || label === 'Neither Agree nor Disagree';
                          return (
                            <Bar 
                              key={label} 
                              width={percentage} 
                              color={getColorForOption(label)}
                            >
                              {percentage > 5 && (
                                <PercentageLabel dark={useDarkText}>
                                  {percentage}%
                                </PercentageLabel>
                              )}
                            </Bar>
                          );
                        })}
                    </BarContainer>
                  </>
                ) : (
                  <div style={{ 
                    padding: '20px 0', 
                    textAlign: 'center', 
                    color: '#666',
                    backgroundColor: '#f9fafb',
                    borderRadius: '4px',
                    border: '1px dashed #d1d5db',
                    marginBottom: '10px'
                  }}>
                    <p style={{ margin: 0 }}>No responses yet</p>
                  </div>
                )}
                
                <LegendContainer>
                  {/* Calculate the total responses */}
                  {(() => {
                    // Use the actual response count if available, otherwise fall back to sum of percentages
                    const totalResponses = question.responseCount || 
                      Object.values(question.progress).reduce((sum, value) => sum + value, 0);
                    
                    // Calculate actual count from percentage based on total responses
                    const getCount = (percentage: number) => Math.round((percentage / 100) * totalResponses);
                    
                    return Object.entries(question.progress)
                      .sort((a, b) => {
                        // Sort options in a logical order (Strongly Agree to Strongly Disagree)
                        const order = {
                          'Strongly Agree': 1,
                          'Agree': 2,
                          'Neutral': 3,
                          'Neither Agree nor Disagree': 3, // Same level as Neutral
                          'Disagree': 4,
                          'Strongly Disagree': 5
                        };
                        
                        // Get the order value, default to 99 for unknown options
                        const orderA = order[a[0] as keyof typeof order] || 99;
                        const orderB = order[b[0] as keyof typeof order] || 99;
                        
                        return orderA - orderB;
                      })
                      .map(([label, percentage]) => (
                        <LegendItem key={label}>
                          <LegendColor color={getColorForOption(label)} />
                          {label} ({getCount(percentage)})
                        </LegendItem>
                      ));
                  })()} 
                </LegendContainer>
              </BarChartContainer>
            )}
          </QuestionCard>
        ))}
      </Container>
    );
  };
  
  if (loading) {
    return <LoadingContainer>Loading question data...</LoadingContainer>;
  }
  
  // Function to render pagination controls
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    
    // Calculate page range to show (always show 5 pages max)
    const pageRange: number[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, pagination.page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageRange.push(i);
    }
    
    const startItem = (pagination.page - 1) * pagination.limit + 1;
    const endItem = Math.min(startItem + pagination.limit - 1, pagination.totalCount);
    
    return (
      <PaginationContainer>
        <PaginationInfo>
          Showing {startItem}-{endItem} of {pagination.totalCount} questions
        </PaginationInfo>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PaginationControls>
            <PageButton 
              onClick={() => handlePageChange(1)} 
              disabled={pagination.page === 1}
            >
              &laquo;
            </PageButton>
            
            <PageButton 
              onClick={() => handlePageChange(pagination.page - 1)} 
              disabled={pagination.page === 1}
            >
              &lsaquo;
            </PageButton>
            
            {pageRange.map(page => (
              <PageButton 
                key={page} 
                active={page === pagination.page}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </PageButton>
            ))}
            
            <PageButton 
              onClick={() => handlePageChange(pagination.page + 1)} 
              disabled={pagination.page === pagination.totalPages}
            >
              &rsaquo;
            </PageButton>
            
            <PageButton 
              onClick={() => handlePageChange(pagination.totalPages)} 
              disabled={pagination.page === pagination.totalPages}
            >
              &raquo;
            </PageButton>
          </PaginationControls>
          
          <PageSizeSelector 
            value={pagination.limit} 
            onChange={handlePageSizeChange}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </PageSizeSelector>
        </div>
      </PaginationContainer>
    );
  };
  
  return (
    <div>
      {/* Always show dynamic data */}
      {renderDynamicQuestionData()}
      
      {/* Show pagination if we have questions */}
      {analyticsQuestions.length > 0 && renderPagination()}
    </div>
  );
});

export default AllQuestionsTab;

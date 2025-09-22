import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Meteor } from 'meteor/meteor';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { FiAlertCircle, FiInfo } from 'react-icons/fi';

interface QuestionsTabProps {
  isLoading: boolean;
  surveyId?: string;
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

// Define the ref interface
export interface QuestionsTabRef {
  getAnalyticsQuestions: () => AnalyticsQuestion[];
}

const QuestionsTab = forwardRef<QuestionsTabRef, QuestionsTabProps>(({ isLoading: initialLoading, surveyId: propsSurveyId }, ref) => {
  // State for loading status
  const [loading, setLoading] = useState(initialLoading);
  
  // State for analytics questions
  const [analyticsQuestions, setAnalyticsQuestions] = useState<AnalyticsQuestion[]>([]);
  
  // Always show dynamic data
  const [showDynamicData, setShowDynamicData] = useState(true);
  
  // State for survey details
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDescription, setSurveyDescription] = useState('');
  
  // Expose analyticsQuestions via ref
  useImperativeHandle(ref, () => ({
    getAnalyticsQuestions: () => analyticsQuestions
  }));
  
  // Get surveyId from URL params or props
  const { surveyId: urlSurveyId } = useParams<{ surveyId: string }>();
  const surveyId = propsSurveyId || urlSurveyId;
  
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
  
  // Fetch question data and survey details
  useEffect(() => {
    if (surveyId) {
      setLoading(true);
      
      // Fetch questions
      Meteor.call(
        'AnalyticsQuestionGetTitles', 
        surveyId,
        (error: any, result: AnalyticsQuestion[]) => {
          if (error) {
            console.error('Error fetching questions:', error);
            setLoading(false);
          } else {
            console.log('Fetched questions:', result);
            
            // Store questions temporarily
            const questions = result;
            
            // If we got questions, fetch response counts for each question
            if (questions && questions.length > 0) {
              // Create an array of promises for fetching response counts
              const countPromises = questions.map(question => {
                return new Promise<number>((resolve) => {
                  Meteor.call(
                    'getQuestionResponseCount',
                    surveyId,
                    question.questionId,
                    (countError: any, countResult: number) => {
                      if (countError) {
                        console.error(`Error fetching response count for question ${question.questionId}:`, countError);
                        resolve(0); // Default to 0 on error
                      } else {
                        resolve(countResult);
                      }
                    }
                  );
                });
              });
              
              // Wait for all response count promises to resolve
              Promise.all(countPromises)
                .then(responseCounts => {
                  // Update each question with its response count
                  const updatedQuestions = questions.map((question, index) => ({
                    ...question,
                    responseCount: responseCounts[index]
                  }));
                  
                  setAnalyticsQuestions(updatedQuestions);
                  setShowDynamicData(true);
                  setLoading(false);
                })
                .catch(err => {
                  console.error('Error fetching response counts:', err);
                  setAnalyticsQuestions(questions); // Use questions without counts on error
                  setShowDynamicData(true);
                  setLoading(false);
                });
            } else {
              setAnalyticsQuestions([]);
              setLoading(false);
            }
          }
        }
      );
      
      // Fetch survey details
      Meteor.call(
        'surveys.getSurvey',
        surveyId,
        (error: any, result: any) => {
          if (error) {
            console.error('Error fetching survey details:', error);
          } else {
            console.log('Fetched survey details:', result);
            setSurveyTitle(result.title || '');
            setSurveyDescription(result.description || '');
          }
        }
      );
    }
  }, [surveyId]);
  
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
          <p>No questions found in this survey.</p>
        </div>
      );
    }
    
    return (
      <Container>
        {analyticsQuestions.map(question => (
          <QuestionCard key={question.questionId}>
            <QuestionText>
              <div dangerouslySetInnerHTML={{ __html: question.questionText }} />
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
  
  return (
    <div>
      {/* Always show dynamic data */}
      {renderDynamicQuestionData()}
    </div>
  );
});

export default QuestionsTab;

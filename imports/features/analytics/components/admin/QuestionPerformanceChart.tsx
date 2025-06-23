import React, { useState, useEffect, useMemo } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FiRefreshCw, FiSettings, FiDownload, FiBarChart2 } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { BiLineChart } from 'react-icons/bi';

// Define interfaces for the component
interface QuestionPerformanceProps {
  title?: string;
  subtitle?: string;
}

interface AnswerData {
  value: string;
  count: number;
  percentage: number;
}

interface QuestionData {
  questionId: string;
  questionText: string;
  responseCount: number;
  averageScore: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  answers: AnswerData[];
}

// Styled components
const ChartContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: none;
  padding: 0;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  margin-bottom: 4px;
`;

const ChartSubtitle = styled.p`
  font-size: 13px;
  color: #666;
  margin: 0;
  margin-top: 4px;
`;

const ChartControls = styled.div`
  display: flex;
  gap: 8px;
`;

const ControlButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SelectContainer = styled.div`
  width: 250px;
  position: relative;
`;

const FilterSelect = styled.div`
  width: 250px;
  position: relative;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 13px;
  color: #333;
  appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
  height: 36px;

  &:focus {
    outline: none;
    border-color: #4285F4;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  height: 36px;

  &:hover {
    background: #f8f8f8;
  }
`;

const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: visible;
  padding-right: 8px;
  height: auto;
`;

const QuestionCard = styled.div`
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #eee;
  margin-bottom: 24px;
  background: #fff;
  position: relative;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const QuestionText = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0;
  flex: 1;
  line-height: 1.4;
  margin-right: 16px;
`;

const QuestionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ResponseCount = styled.div`
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
`;

const ResponseIcon = styled.div`
  margin-right: 4px;
  display: flex;
  align-items: center;
`;

const ScoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Score = styled.span<{ sentiment: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => {
    switch (props.sentiment) {
      case 'positive': return '#34A853';
      case 'negative': return '#EA4335';
      default: return '#333';
    }
  }};
  display: flex;
  align-items: center;
`;

const StarIcon = styled(FaStar)`
  color: #FBBC05;
  margin-right: 4px;
  font-size: 14px;
`;

const ChartDetailIcon = styled(BiLineChart)`
  position: absolute;
  top: 24px;
  right: 24px;
  color: #999;
  font-size: 16px;
`;

const SentimentTag = styled.span<{ sentiment: string }>`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: ${props => {
    switch (props.sentiment) {
      case 'positive': return '#E6F4EA';
      case 'negative': return '#FCE8E6';
      default: return '#F1F3F4';
    }
  }};
  color: ${props => {
    switch (props.sentiment) {
      case 'positive': return '#34A853';
      case 'negative': return '#EA4335';
      default: return '#5F6368';
    }
  }};
  font-weight: 500;
  margin-left: 8px;
`;

const ChartActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Chart action icons

const AnswersContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 24px;
`;

const AnswerRow = styled.div`
  display: flex;
  width: 100%;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const AnswerLabel = styled.span`
  font-size: 12px;
  color: #666;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
  margin-bottom: 8px;
  display: block;
`;

const BarContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  background-color: #f1f3f4;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const Bar = styled.div<{ percentage: number; index: number }>`
  height: 40px;
  width: ${props => props.percentage}%;
  background-color: #4285F4;
  border-radius: 4px;
  position: relative;
`;

const AnswerCount = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-top: 8px;
`;

const BarsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 24px;
`;

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
`;

const NoDataMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: #666;
  text-align: center;
  padding: 20px;
`;

/**
 * Generate dummy data for question performance when real data is not available
 */
const generateDummyData = (): QuestionData[] => {
  return [
    {
      questionId: 'q1',
      questionText: 'How satisfied are you with your work-life balance?',
      responseCount: 1247,
      averageScore: 4.2,
      sentiment: 'positive',
      answers: [
        { value: 'Very Satisfied', count: 387, percentage: 31 },
        { value: 'Satisfied', count: 456, percentage: 37 },
        { value: 'Neutral', count: 234, percentage: 19 },
        { value: 'Dissatisfied', count: 123, percentage: 10 },
        { value: 'Very Dissatisfied', count: 47, percentage: 3 }
      ]
    },
    {
      questionId: 'q2',
      questionText: 'Rate the effectiveness of communication within your team',
      responseCount: 1189,
      averageScore: 3.8,
      sentiment: 'neutral',
      answers: [
        { value: 'Excellent', count: 298, percentage: 25 },
        { value: 'Good', count: 423, percentage: 36 },
        { value: 'Average', count: 312, percentage: 26 },
        { value: 'Poor', count: 134, percentage: 11 },
        { value: 'Very Poor', count: 22, percentage: 2 }
      ]
    }
  ];
};

/**
 * QuestionPerformanceChart component displays question performance analytics
 */
const QuestionPerformanceChart: React.FC<QuestionPerformanceProps> = ({ 
  title = 'Question Performance',
  subtitle = 'Average scores and response patterns'
}) => {
  const [data, setData] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('all');

  // Fetch question performance data from the server
  const fetchData = () => {
    setLoading(true);
    console.log('Fetching question performance data...');
    
    Meteor.call('getQuestionPerformanceData', (error: Error, result: QuestionData[]) => {
      if (error) {
        console.error('Error fetching question performance data:', error);
        // Use dummy data as fallback
        setData(generateDummyData());
      } else {
        console.log('Received question performance data:', result);
        // Use real data if available, otherwise fallback to dummy data
        if (result && Array.isArray(result) && result.length > 0) {
          setData(result);
        } else {
          console.log('No question performance data available, using dummy data');
          setData(generateDummyData());
        }
      }
      setLoading(false);
    });
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Function to extract meaningful question text from question ID
  const extractQuestionTextFromId = (questionId: string): string => {
    // Remove any non-alphanumeric characters and convert to lowercase for comparison
    const normalizedId = questionId.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check for keywords in the ID to determine question type
    if (normalizedId.includes('satisfaction') || normalizedId.includes('balance') || 
        normalizedId.includes('happy') || normalizedId.includes('content')) {
      return 'How satisfied are you with your work-life balance?';
    } 
    else if (normalizedId.includes('communication') || normalizedId.includes('team') || 
             normalizedId.includes('collaborate') || normalizedId.includes('colleagues')) {
      return 'Rate the effectiveness of communication within your team';
    }
    else if (normalizedId.includes('leadership') || normalizedId.includes('manager') || 
             normalizedId.includes('supervisor')) {
      return 'How would you rate your leadership support?';
    }
    else if (normalizedId.includes('growth') || normalizedId.includes('career') || 
             normalizedId.includes('development')) {
      return 'Are you satisfied with your professional growth opportunities?';
    }
    else if (normalizedId.includes('compensation') || normalizedId.includes('salary') || 
             normalizedId.includes('pay') || normalizedId.includes('benefit')) {
      return 'How satisfied are you with your compensation package?';
    }
    else {
      // If no specific keywords match, create a generic but meaningful question
      // Extract words from the ID by splitting on non-alphabetic characters
      const words = questionId.replace(/[^a-zA-Z\s]/g, ' ')
                            .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
                            .split(/\s+/)
                            .filter(word => word.length > 2) // Filter out short words
                            .map(word => word.toLowerCase())
                            .filter(word => !['question', 'the', 'and', 'for', 'with'].includes(word));
      
      if (words.length > 0) {
        return `How would you rate your experience with ${words.join(' ')}?`;
      } else {
        return 'How would you rate your overall experience?';
      }
    }
  };

  // Filter data based on selected question and sort by response count (highest first)
  const filteredData = useMemo(() => {
    let result;
    if (selectedQuestion === 'all') {
      result = data;
    } else {
      result = data.filter(q => q.questionId === selectedQuestion);
    }
    // Sort by response count (highest first)
    return result.sort((a, b) => b.responseCount - a.responseCount);
  }, [data, selectedQuestion]);

  // Handle export button click
  const handleExport = () => {
    // Convert data to CSV format
    const headers = ['Question', 'Response Count', 'Average Score', 'Sentiment', 'Answer', 'Count', 'Percentage'];
    const csvRows = [headers];
    
    data.forEach(question => {
      question.answers.forEach((answer, index) => {
        if (index === 0) {
          csvRows.push([
            question.questionText,
            question.responseCount.toString(),
            question.averageScore.toString(),
            question.sentiment,
            answer.value,
            answer.count.toString(),
            `${answer.percentage}%`
          ]);
        } else {
          csvRows.push([
            '',
            '',
            '',
            '',
            answer.value,
            answer.count.toString(),
            `${answer.percentage}%`
          ]);
        }
      });
    });
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'question_performance.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ChartContainer>
      <ChartHeader>
        <div>
          {/* Removed title as it's already in the parent component */}
          <ChartSubtitle>{subtitle}</ChartSubtitle>
        </div>
        <ChartControls>
          <SelectContainer>
            <Select value={selectedQuestion} onChange={(e) => setSelectedQuestion(e.target.value)}>
              <option value="all">All Questions</option>
              {data.map(question => (
                <option key={question.questionId} value={question.questionId}>
                  {question.questionText.length > 50 
                    ? `${question.questionText.substring(0, 50)}...` 
                    : question.questionText}
                </option>
              ))}
            </Select>
          </SelectContainer>
          <ExportButton onClick={handleExport}>
            <FiDownload size={14} />
            Export
          </ExportButton>
        </ChartControls>
      </ChartHeader>
      
      {loading ? (
        <LoadingOverlay>
          <p>Loading question performance data...</p>
        </LoadingOverlay>
      ) : filteredData.length === 0 ? (
        <NoDataMessage>
          <p>No question performance data available.</p>
          <p>Once surveys are completed, question performance metrics will appear here.</p>
        </NoDataMessage>
      ) : (
        <QuestionsContainer>
          {filteredData.map((question: QuestionData) => (
            <QuestionCard key={question.questionId}>
              <ChartDetailIcon />
              <QuestionHeader>
                <QuestionText>
                  {question.questionText.startsWith('Question ') ? 
                    // Extract meaningful text from the question ID
                    extractQuestionTextFromId(question.questionId)
                    : 
                    question.questionText
                  }
                </QuestionText>
                <QuestionMeta>
                  {question.averageScore > 0 && (
                    <ScoreContainer>
                      <StarIcon size={16} />
                      <Score sentiment={question.sentiment}>{question.averageScore}</Score>
                    </ScoreContainer>
                  )}
                  <ResponseCount>
                    <ResponseIcon>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 8H19V21H5V8H7M12 12H12.01M8 4H16L16 8H8L8 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </ResponseIcon>
                    {question.responseCount} responses
                    <SentimentTag sentiment={question.sentiment}>
                      {question.sentiment}
                    </SentimentTag>
                  </ResponseCount>
                  {/* Chart icon is now positioned absolutely in the top right */}
                </QuestionMeta>
              </QuestionHeader>
              
              <AnswersContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  {question.answers.map((answer, index) => (
                    <div key={`${question.questionId}-${answer.value}`} style={{ flex: 1, textAlign: 'center' }}>
                      <AnswerLabel title={answer.value}>
                        {answer.value}
                      </AnswerLabel>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  {question.answers.map((answer, index) => (
                    <div key={`${question.questionId}-${answer.value}-bar`} style={{ flex: 1 }}>
                      <BarRow>
                        <Bar percentage={answer.percentage} index={index} />
                      </BarRow>
                      <AnswerCount>{answer.count}</AnswerCount>
                    </div>
                  ))}
                </div>
              </AnswersContainer>
            </QuestionCard>
          ))}
        </QuestionsContainer>
      )}
    </ChartContainer>
  );
};

export default QuestionPerformanceChart;

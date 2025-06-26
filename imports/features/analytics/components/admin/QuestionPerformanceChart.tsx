import React, { useState, useEffect, useMemo } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FiRefreshCw, FiSettings, FiDownload, FiBarChart2, FiArrowRight } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { BiLineChart } from 'react-icons/bi';
import ViewAllButton from './ViewAllButton';

// Define interfaces for the component
interface QuestionPerformanceProps {
  title?: string;
  subtitle?: string;
  isOverview?: boolean; // Flag to indicate if this is shown on the Overview page
}

interface AnswerData {
  value: string;
  count: number;
  percentage: number;
  optionIndex?: number; // Optional index of the option in the standard options array
}

interface QuestionData {
  questionId: string;
  questionText: string;
  questionType: string; // Added question type field
  responseCount: number;
  averageScore: number;
  sentiment: string;
  answers: AnswerData[];
  // Enhanced metrics
  avgTimeSpent: number; // Average time spent on question in seconds
  skipRate: number; // Percentage of users who skipped this question
  completionRate: number; // Percentage of users who completed this question
  engagementScore: number; // Score from 0-100 indicating user engagement
  responseQuality: string; // Quality of responses based on analysis
}

// Styled components
const ChartContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  width: 100%;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  margin: 0 4px;
  border-radius: 4px;
  border: 1px solid ${props => props.active ? '#552a47' : '#e0e0e0'};
  background-color: ${props => props.active ? '#552a47' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#6025c0' : '#f5f5f5'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f5f5f5;
  }
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

// Create a styled component for the color indicator
const ColorIndicator = styled.span<{ questionType: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: ${props => {
    switch (props.questionType) {
      case 'likert': return '#a0cf4e'; // Green for Likert scales
      case 'multiple_choice': return '#4e9dcf'; // Blue for multiple choice
      case 'open_text': return '#cf9e4e'; // Orange for open text
      default: return '#adadad'; // Gray for unknown
    }
  }};
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

const QuestionTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const QuestionText = styled.h4`
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 4px;
  margin-top: 0;
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

const QualityTag = styled.span<{ quality: string }>`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: ${props => {
    switch (props.quality) {
      case 'high': return '#e6f7ed';
      case 'medium': return '#fff8e6';
      case 'low': return '#ffebeb';
      default: return '#f0f0f0';
    }
  }};
  color: ${props => {
    switch (props.quality) {
      case 'high': return '#1e8e3e';
      case 'medium': return '#f9a825';
      case 'low': return '#d93025';
      default: return '#5f6368';
    }
  }};
  margin-left: 8px;
`;

const TypeTag = styled.span<{ questionType: string }>`
  font-size: 10px;
  padding: 8px;
  background-color: #a0cf4e;
  width: max-content;
  border-radius: 12px;
  color: #fff;
  display: inline-block;
`;

const ChartActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
`;

const MetricCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 6px;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
`;

const MetricIcon = styled.div`
  margin-right: 8px;
  display: flex;
  align-items: center;
  color: #4285F4;
`;

const EngagementGauge = styled.div`
  position: relative;
  height: 8px;
  background-color: #f1f3f4;
  border-radius: 4px;
  margin-top: 8px;
  overflow: hidden;
`;

const EngagementLevel = styled.div<{ score: number }>`
  position: absolute;
  height: 100%;
  width: ${props => props.score}%;
  background-color: ${props => {
    if (props.score >= 80) return '#34A853';
    if (props.score >= 50) return '#FBBC05';
    return '#EA4335';
  }};
  border-radius: 4px;
`;

// Icons for metrics
import { FiClock, FiSkipForward } from 'react-icons/fi';
import { IoCheckmarkDone } from 'react-icons/io5';
import { RiPulseLine } from 'react-icons/ri';
import { MdOutlineRateReview } from 'react-icons/md';
import { LinksCollection } from '/imports/api/links';

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
  align-items: flex-end;
  width: 100%;
  height: 100px;
  background-color: #f1f3f4;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const Bar = styled.div<{ percentage: number; index: number }>`
  width: 100%;
  height: ${props => props.percentage > 0 ? `${Math.max(props.percentage, 5)}%` : '1px'};
  background-color: ${props => props.percentage > 0 ? '#4285F4' : '#E0E0E0'};
  border-radius: 4px;
  position: relative;
`;

const AnswerCount = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-top: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
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
 * QuestionPerformanceChart component displays question performance analytics
 */
const QuestionPerformanceChart: React.FC<QuestionPerformanceProps> = ({ 
  title = 'Question Performance',
  subtitle = 'Average scores and response patterns',
  isOverview = false
}) => {
  // State for chart data
  const [data, setData] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for selected question type filter
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('all');
  
  // Track available question types
  const [questionTypes, setQuestionTypes] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20); // Show 20 questions per page
  
  // Fetch question performance data from the server
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching question performance data...');
    
    // Create a promise-based wrapper for Meteor.call
    const getQuestionPerformanceData = () => {
      return new Promise<QuestionData[]>((resolve, reject) => {
        Meteor.call('getQuestionPerformanceData', (error: Error, result: QuestionData[]) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    };
    
    // Create a promise-based wrapper for questions.getOne
    const getQuestionById = (questionId: string) => {
      return new Promise<any>((resolve, reject) => {
        Meteor.call('questions.getOne', questionId, (error: Error, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    };
    
    try {
      // Get initial question performance data
      const result = await getQuestionPerformanceData();
      console.log('Received question performance data:', result);
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        setError('No question data available');
        setData([]);
        setQuestionTypes([]);
        setLoading(false);
        return;
      }
      
      // Process the data to ensure question titles are displayed correctly
      let processedData = [...result];
      
      // First, determine question types for questions without types
      processedData = processedData.map(question => {
        // If question type is not provided, try to determine it from the data
        if (!question.questionType) {
          // Determine question type based on answers and structure
          let questionType = 'unknown';
          
          // Check for common question types based on answer patterns
          if (question.answers && question.answers.length > 0) {
            const answerValues = question.answers.map(a => a.value);
            
            // Likert scale typically has numeric values 1-5 or 1-7
            if (answerValues.every(v => !isNaN(Number(v))) && 
                answerValues.length <= 7 && 
                Math.max(...answerValues.map(v => Number(v))) <= 7) {
              questionType = 'likert';
            }
            // Multiple choice / checkbox typically has text answers
            else if (answerValues.some(v => isNaN(Number(v)))) {
              questionType = 'multiple_choice';
            }
            // Open text questions typically have many unique answers
            else if (answerValues.length > 10) {
              questionType = 'open_text';
            }
          }
          
          // Add the determined type to the question
          return { ...question, questionType };
        }
        return question;
      });
      
      // Identify questions with placeholder titles that need to be fetched
      const questionsToFetch = processedData
        .filter(q => q.questionText.startsWith('Question '))
        .map(q => q.questionId);
      
      console.log(`Found ${questionsToFetch.length} questions with placeholder titles`);
      
      // If there are questions with placeholder titles, fetch their real data
      if (questionsToFetch.length > 0) {
        try {
          // Fetch all question documents in parallel
          const questionPromises = questionsToFetch.map(questionId => getQuestionById(questionId));
          const questionDocs = await Promise.all(questionPromises);
          
          // Process each question document to extract real titles and types
          questionDocs.forEach((doc, index) => {
            if (!doc) return;
            
            const questionId = questionsToFetch[index];
            console.log(`Processing question document for ${questionId}:`, doc);
            
            // Extract the real question text and type if available
            let realText = null;
            let questionType = null;
            
            if (doc.versions && doc.versions.length > 0) {
              const currentVersionIndex = doc.currentVersion || 0;
              const currentVersion = doc.versions[currentVersionIndex];
              
              if (currentVersion) {
                // Get question text
                if (currentVersion.questionText) {
                  realText = currentVersion.questionText;
                  console.log(`Found real question text for ${questionId}: ${realText}`);
                }
                
                // Get question type
                if (currentVersion.type) {
                  questionType = currentVersion.type;
                } else if (currentVersion.questionType) {
                  questionType = currentVersion.questionType;
                } else if (currentVersion.inputType) {
                  questionType = currentVersion.inputType;
                }
              }
            }
            
            // Update the processed data with real question text and type
            if (realText || questionType) {
              processedData = processedData.map(q => {
                if (q.questionId === questionId) {
                  return { 
                    ...q, 
                    questionText: realText || q.questionText,
                    questionType: questionType || q.questionType
                  };
                }
                return q;
              });
            }
          });
        } catch (fetchError) {
          console.error('Error fetching question details:', fetchError);
        }
      }
      
      // Extract unique question types for the filter dropdown
      const types = Array.from(new Set(processedData.map(q => q.questionType)));
      setQuestionTypes(types);
      
      // Set the processed data with real question titles and types
      setData(processedData);
      
    } catch (error) {
      console.error('Error fetching question performance data:', error);
      setError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setData([]);
    } finally {
      setLoading(false);
    }
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

  // Filter data by selected question type
  const filteredData = useMemo(() => {
    if (selectedQuestionType === 'all') {
      return data;
    }
    return data.filter(item => item.questionType === selectedQuestionType);
  }, [data, selectedQuestionType]);
  
  // Sort the data by response count (highest first)
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => b.responseCount - a.responseCount);
  }, [filteredData]);
  
  // Final data to display after all filtering and pagination
  const displayData = useMemo(() => {
    // For Overview page, only show top 2 questions based on response count
    if (isOverview) {
      // Sort by response count (highest first) and take only top 2
      return [...filteredData]
        .sort((a, b) => b.responseCount - a.responseCount)
        .slice(0, 2);
    }
    
    // Apply pagination for non-overview mode
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  // Helper function to strip HTML tags and special characters from text
  const stripHtmlAndSpecialChars = (html: string): string => {
    if (!html) return '';

    
    // First, replace common HTML entities
    let text = html
      .replace(/&nbsp;/g, '') // Remove &nbsp; completely
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Then strip HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Trim extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  };

  // State to store original question data with answer options
  const [questionOptionsMap, setQuestionOptionsMap] = useState<Record<string, string[]>>({});

  // Function to fetch original question data to get answer options
  const fetchQuestionOptions = async (questionId: string) => {
    try {
      // Create a promise-based wrapper for questions.getOne
      const getQuestionById = (id: string) => {
        return new Promise<any>((resolve, reject) => {
          Meteor.call('questions.getOne', id, (error: Error, result: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      };

      const questionData = await getQuestionById(questionId);
      console.log('Fetched original question data:', questionData);
      
      // Extract answer options if available
      if (questionData && questionData.answers && Array.isArray(questionData.answers)) {
        // Get the text values from the answers array
        const options = questionData.answers.map((answer: any) => answer.text || answer.value || '');
        console.log('Extracted options for question:', options);
        
        // Update the options map
        setQuestionOptionsMap(prev => ({
          ...prev,
          [questionId]: options
        }));
        
        return options;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching question options:', error);
      return [];
    }
  };

  // Function to get all possible answer options for a question type
  const getAllPossibleAnswers = async (question: QuestionData): Promise<AnswerData[]> => {
    // If no answers are available, return an empty array
    if (!question.answers || question.answers.length === 0) {
      return [];
    }

    console.log('Questions Answers: ', question.answers);
    
    // For Likert scale questions, use the actual values from the answers
    if (question.questionType === 'likert') {
      console.log('Processing Likert question:', question);
      console.log('Likert answers:', question.answers);
      
      // Get all unique values from the answers
      const uniqueValues = Array.from(new Set(question.answers.map(a => a.value)));
      console.log('Unique values in Likert answers:', uniqueValues);
      
      // Check if we have numeric values (1-5)
      const hasNumericValues = uniqueValues.some(value => !isNaN(Number(value)));
      console.log('Has numeric values:', hasNumericValues);
      
      // Try to get the original question options
      let likertOptions = questionOptionsMap[question.questionId];
      
      // If we don't have the options yet, try to fetch them
      if (!likertOptions || likertOptions.length === 0) {
        likertOptions = await fetchQuestionOptions(question.questionId);
      }
      
      // If we still don't have options, use standard ones
      if (!likertOptions || likertOptions.length === 0) {
        likertOptions = [
          'Strongly Disagree',
          'Disagree',
          'Neutral',
          'Agree',
          'Strongly Agree'
        ];
      }
      
      console.log('Using Likert options:', likertOptions);
      
      // Create a result array with all options
      const result: AnswerData[] = [];
      
      // For each option
      likertOptions.forEach((option, index) => {
        console.log('Processing option:', option, 'at index:', index);
        
        // Try to find a matching answer
        const existingAnswer = question.answers.find(a => {
          // If we have numeric values, match by index+1
          if (hasNumericValues && a.value === String(index + 1)) {
            return true;
          }
          
          // Otherwise try to match by text (case-insensitive)
          return a.value.toLowerCase() === option.toLowerCase() || 
                 (a.value === '' && index === 0);
        });

        console.log('Existing Answer found:', existingAnswer);
        
        if (existingAnswer) {
          // If found, use the existing data with the correct label
          result.push({
            ...existingAnswer,
            value: option, // Use the actual option label
            optionIndex: index // Store the index for reference
          });
        } else {
          // If not found, create an empty entry
          result.push({
            value: option,
            count: 0,
            percentage: 0,
            optionIndex: index // Store the index for reference
          });
        }
      });
      
      console.log('Final Likert result:', result);
      return result;
    }
    
    // For all other question types, use the existing answers as is
    return question.answers.map((answer, index) => ({
      ...answer,
      optionIndex: index // Use the original order as the index
    }));
  };
  
  // Non-async wrapper for getAllPossibleAnswers to use in render
  const getAnswersForDisplay = (question: QuestionData): AnswerData[] => {
    // Return cached answers if we have them
    if (questionOptionsMap[question.questionId]) {
      // Create a result array with all options
      const result: AnswerData[] = [];

      console.log('Available Options: ', result);
      const options = questionOptionsMap[question.questionId];
      
      options.forEach((option, index) => {
        // Try to find a matching answer
        const existingAnswer = question.answers.find(a => 
          a.value === String(index + 1) || // Match numeric values (1-5)
          a.value.toLowerCase() === option.toLowerCase() || 
          (a.value === '' && index === 0)
        );
        
        if (existingAnswer) {
          // If found, use the existing data with the correct label
          result.push({
            ...existingAnswer,
            value: option, // Use the actual option label
            optionIndex: index // Store the index for reference
          });
        } else {
          // If not found, create an empty entry
          result.push({
            value: option,
            count: 0,
            percentage: 0,
            optionIndex: index // Store the index for reference
          });
        }
      });
      
      return result;
    }
    
    // If we don't have cached options yet, trigger the fetch and return the current answers
    // This will be updated on the next render after the fetch completes
    if (question.questionType === 'likert') {
      // Fetch options in the background
      fetchQuestionOptions(question.questionId).catch(console.error);

      const options = questionOptionsMap[question.questionId];
      console.log('Available Options: ', options, question);
      
      // Return standard options for now
      const standardOptions = [
        'Strongly Disagree',
        'Disagree',
        'Neutral',
        'Agree',
        'Strongly Agree'
      ];
      
      return standardOptions.map((option, index) => {
        const existingAnswer = question.answers.find(a => 
          a.value === String(index + 1) || 
          a.value.toLowerCase() === option.toLowerCase() || (a.value === '' && index === 0)
        );
        
        if (existingAnswer) {
          return {
            ...existingAnswer,
            value: option,
            optionIndex: index
          };
        } else {
          return {
            value: option,
            count: 0,
            percentage: 0,
            optionIndex: index
          };
        }
      });
    }
    
    // For other question types, just return the answers with optionIndex
    return question.answers.map((answer, index) => ({
      ...answer,
      optionIndex: index
    }));
  };
  
  // Update backend to include question types
  useEffect(() => {
    if (data.length > 0 && questionTypes.length === 0) {
      // Extract question types from data if not already done
      const types = Array.from(new Set(data.map(q => q.questionType || 'unknown')));
      setQuestionTypes(types);
    }
  }, [data, questionTypes.length]);

  // Handle export button click
  const handleExport = () => {
    const csvData = filteredData.map(item => ({
      'Question ID': item.questionId,
      'Question Text': item.questionText,
      'Question Type': item.questionType,
      'Response Count': item.responseCount,
      'Average Score': item.averageScore.toFixed(2),
      'Sentiment': item.sentiment,
      'Avg Time Spent (sec)': item.avgTimeSpent.toFixed(1),
      'Skip Rate (%)': (item.skipRate * 100).toFixed(1),
      'Completion Rate (%)': (item.completionRate * 100).toFixed(1),
      'Engagement Score': item.engagementScore.toFixed(1),
      'Response Quality': item.responseQuality
    }));

    const csvContent = csvData.map(row => Object.values(row).join(',')).join('\n');
    const csvHeader = Object.keys(csvData[0]).join(',');
    const csv = `${csvHeader}\n${csvContent}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'question_performance_detailed.csv');
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
            <Select
              value={selectedQuestionType}
              onChange={(e) => setSelectedQuestionType(e.target.value)}
            >
              <option value="all">All Question Types</option>
              {questionTypes.map((type) => (
                <option key={type} value={type}>
                  {(() => {
                    // Map question types to their display names as used in the Question builder
                    const questionTypeDisplayMap: Record<string, string> = {
                      'radio': 'Single Choice (Radio)',
                      'checkbox': 'Multiple Choice (Checkbox)',
                      'dropdown': 'Dropdown',
                      'text': 'Short Text',
                      'textarea': 'Long Text',
                      'rating': 'Rating Scale',
                      'likert': 'Likert Scale',
                      'ranking': 'Ranking',
                      'date': 'Date',
                      'file': 'File Upload',
                      'multiple_choice': 'Multiple Choice',
                      'open_text': 'Text Input',
                      'unknown': 'Unknown Type'
                    };
                    
                    // Use the display name from the map if available, otherwise format the type name
                    return questionTypeDisplayMap[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
                  })() }
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
        <>
          <QuestionsContainer>
            {displayData.map((question: QuestionData) => (
              <QuestionCard key={question.questionId}>
              <QuestionHeader>
                <QuestionTextContainer>
                  <QuestionText>{stripHtmlAndSpecialChars(question.questionText)}</QuestionText>
                  <TypeTag questionType={question.questionType || 'unknown'}>
                    {(() => {
                      // Map question types to their display names as used in the Question builder
                      const questionTypeDisplayMap: Record<string, string> = {
                        'radio': 'Single Choice (Radio)',
                        'checkbox': 'Multiple Choice (Checkbox)',
                        'dropdown': 'Dropdown',
                        'text': 'Short Text',
                        'textarea': 'Long Text',
                        'rating': 'Rating Scale',
                        'likert': 'Likert Scale',
                        'ranking': 'Ranking',
                        'date': 'Date',
                        'file': 'File Upload',
                        'multiple_choice': 'Multiple Choice',
                        'open_text': 'Text Input',
                        'unknown': 'Unknown Type'
                      };
                      
                      // Use the display name from the map if available, otherwise format the type name
                      return questionTypeDisplayMap[question.questionType || 'unknown'] || 
                             (question.questionType ? question.questionType.charAt(0).toUpperCase() + 
                             question.questionType.slice(1).replace(/_/g, ' ') : 'Unknown Type');
                    })()}
                  </TypeTag>
                </QuestionTextContainer>
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
                    <QualityTag quality={question.responseQuality}>
                      {question.responseQuality} quality
                    </QualityTag>
                  </ResponseCount>
                </QuestionMeta>
              </QuestionHeader>
              
              {/* Enhanced Metrics Grid */}
              <MetricsGrid>
                <MetricCard>
                  <MetricLabel>Avg Time Spent</MetricLabel>
                  <MetricValue>
                    <MetricIcon><FiClock size={14} /></MetricIcon>
                    {question.avgTimeSpent} sec
                  </MetricValue>
                </MetricCard>
                
                <MetricCard>
                  <MetricLabel>Skip Rate</MetricLabel>
                  <MetricValue>
                    <MetricIcon><FiSkipForward size={14} /></MetricIcon>
                    {question.skipRate}%
                  </MetricValue>
                </MetricCard>
                
                <MetricCard>
                  <MetricLabel>Completion Rate</MetricLabel>
                  <MetricValue>
                    <MetricIcon><IoCheckmarkDone size={14} /></MetricIcon>
                    {question.completionRate}%
                  </MetricValue>
                </MetricCard>
                
                <MetricCard>
                  <MetricLabel>Engagement Score</MetricLabel>
                  <MetricValue>
                    <MetricIcon><RiPulseLine size={14} /></MetricIcon>
                    {question.engagementScore}/100
                  </MetricValue>
                  <EngagementGauge>
                    <EngagementLevel score={question.engagementScore} />
                  </EngagementGauge>
                </MetricCard>
              </MetricsGrid>
              
              <AnswersContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  {getAnswersForDisplay(question)
                    // Sort by optionIndex if available (for Likert scale questions)
                    .sort((a: AnswerData, b: AnswerData) => {
                      if (a.optionIndex !== undefined && b.optionIndex !== undefined) {
                        return a.optionIndex - b.optionIndex;
                      }
                      return 0;
                    })
                    .map((answer: AnswerData, index: number) => {
                    // Use the original percentage from the answer object
                    // This preserves the percentages calculated on the backend
                    const displayPercentage = answer.percentage || 0;
                    
                    return (
                      <div key={`${question.questionId}-${answer.value}-bar`} style={{ flex: 1 }}>
                        <div style={{ textAlign: 'center', marginBottom: '8px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AnswerLabel title={answer.value}>
                            {answer.value}
                          </AnswerLabel>
                        </div>
                        <BarRow>
                          <Bar percentage={displayPercentage} index={index} />
                        </BarRow>
                        <AnswerCount>
                          <span>{answer.count}</span>
                          <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>({displayPercentage}%)</span>
                        </AnswerCount>
                      </div>
                    );
                  })}
                </div>
              </AnswersContainer>
            </QuestionCard>
            ))}
          </QuestionsContainer>
          
          {/* Show View All button only on Overview page when there are more than 2 questions */}
          {isOverview && filteredData.length > 2 && (
            <ViewAllButton onClick={() => {
              // Navigate to the Questions tab
              const questionsTab = document.querySelector('[data-tab="questions"]');
              if (questionsTab) {
                (questionsTab as HTMLElement).click();
              }
            }} />
          )}
          
          {/* Only show pagination if not in overview mode and we have enough questions */}
          {!isOverview && filteredData.length > itemsPerPage && (
            <PaginationContainer>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>Items per page:</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    backgroundColor: 'white',
                    marginRight: '20px'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} - {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}</span>
              </div>
              
              <div>
                <PaginationButton 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                >
                  First
                </PaginationButton>
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                >
                  Previous
                </PaginationButton>
                {(() => {
                  // Show current page and 2 pages before and after
                  const pageNumbers = [];
                  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
                  
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, currentPage + 2);
                  
                  // Adjust if we're near the start or end
                  if (currentPage <= 3) {
                    endPage = Math.min(5, totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    startPage = Math.max(1, totalPages - 4);
                  }
                  
                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(
                      <PaginationButton 
                        key={i} 
                        onClick={() => setCurrentPage(i)}
                        active={i === currentPage}
                      >
                        {i}
                      </PaginationButton>
                    );
                  }
                  
                  return pageNumbers;
                })()}
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage)))} 
                  disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                >
                  Next
                </PaginationButton>
                <PaginationButton 
                  onClick={() => setCurrentPage(Math.ceil(filteredData.length / itemsPerPage))} 
                  disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                >
                  Last
                </PaginationButton>
              </div>
            </PaginationContainer>
          )}
        </>
      )}
    </ChartContainer>
  );
};

export default QuestionPerformanceChart;

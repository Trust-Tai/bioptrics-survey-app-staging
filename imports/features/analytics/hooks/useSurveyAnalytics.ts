import { useState, useEffect, useCallback } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Surveys } from '/imports/features/surveys/api/surveys';
import { Questions } from '/imports/features/questions/api/questions';
import { Layers } from '/imports/api/layers';
import { SurveyResponses } from '/imports/features/surveys/api/surveyResponses';

// Define types for analytics data
export interface AnalyticsFilterParams {
  surveyIds?: string[];
  tagIds?: string[];
  questionIds?: string[];
  startDate?: string;
  endDate?: string;
}

export interface AnalyticsData {
  // KPI metrics
  completedSurveysCount: number;
  participationRate: number;
  completionRate: number;
  avgEngagementScore: number;
  avgCompletionTime: number;
  responseRate: number;
  
  // Chart data
  responseTrendsData: any[];
  responseRateData: Array<{date: string; count: number}>;
  completionTimeData: Array<{date: string; minutes: number}>;
  completionRateData: {completed: number; incomplete: number};
  
  // Loading state
  isLoading: boolean;
}

export interface TagData {
  _id: string;
  name: string;
  color?: string;
  parent?: string;
  children?: TagData[];
  depth?: number;
  usageContext: {
    inSurveys: boolean;
    inQuestions: boolean;
  };
}

export interface SurveyAnalyticsResult {
  // Main analytics data
  analyticsData: AnalyticsData;
  
  // Filter data
  tags: TagData[];
  surveys: any[];
  questions: any[];
  
  // Loading states
  isLoadingAnalytics: boolean;
  isLoadingTags: boolean;
  isLoadingSurveys: boolean;
  isLoadingQuestions: boolean;
  
  // Filter state
  filterParams: AnalyticsFilterParams;
  
  // Filter update function
  updateFilters: (newFilters: Partial<AnalyticsFilterParams>) => void;
  
  // Date range helpers
  getDateRangeParams: (rangeType: string) => { startDate?: Date, endDate?: Date };
}

/**
 * Custom hook for fetching and managing survey analytics data
 * @param surveyId Optional survey ID to filter analytics by a specific survey
 * @returns Analytics data, loading states, and filter management functions
 */
export const useSurveyAnalytics = (surveyId?: string): SurveyAnalyticsResult => {
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    completedSurveysCount: 0,
    participationRate: 0,
    completionRate: 0,
    avgEngagementScore: 0,
    avgCompletionTime: 0,
    responseRate: 0,
    responseTrendsData: [],
    responseRateData: [],
    completionTimeData: [],
    completionRateData: { completed: 0, incomplete: 0 },
    isLoading: true
  });
  
  // State for filter parameters
  const [filterParams, setFilterParams] = useState<AnalyticsFilterParams>({
    surveyIds: surveyId ? [surveyId] : undefined,
  });
  
  // Function to update filters
  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilterParams>) => {
    setFilterParams(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  }, []);
  
  // Helper function to get date range parameters based on range type
  const getDateRangeParams = useCallback((rangeType: string) => {
    const today = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined = new Date(today);
    
    switch (rangeType) {
      case 'today':
        startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'current_week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last_7_days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'last_week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - 7); // Start of last week
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of last week
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'current_month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'last_3_months':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        break;
      default:
        return {};
    }
    
    return { startDate, endDate };
  }, []);
  
  // Fetch analytics data when filter parameters change
  const fetchAnalyticsData = useCallback(async () => {
    setAnalyticsData(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Use Promise.all to fetch all data in parallel
      const [
        completedSurveysCount,
        participationRate,
        completionRate,
        avgEngagementScore,
        avgCompletionTime,
        responseRate,
        responseTrendsData
      ] = await Promise.all([
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredSurveysCount', filterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredParticipationRate', filterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getQuestionCompletionRate', filterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredEngagementScore', filterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result || 0);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredCompletionTime', filterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<number>((resolve, reject) => {
          Meteor.call('getFilteredResponseRate', filterParams, (error: Error, result: number) => {
            if (error) reject(error);
            else resolve(result);
          });
        }),
        new Promise<any[]>((resolve, reject) => {
          Meteor.call('getResponseTrendsData', filterParams, (error: Error, result: any[]) => {
            if (error) reject(error);
            else resolve(result);
          });
        })
      ]);
      
      // Transform response trends data for the chart
      const responseRateData = responseTrendsData.map((item: any) => ({
        date: item.date,
        count: item.responses
      }));
      
      // Update analytics data state
      setAnalyticsData({
        completedSurveysCount,
        participationRate,
        completionRate,
        avgEngagementScore,
        avgCompletionTime,
        responseRate,
        responseTrendsData,
        responseRateData,
        completionTimeData: [], // Will be fetched on demand when needed
        completionRateData: { completed: 0, incomplete: 0 }, // Will be fetched on demand when needed
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsData(prev => ({ ...prev, isLoading: false }));
    }
  }, [filterParams]);
  
  // Fetch completion time data for a specific date range
  const fetchCompletionTimeData = useCallback(async (dateRange: string) => {
    try {
      return await new Promise<Array<{date: string; minutes: number}>>((resolve, reject) => {
        Meteor.call('getSurveyCompletionTimeByDate', dateRange, (error: Error, result: Array<{date: string; minutes: number}>) => {
          if (error) reject(error);
          else resolve(result || []);
        });
      });
    } catch (error) {
      console.error('Error fetching completion time data:', error);
      return [];
    }
  }, []);
  
  // Fetch completion rate data for a specific date range
  const fetchCompletionRateData = useCallback(async (dateRange: string) => {
    try {
      const { startDate, endDate } = getDateRangeParams(dateRange);
      const filterParams: any = {};
      
      if (startDate) filterParams.startDate = startDate.toISOString();
      if (endDate) filterParams.endDate = endDate.toISOString();
      
      const completedCount = await new Promise<number>((resolve, reject) => {
        Meteor.call('getFilteredSurveysCount', filterParams, (error: Error, result: number) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      
      const filterParamsForIncomplete = { ...filterParams, includeIncomplete: true };
      const totalCount = await new Promise<number>((resolve, reject) => {
        Meteor.call('getFilteredSurveysCount', filterParamsForIncomplete, (error: Error, result: number) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      
      const incompleteCount = totalCount - completedCount;
      return { completed: completedCount, incomplete: incompleteCount };
    } catch (error) {
      console.error('Error fetching completion rate data:', error);
      return { completed: 0, incomplete: 0 };
    }
  }, [getDateRangeParams]);
  
  // Fetch analytics data when filter parameters change
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);
  
  // Use useTracker to fetch tags, surveys, and questions
  const { tags, isLoadingTags } = useTracker(() => {
    const subscription = Meteor.subscribe('layers.all');
    
    const allTags = Layers.find({ active: true }, { sort: { name: 1 } }).fetch();
    
    // Process tags to determine usage context (in surveys, in questions)
    const processedTags = allTags.map(tag => {
      // This would normally involve checking which surveys and questions use this tag
      // For now, we'll assume all tags can be used in both
      return {
        ...tag,
        usageContext: {
          inSurveys: true,
          inQuestions: true
        }
      };
    });
    
    return {
      tags: processedTags,
      isLoadingTags: !subscription.ready()
    };
  }, []);
  
  // Fetch surveys - optimized to only fetch necessary fields
  const { surveys, isLoadingSurveys } = useTracker(() => {
    const subscription = Meteor.subscribe('surveys.analytics', surveyId);
    
    const surveysData = Surveys.find(
      surveyId ? { _id: surveyId } : {},
      { 
        fields: { 
          _id: 1, 
          title: 1, 
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          selectedTags: 1
        },
        sort: { updatedAt: -1 } 
      }
    ).fetch();
    
    return {
      surveys: surveysData,
      isLoadingSurveys: !subscription.ready()
    };
  }, [surveyId]);
  
  // Fetch questions - optimized to only fetch necessary fields
  const { questions, isLoadingQuestions } = useTracker(() => {
    // If we have a specific survey, only fetch questions for that survey
    const subscription = surveyId 
      ? Meteor.subscribe('questions.bySurvey', surveyId)
      : Meteor.subscribe('questions.analytics');
    
    const questionsData = Questions.find(
      {}, 
      { 
        fields: { 
          _id: 1, 
          currentVersion: 1, 
          versions: 1,
          createdAt: 1,
          updatedAt: 1
        },
        sort: { updatedAt: -1 } 
      }
    ).fetch();
    
    // Process questions to extract current version data
    const processedQuestions = questionsData.map(question => {
      const currentVersion = question.versions && question.currentVersion 
        ? question.versions[question.currentVersion - 1] 
        : null;
      
      return {
        _id: question._id,
        questionText: currentVersion?.questionText || '',
        responseType: currentVersion?.responseType || '',
        categoryTags: currentVersion?.categoryTags || [],
        createdAt: question.createdAt,
        updatedAt: question.updatedAt
      };
    });
    
    return {
      questions: processedQuestions,
      isLoadingQuestions: !subscription.ready()
    };
  }, [surveyId]);
  
  return {
    analyticsData,
    tags,
    surveys,
    questions,
    isLoadingAnalytics: analyticsData.isLoading,
    isLoadingTags,
    isLoadingSurveys,
    isLoadingQuestions,
    filterParams,
    updateFilters,
    getDateRangeParams
  };
};

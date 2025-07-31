import { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

// Define types for dashboard data
export interface DashboardFilters {
  site: string;
  department: string;
  role: string;
  survey: string;
}

export interface KpiStat {
  label: string;
  value: number;
  icon: any; // React icon component type
  link: string;
}

export interface SiteData {
  name: string;
  value: number;
  color: string;
}

export interface HeatMapData {
  theme: string;
  surveyScores: number[];
}

export interface FlaggedIssue {
  id: number;
  text: string;
  severity: 'high' | 'medium' | 'low';
}

export interface TrendData {
  month: string;
  score: number;
}

export interface ActivityItem {
  time: string;
  action: string;
}

export interface DashboardData {
  stats: KpiStat[];
  participationPct: number;
  siteData: SiteData[];
  heatMapData: HeatMapData[];
  flaggedIssues: FlaggedIssue[];
  trendData: TrendData[];
  totalResponses: number;
  completedResponses: number;
  pendingResponses: number;
  uniqueParticipants: number;
}

/**
 * Custom hook to fetch and manage dashboard data
 * Consolidates multiple data fetching operations into a single hook
 */
export const useDashboardData = (filters: DashboardFilters) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showAnonymityWarning, setShowAnonymityWarning] = useState<boolean>(false);
  
  // Dynamically import collections
  const [QuestionsCollection, setQuestionsCollection] = useState<any>(null);
  const [SurveysCollection, setSurveysCollection] = useState<any>(null);
  const [ResponsesCollection, setResponsesCollection] = useState<any>(null);

  // Load collections
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const [questionsModule, surveysModule, responsesModule] = await Promise.all([
          import('../../../api/questions'),
          import('../../../features/surveys/api/surveys'),
          import('../../../features/surveys/api/surveyResponses')
        ]);
        
        setQuestionsCollection(questionsModule.Questions);
        setSurveysCollection(surveysModule.Surveys);
        setResponsesCollection(responsesModule.SurveyResponses);
      } catch (err) {
        console.error('Error loading collections:', err);
        setError(err instanceof Error ? err : new Error('Failed to load collections'));
      }
    };
    
    loadCollections();
  }, []);

  // Use Meteor's reactive data system to fetch data
  const { questions, surveys, responses, subscriptionsReady } = useTracker(() => {
    // Default empty values
    if (!QuestionsCollection || !SurveysCollection || !ResponsesCollection) {
      return { 
        questions: [], 
        surveys: [], 
        responses: [],
        subscriptionsReady: false 
      };
    }

    // Subscribe to collections with field filtering for better performance
    const questionsSub = Meteor.subscribe('questions.all', { 
      fields: { _id: 1, currentVersion: 1, versions: 1 }
    });
    
    const surveysSub = Meteor.subscribe('surveys.all', { 
      fields: { _id: 1, title: 1, isActive: 1, startDate: 1, endDate: 1 }
    });
    
    const responsesSub = Meteor.subscribe('surveyResponses.all', { 
      fields: { 
        _id: 1, 
        surveyId: 1, 
        userId: 1, 
        completed: 1, 
        site: 1, 
        department: 1, 
        role: 1
      }
    });

    const subscriptionsReady = 
      questionsSub.ready() && 
      surveysSub.ready() && 
      responsesSub.ready();

    // Fetch data only when subscriptions are ready
    const questions = subscriptionsReady ? QuestionsCollection.find({}).fetch() : [];
    const surveys = subscriptionsReady ? SurveysCollection.find({}).fetch() : [];
    const responses = subscriptionsReady ? ResponsesCollection.find({}).fetch() : [];

    return { questions, surveys, responses, subscriptionsReady };
  }, [QuestionsCollection, SurveysCollection, ResponsesCollection]);

  // Process data when subscriptions are ready or filters change
  useEffect(() => {
    if (!subscriptionsReady) {
      setIsLoading(true);
      return;
    }

    try {
      // Apply filters to responses
      const filteredResponses = responses.filter((response: any) => {
        if (filters.site !== 'all' && response.site !== filters.site) return false;
        if (filters.department !== 'all' && response.department !== filters.department) return false;
        if (filters.role !== 'all' && response.role !== filters.role) return false;
        if (filters.survey !== 'all' && response.surveyId !== filters.survey) return false;
        return true;
      });

      // Check anonymity threshold
      const anonymityThreshold = 5;
      setShowAnonymityWarning(filteredResponses.length > 0 && filteredResponses.length < anonymityThreshold);

      // Filter for active surveys
      const activeSurveys = surveys.filter((s: any) => {
        // In a real implementation, check survey.isActive or startDate/endDate
        return true; // Placeholder - all surveys are considered active for now
      });

      // Count total questions and unique participants/responses
      const totalQuestions = questions.length;
      const totalResponses = filteredResponses.length;
      const completedResponses = filteredResponses.filter((r: any) => r.completed).length;
      const pendingResponses = totalResponses - completedResponses;
      const uniqueParticipants = new Set(filteredResponses.map((r: any) => r.userId)).size;

      // Prepare KPI stats
      const stats = [
        { label: 'Total Surveys', value: surveys.length, icon: 'FaClipboardList', link: '/admin/surveys/all' },
        { label: 'Active Surveys', value: activeSurveys.length, icon: 'FaCalendarAlt', link: '/admin/surveys/all' },
        { label: 'Question Bank', value: totalQuestions, icon: 'FaQuestionCircle', link: '/admin/questions/all' },
        { label: 'Participants', value: uniqueParticipants, icon: 'FaUsers', link: '/admin/analytics' },
      ];

      // Participation percentage
      const participationPct = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

      // Response data by site (in a real implementation, this would be calculated from actual data)
      const siteData = [
        { name: 'Rainy River', value: 70, color: '#7ec16c' },
        { name: 'New Afton', value: 55, color: '#f7ca51' },
        { name: 'Corporate', value: 40, color: '#f28b63' },
        { name: 'Other', value: 0, color: '#dddddd' }
      ];

      // Heat map data (in a real implementation, this would be calculated from actual data)
      const heatMapData = [
        { theme: 'Engagement', surveyScores: [4.2, 3.9, 4.1] },
        { theme: 'Manager Relations', surveyScores: [3.7, 2.9, 3.1] },
        { theme: 'Team Dynamics', surveyScores: [4.5, 4.3, 4.2] },
        { theme: 'Communication', surveyScores: [3.5, 4.1, 3.7] },
        { theme: 'Recognition', surveyScores: [3.1, 3.0, 3.4] },
        { theme: 'Work-Life Balance', surveyScores: [2.8, 2.7, 3.2] },
      ];

      // Flagged issues (in a real implementation, this would be calculated from actual data)
      const flaggedIssues = [
        { id: 1, text: 'Communication score dropped from 4.1 → 3.5', severity: 'high' as const },
        { id: 2, text: 'Leadership Trust fell below threshold: 2.9', severity: 'high' as const },
        { id: 3, text: 'Team Collaboration declined by 12% since last survey', severity: 'medium' as const },
        { id: 4, text: 'Work-Life Balance flagged in multiple sites', severity: 'medium' as const },
        { id: 5, text: 'Manager Feedback score critically low at 2.5', severity: 'low' as const }
      ];

      // Trend data (in a real implementation, this would be calculated from actual data)
      const trendData = [
        { month: 'Sep', score: 4.2 },
        { month: 'Jun', score: 4.0 },
        { month: 'Mar', score: 3.6 },
      ];

      // Set dashboard data
      setDashboardData({
        stats,
        participationPct,
        siteData,
        heatMapData,
        flaggedIssues,
        trendData,
        totalResponses,
        completedResponses,
        pendingResponses,
        uniqueParticipants
      });

      setIsLoading(false);
    } catch (err) {
      console.error('Error processing dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Failed to process dashboard data'));
      setIsLoading(false);
    }
  }, [subscriptionsReady, filters, questions, surveys, responses]);

  return {
    isLoading,
    error,
    dashboardData,
    showAnonymityWarning
  };
};

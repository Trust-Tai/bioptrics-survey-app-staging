import { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { SurveyResponses } from '../api/surveyResponses';
import { IncompleteSurveyResponses } from '../api/incompleteSurveyResponses';

/**
 * Custom hook to fetch and manage survey responses
 * Optimizes data loading and processing for responses
 */
export const useSurveyResponses = (surveyId: string | undefined, shouldLoad: boolean = false) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [surveyResponses, setSurveyResponses] = useState<any[]>([]);
  const [responseStats, setResponseStats] = useState<any>({
    totalResponses: 0,
    totalTags: 0,
    completionRate: 0,
    avgEngagement: 0,
    timeToComplete: 0,
    responseRate: 0
  });
  const [error, setError] = useState<Error | null>(null);

  // Calculate engagement score for a response
  const calculateEngagementScore = (response: any): number => {
    if (!response || !response.responses) return 0;
    
    // Base score on completion status
    let score = response.isCompleted ? 50 : 0;
    
    // Add points for each answered question
    score += Math.min(50, (response.responses.length * 2));
    
    return Math.min(100, score);
  };

  // Use Meteor's reactive data system to subscribe to responses
  const { completedSubscriptionReady, incompleteSubscriptionReady } = useTracker(() => {
    // Only subscribe if we have a surveyId and should load responses
    if (!surveyId || !shouldLoad) {
      return { completedSubscriptionReady: true, incompleteSubscriptionReady: true };
    }

    // Subscribe to completed and incomplete responses with field filtering
    const completedSubscription = Meteor.subscribe('surveyResponses.bySurvey', surveyId, {
      fields: {
        _id: 1,
        surveyId: 1,
        userId: 1,
        demographics: 1,
        responses: 1,
        endTime: 1,
        startTime: 1,
        updatedAt: 1,
        completionTime: 1,
        engagementScore: 1
      }
    });
    
    const incompleteSubscription = Meteor.subscribe('incompleteSurveyResponses.bySurvey', surveyId, {
      fields: {
        _id: 1,
        surveyId: 1,
        responses: 1,
        lastUpdatedAt: 1,
        engagementScore: 1,
        isCompleted: 1
      }
    });

    return {
      completedSubscriptionReady: completedSubscription.ready(),
      incompleteSubscriptionReady: incompleteSubscription.ready()
    };
  }, [surveyId, shouldLoad]);

  // Load survey responses when shouldLoad is true and subscriptions are ready
  useEffect(() => {
    if (!surveyId || !shouldLoad) {
      return;
    }

    if (!completedSubscriptionReady || !incompleteSubscriptionReady) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch completed survey responses
      const completedResponses = SurveyResponses.find({ surveyId }).fetch();
      
      // Fetch incomplete responses for this survey
      const incompleteResponses = IncompleteSurveyResponses.find({ 
        surveyId,
        isCompleted: false
      }).fetch();
      
      // Format the responses for display
      const formattedResponses = [
        // Format completed responses
        ...completedResponses.map(response => ({
          _id: response._id,
          respondentName: response.demographics?.name || 
                        (response.userId ? 'User ' + response.userId.substring(0, 5) : 'Anonymous'),
          email: response.demographics?.email || 'No email provided',
          submittedAt: response.endTime || response.updatedAt,
          isComplete: true,
          progress: 100,
          responses: response.responses || [],
          timeToComplete: response.completionTime || 0,
          engagementScore: response.engagementScore || calculateEngagementScore({...response, isCompleted: true})
        })),
        
        // Format incomplete responses
        ...incompleteResponses.map(response => ({
          _id: response._id,
          respondentName: 'Anonymous',
          email: 'No email provided',
          submittedAt: response.lastUpdatedAt,
          isComplete: false,
          progress: response.responses ? 
            Math.round((response.responses.length / 10) * 100) : 0, // Estimate based on typical question count
          responses: response.responses || [],
          timeToComplete: 0,
          engagementScore: response.engagementScore || calculateEngagementScore({...response, isCompleted: false})
        }))
      ];
      
      // Sort by date (newest first)
      formattedResponses.sort((a, b) => {
        const dateA = new Date(a.submittedAt).getTime();
        const dateB = new Date(b.submittedAt).getTime();
        return dateB - dateA;
      });
      
      // Calculate response stats
      const totalResponses = formattedResponses.length;
      
      // Calculate completion rate
      const completedCount = formattedResponses.filter(r => r.isComplete).length;
      const completionRate = totalResponses > 0 ? Math.round((completedCount / totalResponses) * 100) : 0;
      
      // Calculate average engagement
      const totalEngagement = formattedResponses.reduce((sum, r) => sum + (r.engagementScore || 0), 0);
      const avgEngagement = totalResponses > 0 ? Math.round(totalEngagement / totalResponses) : 0;
      
      // Calculate average time to complete (in seconds)
      const completedResponsesForStats = formattedResponses.filter(r => r.isComplete && r.timeToComplete > 0);
      const totalTime = completedResponsesForStats.reduce((sum, r) => sum + (r.timeToComplete || 0), 0);
      const avgTimeToComplete = completedResponsesForStats.length > 0 ? Math.round(totalTime / completedResponsesForStats.length) : 0;
      
      // Calculate response rate based on completed vs total responses
      const totalInvited = 100; // Default value if not available
      const responseRate = totalInvited > 0 ? Math.round((totalResponses / totalInvited) * 100) : 0;
      
      // Update response stats
      setResponseStats({
        totalResponses,
        totalTags: 0, // This will be updated from the main component
        completionRate,
        avgEngagement,
        timeToComplete: avgTimeToComplete,
        responseRate
      });
      
      setSurveyResponses(formattedResponses);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading survey responses:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading responses'));
      setIsLoading(false);
    }
  }, [surveyId, shouldLoad, completedSubscriptionReady, incompleteSubscriptionReady]);

  return {
    isLoading,
    surveyResponses,
    responseStats,
    setResponseStats, // Allow updating totalTags from parent
    error
  };
};

import { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { SurveyResponses } from '../../../features/surveys/api/surveyResponses';
import { IncompleteSurveyResponses } from '../../../features/surveys/api/incompleteSurveyResponses';

// Types
export interface ResponseStats {
  totalResponses: number;
  totalTags: number;
  completionRate: number;
  avgEngagement: number;
  timeToComplete: number;
  responseRate: number;
}

// Hook for managing survey responses
export const useResponseManagement = (surveyId?: string, activeStep?: string) => {
  // State
  const [isLoadingResponses, setIsLoadingResponses] = useState<boolean>(false);
  const [surveyResponses, setSurveyResponses] = useState<any[]>([]);
  const [responseStats, setResponseStats] = useState<ResponseStats>({
    totalResponses: 0,
    totalTags: 0,
    completionRate: 0,
    avgEngagement: 0,
    timeToComplete: 0,
    responseRate: 0
  });
  const [expandedResponseIds, setExpandedResponseIds] = useState<string[]>([]);

  // Calculate engagement score for a response
  const calculateEngagementScore = (response: any): number => {
    if (!response || !response.responses) return 0;
    
    let score = 0;
    const responses = response.responses;
    
    // Count answered questions
    const answeredCount = Object.keys(responses).length;
    score += answeredCount * 10; // 10 points per answered question
    
    // Bonus for text responses (more engagement)
    Object.values(responses).forEach((resp: any) => {
      if (typeof resp === 'string' && resp.length > 50) {
        score += 5; // Bonus for longer text responses
      }
    });
    
    return Math.min(score, 100); // Cap at 100
  };

  // Load survey responses when the responses tab is selected
  useEffect(() => {
    if (activeStep === 'responses' && surveyId) {
      setIsLoadingResponses(true);
      
      // Fetch survey responses
      Meteor.call('getSurveyResponses', surveyId, (error: Meteor.Error, result: any[]) => {
        setIsLoadingResponses(false);
        if (error) {
          console.error('Error fetching survey responses:', error);
          return;
        }
        setSurveyResponses(result || []);
      });
    }
  }, [activeStep, surveyId]);

  // Subscribe to responses data
  useTracker(() => {
    if (surveyId && activeStep === 'responses') {
      // Create a combined subscription for both completed and incomplete responses
      const completedSubscription = Meteor.subscribe('surveyResponses.bySurvey', surveyId);
      const incompleteSubscription = Meteor.subscribe('incompleteSurveyResponses.all');
      
      // Check subscription status periodically
      const checkSubscriptions = () => {
        if (completedSubscription.ready() && incompleteSubscription.ready()) {
          try {
            // Get completed responses
            const completedResponses = SurveyResponses.find({ surveyId }).fetch();
            
            // Get incomplete responses for this survey
            const incompleteResponses = IncompleteSurveyResponses.find({ surveyId }).fetch();
            
            // Combine and format responses
            const allResponses = [
              ...completedResponses.map(resp => ({ ...resp, status: 'completed' })),
              ...incompleteResponses.map(resp => ({ ...resp, status: 'incomplete' }))
            ];
            
            // Calculate statistics
            const totalResponses = allResponses.length;
            const completedCount = completedResponses.length;
            const completionRate = totalResponses > 0 ? Math.round((completedCount / totalResponses) * 100) : 0;
            
            // Calculate engagement scores
            const engagementScores = allResponses.map(calculateEngagementScore);
            const avgEngagement = engagementScores.length > 0 
              ? Math.round(engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length)
              : 0;
            
            // Calculate average time to complete (for completed responses only)
            const completedWithTime = completedResponses.filter(resp => resp.completedAt && resp.startedAt);
            const timeToComplete = completedWithTime.length > 0
              ? Math.round(completedWithTime.reduce((sum, resp) => {
                  const timeDiff = new Date(resp.completedAt).getTime() - new Date(resp.startedAt).getTime();
                  return sum + (timeDiff / 1000 / 60); // Convert to minutes
                }, 0) / completedWithTime.length)
              : 0;
            
            // Count unique tags
            const allTags = new Set();
            allResponses.forEach(resp => {
              if (resp.tags && Array.isArray(resp.tags)) {
                resp.tags.forEach(tag => allTags.add(tag));
              }
            });
            const totalTags = allTags.size;
            
            // Calculate response rate (this would need survey metadata)
            const responseRate = 0; // This would need to be calculated based on survey distribution
            
            // Format responses for display
            const formattedResponses = allResponses.map((response, index) => ({
              ...response,
              id: response._id || `response_${index}`,
              engagementScore: calculateEngagementScore(response),
              formattedDate: response.completedAt 
                ? new Date(response.completedAt).toLocaleDateString()
                : new Date(response.startedAt).toLocaleDateString()
            }));
            
            // Update response stats
            setResponseStats({
              totalResponses,
              totalTags,
              completionRate,
              avgEngagement,
              timeToComplete,
              responseRate
            });
            
            setSurveyResponses(formattedResponses);
            
            setIsLoadingResponses(false);
          } catch (error) {
            console.error('Error processing responses:', error);
            setIsLoadingResponses(false);
          }
        }
      };
      
      // Check immediately and then periodically
      checkSubscriptions();
      const interval = setInterval(checkSubscriptions, 1000);
      
      return () => {
        clearInterval(interval);
        completedSubscription.stop();
        incompleteSubscription.stop();
      };
    }
  }, [surveyId, activeStep]);

  // Toggle response details expansion
  const toggleResponseDetails = (responseId: string) => {
    setExpandedResponseIds(prev => 
      prev.includes(responseId)
        ? prev.filter(id => id !== responseId)
        : [...prev, responseId]
    );
  };

  return {
    // State
    isLoadingResponses,
    surveyResponses,
    setSurveyResponses,
    responseStats,
    setResponseStats,
    expandedResponseIds,
    setExpandedResponseIds,

    // Functions
    calculateEngagementScore,
    toggleResponseDetails,
  };
};







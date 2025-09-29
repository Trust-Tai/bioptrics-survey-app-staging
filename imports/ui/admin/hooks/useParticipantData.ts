import { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { FilterParams } from '../Analytics';

interface ParticipantData {
  count: number;
  trend: {
    value: number;
    direction: 'positive' | 'negative' | 'neutral';
  };
  isLoading: boolean;
  error: Error | null;
}

export const useParticipantData = (surveyId?: string, filterParams?: FilterParams): ParticipantData => {
  const [data, setData] = useState<ParticipantData>({
    count: 0,
    trend: {
      value: 0,
      direction: 'neutral'
    },
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Set loading state
    setData(prev => ({ ...prev, isLoading: true }));
    
    // Determine which filter to use
    // If filterParams is provided, use it
    // Otherwise, create a filter with just the surveyId (if provided)
    const filter = filterParams || { surveyIds: surveyId ? [surveyId] : [] };
    
    // Call Meteor method to get participant count
    Meteor.call('getFilteredSurveysCount', filter, (error: Error, result: number) => {
      if (error) {
        console.error('Error fetching participant count:', error);
        setData({
          count: 0,
          trend: { value: 0, direction: 'neutral' },
          isLoading: false,
          error
        });
      } else {
        // For now, we'll use a mock trend value
        // In a real implementation, you would compare with previous period data
        const mockTrendValue = Math.floor(Math.random() * 15) + 5; // Random between 5 and 19
        
        setData({
          count: result || 0,
          trend: {
            value: mockTrendValue,
            direction: 'positive' // Always positive for demo purposes
          },
          isLoading: false,
          error: null
        });
      }
    });
  }, [surveyId, filterParams]);

  return data;
};

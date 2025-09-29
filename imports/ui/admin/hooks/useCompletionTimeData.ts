import { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { FilterParams } from '../Analytics';

interface CompletionTimeData {
  time: number; // in seconds
  trend: {
    value: number;
    direction: 'positive' | 'negative' | 'neutral';
  };
  isLoading: boolean;
  error: Error | null;
}

export const useCompletionTimeData = (surveyId?: string, filterParams?: FilterParams): CompletionTimeData => {
  const [data, setData] = useState<CompletionTimeData>({
    time: 0,
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
    
    // Call Meteor method to get completion time data (in seconds)
    // Use the same method as in SurveyAnalyticsTab for consistent formatting
    if (filter.surveyIds?.length === 1) {
      // If there's exactly one survey selected, use getCurrentCompletionTime for consistent formatting
      Meteor.call('getCurrentCompletionTime', filter.surveyIds[0], (error: Error, result: number) => {
        if (error) {
          console.error('Error fetching completion time:', error);
          setData({
            time: 0,
            trend: { value: 0, direction: 'neutral' },
            isLoading: false,
            error
          });
        } else {
          // For now, we'll use a mock trend value
          // In a real implementation, you would compare with previous period data
          const mockTrendValue = Math.floor(Math.random() * 10) - 5; // Random between -5 and +4
          
          setData({
            time: result || 0,
            trend: {
              value: mockTrendValue,
              direction: mockTrendValue < 0 ? 'positive' : mockTrendValue > 0 ? 'negative' : 'neutral'
              // Note: For completion time, a negative trend (less time) is actually positive
            },
            isLoading: false,
            error: null
          });
        }
      });
    } else {
      // For multiple surveys or no surveys, use getAccurateCompletionTime
      // Note: getAccurateCompletionTime returns time in seconds but may be formatted differently
      const surveyIds = filter.surveyIds || [];
      Meteor.call('getAccurateCompletionTime', surveyIds, (error: Error, result: number) => {
        if (error) {
          console.error('Error fetching completion time:', error);
          setData({
            time: 0,
            trend: { value: 0, direction: 'neutral' },
            isLoading: false,
            error
          });
        } else {
          // For now, we'll use a mock trend value
          // In a real implementation, you would compare with previous period data
          const mockTrendValue = Math.floor(Math.random() * 10) - 5; // Random between -5 and +4
          
          // Ensure we're using seconds for consistent formatting with formatTime function
          // The getAccurateCompletionTime method returns seconds but may be formatted differently
          const timeInSeconds = result || 0;
          console.log('Multiple surveys completion time (seconds):', timeInSeconds);
          
          setData({
            time: timeInSeconds,
            trend: {
              value: mockTrendValue,
              direction: mockTrendValue < 0 ? 'positive' : mockTrendValue > 0 ? 'negative' : 'neutral'
              // Note: For completion time, a negative trend (less time) is actually positive
            },
            isLoading: false,
            error: null
          });
        }
      });
    }
  }, [surveyId, filterParams]);

  return data;
};
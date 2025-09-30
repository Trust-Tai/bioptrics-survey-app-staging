import { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { FilterParams } from '../Analytics';

interface ResponseRateData {
  rate: number;
  trend: {
    value: number;
    direction: 'positive' | 'negative' | 'neutral';
  };
  isLoading: boolean;
  error: Error | null;
}

export const useResponseRateData = (surveyId?: string, filterParams?: FilterParams): ResponseRateData => {
  const [data, setData] = useState<ResponseRateData>({
    rate: 0,
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
    
    // Call Meteor method to get response rate data
    // Extract individual parameters from filter object to match server method signature
    Meteor.call(
      'getFilteredResponseRate', 
      filter.surveyIds, 
      filter.tagIds, 
      filter.questionIds, 
      filter.startDate, 
      filter.endDate, 
      (error: Error, result: number) => {
      if (error) {
        console.error('Error fetching response rate:', error);
        setData({
          rate: 0,
          trend: { value: 0, direction: 'neutral' },
          isLoading: false,
          error
        });
      } else {
        // For now, we'll use a mock trend value
        // In a real implementation, you would compare with previous period data
        const mockTrendValue = Math.floor(Math.random() * 10) - 3; // Random between -3 and +6
        
        setData({
          rate: result || 0,
          trend: {
            value: mockTrendValue,
            direction: mockTrendValue > 0 ? 'positive' : mockTrendValue < 0 ? 'negative' : 'neutral'
          },
          isLoading: false,
          error: null
        });
      }
    });
  }, [surveyId, filterParams]);

  return data;
};

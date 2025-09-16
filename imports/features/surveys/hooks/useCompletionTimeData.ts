import { useState, useEffect } from 'react';
import { ResponseRateService, TrendData } from '../services/ResponseRateService';

export interface CompletionTimeData {
  time: number;
  trend: TrendData;
  isLoading: boolean;
  error: Error | null;
}

export function useCompletionTimeData(surveyId: string): CompletionTimeData {
  const [data, setData] = useState<CompletionTimeData>({
    time: 0,
    trend: { value: 0, direction: 'neutral' },
    isLoading: true,
    error: null
  });
  
  useEffect(() => {
    const fetchData = async () => {
      if (!surveyId) return;
      
      try {
        setData(prev => ({ ...prev, isLoading: true }));
        
        // Fetch completion time and trend in parallel
        const [time, trend] = await Promise.all([
          ResponseRateService.getCompletionTime(surveyId),
          ResponseRateService.getCompletionTimeTrend(surveyId)
        ]);
        
        setData({
          time,
          trend,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching completion time data:', error);
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Unknown error')
        }));
      }
    };
    
    fetchData();
  }, [surveyId]);
  
  return data;
}

import { useState, useEffect } from 'react';
import { ResponseRateService, TrendData } from '../services/ResponseRateService';

export interface ParticipantData {
  count: number;
  trend: TrendData;
  isLoading: boolean;
  error: Error | null;
}

export function useParticipantData(surveyId: string): ParticipantData {
  const [data, setData] = useState<ParticipantData>({
    count: 0,
    trend: { value: 0, direction: 'neutral' },
    isLoading: true,
    error: null
  });
  
  useEffect(() => {
    const fetchData = async () => {
      if (!surveyId) return;
      
      try {
        setData(prev => ({ ...prev, isLoading: true }));
        
        // Fetch participant count and trend in parallel
        const [count, trend] = await Promise.all([
          ResponseRateService.getParticipantCount(surveyId),
          ResponseRateService.getParticipantCountTrend(surveyId)
        ]);
        
        setData({
          count,
          trend,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching participant data:', error);
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

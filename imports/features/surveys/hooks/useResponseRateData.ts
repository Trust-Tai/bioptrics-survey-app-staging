import { useState, useEffect } from 'react';
import { ResponseRateService } from '../services/ResponseRateService';

export interface ResponseRateData {
  rate: number;
  trend: {
    value: number;
    direction: 'positive' | 'negative' | 'neutral';
  };
  isLoading: boolean;
  error: Error | null;
}

export function useResponseRateData(surveyId: string): ResponseRateData {
  const [data, setData] = useState<ResponseRateData>({
    rate: 0,
    trend: { value: 0, direction: 'neutral' },
    isLoading: true,
    error: null
  });
  
  useEffect(() => {
    const fetchData = async () => {
      if (!surveyId) return;
      
      try {
        setData(prev => ({ ...prev, isLoading: true }));
        
        // Fetch response rate and trend in parallel
        const [rate, trend] = await Promise.all([
          ResponseRateService.getResponseRate(surveyId),
          ResponseRateService.getResponseRateTrend(surveyId)
        ]);
        
        setData({
          rate,
          trend,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching response rate data:', error);
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

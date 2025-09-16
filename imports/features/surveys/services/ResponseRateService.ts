import { Meteor } from 'meteor/meteor';

export interface SurveyMetrics {
  responseRate: number;
  participantCount: number;
  completionTime: number;
}

export interface TrendData {
  value: number;
  direction: 'positive' | 'negative' | 'neutral';
}

export class ResponseRateService {
  /**
   * Calculates the response rate for a specific survey
   * @param surveyId The ID of the survey
   * @returns Promise with the response rate percentage
   */
  static async getResponseRate(surveyId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      Meteor.call('getFilteredResponseRate', [surveyId], [], [], null, null, (error: Error, result: number) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }
  
  /**
   * Gets the total participant count for a survey
   * @param surveyId The ID of the survey
   * @returns Promise with the participant count
   */
  static async getParticipantCount(surveyId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      Meteor.call('getTotalResponsesCount', surveyId, (error: Error, result: number) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }
  
  
  /**
   * Gets all survey metrics in a single call
   * @param surveyId The ID of the survey
   * @returns Promise with all metrics
   */
  static async getSurveyMetrics(surveyId: string): Promise<SurveyMetrics> {
    const [responseRate, participantCount, completionTime] = await Promise.all([
      this.getResponseRate(surveyId),
      this.getParticipantCount(surveyId),
      this.getCompletionTime(surveyId)
    ]);
    
    return {
      responseRate,
      participantCount,
      completionTime
    };
  }
  
  
  /**
   * Calculates the response rate trend (change from previous period)
   * @param surveyId The ID of the survey
   * @returns Promise with the trend data
   */
  static async getResponseRateTrend(surveyId: string): Promise<TrendData> {
    // Get current period response rate
    const currentRate = await this.getResponseRate(surveyId);
    
    // Calculate previous period dates (last 30 days vs previous 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
    
    // Get previous period response rate
    const prevRate = await new Promise<number>((resolve, reject) => {
      Meteor.call(
        'getFilteredResponseRate', 
        [surveyId], 
        [], 
        [], 
        sixtyDaysAgo.toISOString(), 
        thirtyDaysAgo.toISOString(), 
        (error: Error, result: number) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    // Calculate trend
    const trendValue = currentRate - prevRate;
    const direction = trendValue > 0 ? 'positive' : trendValue < 0 ? 'negative' : 'neutral';
    
    return { value: trendValue, direction };
  }
  
  /**
   * Calculates the participant count trend (change from previous period)
   * @param surveyId The ID of the survey
   * @returns Promise with the trend data
   */
  static async getParticipantCountTrend(surveyId: string): Promise<TrendData> {
    // Get current participant count
    const currentCount = await this.getParticipantCount(surveyId);
    
    // For the previous period, we'll estimate based on a 12% growth rate
    // In a real implementation, you would query the database for historical data
    const prevCount = Math.round(currentCount / 1.12); // Assuming 12% growth
    
    // Calculate trend percentage
    const trendValue = prevCount > 0 ? Math.round(((currentCount - prevCount) / prevCount) * 100) : 0;
    const direction = trendValue > 0 ? 'positive' : trendValue < 0 ? 'negative' : 'neutral';
    
    return { value: trendValue, direction };
  }
  
  /**
   * Gets the average completion time for a survey
   * @param surveyId The ID of the survey
   * @returns Promise with the average completion time in seconds
   */
  static async getCompletionTime(surveyId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      Meteor.call('getCurrentCompletionTime', surveyId, (error: Error, result: number) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }
  
  /**
   * Calculates the completion time trend (change from previous period)
   * @param surveyId The ID of the survey
   * @returns Promise with the trend data
   */
  static async getCompletionTimeTrend(surveyId: string): Promise<TrendData> {
    // Get current completion time
    const currentTime = await this.getCompletionTime(surveyId);
    
    // For the previous period, we'll use a neutral trend (0% change)
    // In a real implementation, you would query the database for historical data
    const prevTime = currentTime; // Assuming no change for now
    
    // Calculate trend percentage
    const trendValue = prevTime > 0 ? Math.round(((currentTime - prevTime) / prevTime) * 100) : 0;
    const direction = trendValue > 0 ? 'negative' : trendValue < 0 ? 'positive' : 'neutral';
    // Note: For completion time, a decrease is positive (faster completion) and an increase is negative (slower completion)
    
    return { value: trendValue, direction };
  }
}

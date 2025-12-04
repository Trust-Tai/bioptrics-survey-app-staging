import { Meteor } from 'meteor/meteor';
import { ModuleEventBus } from '/imports/core/communication/ModuleEventBus';

// Analytics API for the Survey module
export const AnalyticsAPI = {
  // Get survey analytics
  getSurveyAnalytics: async (surveyId: string, dateRange?: { start: Date; end: Date }) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getAnalytics', surveyId, dateRange, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          // Publish event for tracking
          ModuleEventBus.getInstance().publish(
            'analytics.dashboard_viewed',
            { surveyId, dateRange, viewedAt: new Date() },
            'survey',
            Meteor.userId() || undefined
          );
          resolve(result);
        }
      });
    });
  },

  // Get response trends
  getResponseTrends: async (surveyId: string, period: 'day' | 'week' | 'month' = 'day') => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getResponseTrends', surveyId, period, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Get question analytics
  getQuestionAnalytics: async (surveyId: string, questionId?: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getQuestionAnalytics', surveyId, questionId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Get completion metrics
  getCompletionMetrics: async (surveyId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getCompletionMetrics', surveyId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Get engagement analytics
  getEngagementAnalytics: async (surveyId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getEngagementAnalytics', surveyId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Get device analytics
  getDeviceAnalytics: async (surveyId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getDeviceAnalytics', surveyId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Generate analytics report
  generateReport: async (surveyId: string, options?: any) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.generateAnalyticsReport', surveyId, options, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          // Publish event for tracking
          ModuleEventBus.getInstance().publish(
            'analytics.report_generated',
            { surveyId, options, generatedAt: new Date() },
            'survey',
            Meteor.userId() || undefined
          );
          resolve(result);
        }
      });
    });
  },

  // Track custom analytics event
  trackEvent: async (eventType: string, data: any) => {
    return new Promise((resolve, reject) => {
      Meteor.call('analytics.trackEvent', eventType, data, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          // Publish event for other modules
          ModuleEventBus.getInstance().publish(
            'analytics.event_tracked',
            { eventType, data, trackedAt: new Date() },
            'survey',
            Meteor.userId() || undefined
          );
          resolve(result);
        }
      });
    });
  }
};

export default AnalyticsAPI;

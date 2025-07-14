import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

// Collection to store real-time analytics data
export const RealTimeAnalytics = new Mongo.Collection('realTimeAnalytics');

// Define types for real-time analytics
export interface RealTimeEvent {
  _id?: string;
  surveyId: string;
  respondentId: string;
  eventType: 'pageView' | 'questionAnswer' | 'sectionComplete' | 'surveyStart' | 'surveyComplete' | 'surveyDropout';
  questionId?: string;
  sectionId?: string;
  timestamp: Date;
  timeSpent?: number;
  device?: {
    type: string;
    browser: string;
    os: string;
  };
  location?: {
    country?: string;
    city?: string;
  };
  metadata?: Record<string, any>;
}

// Define types for aggregated analytics
export interface RealTimeStats {
  _id?: string;
  surveyId: string;
  activeUsers: number;
  completedSurveys: number;
  averageCompletionTime: number;
  dropoutRate: number;
  questionsAnswered: number;
  responseRate: number;
  lastUpdated: Date;
}

// Create a new collection for aggregated stats
export const RealTimeStats = new Mongo.Collection<RealTimeStats>('realTimeStats');

if (Meteor.isServer) {
  // Publish real-time events for a specific survey
  Meteor.publish('realTimeEvents.bySurvey', function(surveyId) {
    if (!this.userId) {
      return this.ready();
    }
    
    return RealTimeAnalytics.find({ 
      surveyId,
      timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
    }, {
      sort: { timestamp: -1 },
      limit: 1000
    });
  });
  
  // Publish aggregated stats for a specific survey
  Meteor.publish('realTimeStats.bySurvey', function(surveyId) {
    if (!this.userId) {
      return this.ready();
    }
    
    return RealTimeStats.find({ surveyId });
  });
  
  // Publish all real-time stats (for admins)
  Meteor.publish('realTimeStats.all', function() {
    if (!this.userId) {
      return this.ready();
    }
    
    return RealTimeStats.find({});
  });
  
  // Server-side methods for tracking events
  Meteor.methods({
    'realTimeAnalytics.trackEvent'(event: Omit<RealTimeEvent, '_id'>) {
      // Insert the event
      RealTimeAnalytics.insert({
        ...event,
        timestamp: event.timestamp || new Date()
      });
      
      // Update aggregated stats
      updateRealTimeStats(event.surveyId);
      
      return true;
    },
    
    'realTimeAnalytics.getStats'(surveyId: string) {
      return RealTimeStats.findOne({ surveyId }) || createEmptyStats(surveyId);
    }
  });
  
  // Helper function to update real-time stats
  function updateRealTimeStats(surveyId: string) {
    // Get events from the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    // Count active users (unique respondentIds in the last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsers = RealTimeAnalytics.find({
      surveyId,
      timestamp: { $gte: fiveMinutesAgo }
    }).fetch();
    
    const uniqueActiveUsers = new Set(activeUsers.map(event => event.respondentId)).size;
    
    // Count completed surveys in the last 30 minutes
    const completedSurveys = RealTimeAnalytics.find({
      surveyId,
      eventType: 'surveyComplete',
      timestamp: { $gte: thirtyMinutesAgo }
    }).count();
    
    // Calculate average completion time
    const completedEvents = RealTimeAnalytics.find({
      surveyId,
      eventType: 'surveyComplete',
      timeSpent: { $exists: true, $ne: null }
    }).fetch();
    
    let averageCompletionTime = 0;
    if (completedEvents.length > 0) {
      const totalTime = completedEvents.reduce((sum, event) => sum + (event.timeSpent || 0), 0);
      averageCompletionTime = totalTime / completedEvents.length / 60; // Convert to minutes
    }
    
    // Calculate dropout rate
    const startEvents = RealTimeAnalytics.find({
      surveyId,
      eventType: 'surveyStart',
      timestamp: { $gte: thirtyMinutesAgo }
    }).count();
    
    const dropoutEvents = RealTimeAnalytics.find({
      surveyId,
      eventType: 'surveyDropout',
      timestamp: { $gte: thirtyMinutesAgo }
    }).count();
    
    let dropoutRate = 0;
    if (startEvents > 0) {
      dropoutRate = (dropoutEvents / startEvents) * 100;
    }
    
    // Count questions answered
    const questionAnswerEvents = RealTimeAnalytics.find({
      surveyId,
      eventType: 'questionAnswer',
      timestamp: { $gte: thirtyMinutesAgo }
    }).count();
    
    // Calculate response rate
    let responseRate = 0;
    if (startEvents > 0) {
      responseRate = (completedSurveys / startEvents) * 100;
    }
    
    // Update or insert stats
    RealTimeStats.upsert(
      { surveyId },
      {
        $set: {
          activeUsers: uniqueActiveUsers,
          completedSurveys,
          averageCompletionTime,
          dropoutRate,
          questionsAnswered: questionAnswerEvents,
          responseRate,
          lastUpdated: new Date()
        }
      }
    );
  }
  
  function createEmptyStats(surveyId: string): RealTimeStats {
    return {
      surveyId,
      activeUsers: 0,
      completedSurveys: 0,
      averageCompletionTime: 0,
      dropoutRate: 0,
      questionsAnswered: 0,
      responseRate: 0,
      lastUpdated: new Date()
    };
  }
}

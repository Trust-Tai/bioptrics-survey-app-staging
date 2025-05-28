import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

export interface SurveyResponseDoc {
  _id?: string;
  surveyId: string;
  userId?: string;
  respondentId?: string;
  responses: Array<{
    questionId: string;
    answer: any;
    sectionId?: string;
  }>;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  completionTime?: number; // in seconds
  progress: number; // percentage of completion
  metadata?: {
    browser?: string;
    device?: string;
    os?: string;
    ipAddress?: string;
    location?: string;
  };
  demographics?: {
    age?: string;
    gender?: string;
    location?: string;
    department?: string;
    jobTitle?: string;
    yearsOfService?: number;
    [key: string]: any;
  };
  feedback?: {
    rating?: number;
    comments?: string;
  };
  sectionTimes?: Record<string, number>; // time spent on each section in seconds
  createdAt: Date;
  updatedAt: Date;
}

export const SurveyResponses = new Mongo.Collection<SurveyResponseDoc>('surveyResponses');

if (Meteor.isServer) {
  // Publications
  Meteor.publish('surveyResponses.bySurvey', function(surveyId) {
    check(surveyId, String);
    
    // Check if user has permission to view responses
    const userId = this.userId;
    if (!userId) {
      return this.ready();
    }
    
    return SurveyResponses.find({ surveyId });
  });
  
  Meteor.publish('surveyResponses.byUser', function(userId) {
    check(userId, String);
    
    // Only allow users to see their own responses or admins
    if (this.userId !== userId && !Meteor.users.findOne({ _id: this.userId, roles: { $in: ['admin'] } })) {
      return this.ready();
    }
    
    return SurveyResponses.find({ userId });
  });
  
  // Methods
  Meteor.methods({
    'surveyResponses.submit'(responseData) {
      check(responseData, {
        surveyId: String,
        responses: Array,
        completed: Boolean,
        startTime: Date,
        endTime: Date,
        progress: Number,
        metadata: Object,
        demographics: Match.Maybe(Object),
        sectionTimes: Match.Maybe(Object)
      });
      
      // Add timestamps
      const now = new Date();
      responseData.createdAt = now;
      responseData.updatedAt = now;
      
      // Add user ID if logged in
      if (this.userId) {
        responseData.userId = this.userId;
      } else if (!responseData.respondentId) {
        // Generate anonymous respondent ID if not provided
        responseData.respondentId = Random.id();
      }
      
      // Calculate completion time
      if (responseData.startTime && responseData.endTime) {
        responseData.completionTime = (responseData.endTime.getTime() - responseData.startTime.getTime()) / 1000;
      }
      
      return SurveyResponses.insert(responseData);
    },
    
    'surveyResponses.update'(responseId, updates) {
      check(responseId, String);
      check(updates, Object);
      
      const response = SurveyResponses.findOne(responseId);
      
      // Check permissions
      if (!response) {
        throw new Meteor.Error('not-found', 'Response not found');
      }
      
      if (this.userId !== response.userId && !Meteor.users.findOne({ _id: this.userId, roles: { $in: ['admin'] } })) {
        throw new Meteor.Error('not-authorized', 'Not authorized to update this response');
      }
      
      // Update the response
      updates.updatedAt = new Date();
      
      return SurveyResponses.update(responseId, { $set: updates });
    },
    
    'surveyResponses.delete'(responseId) {
      check(responseId, String);
      
      const response = SurveyResponses.findOne(responseId);
      
      // Check permissions
      if (!response) {
        throw new Meteor.Error('not-found', 'Response not found');
      }
      
      if (!Meteor.users.findOne({ _id: this.userId, roles: { $in: ['admin'] } })) {
        throw new Meteor.Error('not-authorized', 'Not authorized to delete responses');
      }
      
      return SurveyResponses.remove(responseId);
    },
    
    'surveyResponses.getAnalytics'(surveyId) {
      check(surveyId, String);
      
      // Check permissions
      if (!Meteor.users.findOne({ _id: this.userId, roles: { $in: ['admin', 'analyst'] } })) {
        throw new Meteor.Error('not-authorized', 'Not authorized to view analytics');
      }
      
      const responses = SurveyResponses.find({ surveyId }).fetch();
      
      // Calculate analytics
      const totalResponses = responses.length;
      const completedResponses = responses.filter(r => r.completed).length;
      const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;
      
      // Calculate average completion time
      const completionTimes = responses
        .filter(r => r.completionTime)
        .map(r => r.completionTime);
      
      const averageCompletionTime = completionTimes.length > 0 
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
        : 0;
      
      // Group responses by day
      const responsesByDay = {};
      responses.forEach(response => {
        const date = response.createdAt.toISOString().split('T')[0];
        responsesByDay[date] = (responsesByDay[date] || 0) + 1;
      });
      
      // Calculate section completion rates
      const sectionCompletionRates = {};
      responses.forEach(response => {
        response.responses.forEach(r => {
          if (r.sectionId) {
            sectionCompletionRates[r.sectionId] = sectionCompletionRates[r.sectionId] || { total: 0, completed: 0 };
            sectionCompletionRates[r.sectionId].total++;
            if (r.answer) {
              sectionCompletionRates[r.sectionId].completed++;
            }
          }
        });
      });
      
      // Calculate average time per section
      const sectionTimes = {};
      responses.forEach(response => {
        if (response.sectionTimes) {
          Object.entries(response.sectionTimes).forEach(([sectionId, time]) => {
            sectionTimes[sectionId] = sectionTimes[sectionId] || { total: 0, count: 0 };
            sectionTimes[sectionId].total += time;
            sectionTimes[sectionId].count++;
          });
        }
      });
      
      const averageSectionTimes = {};
      Object.entries(sectionTimes).forEach(([sectionId, data]) => {
        averageSectionTimes[sectionId] = data.count > 0 ? data.total / data.count : 0;
      });
      
      return {
        totalResponses,
        completedResponses,
        completionRate,
        averageCompletionTime,
        responsesByDay,
        sectionCompletionRates,
        averageSectionTimes
      };
    }
  });
}

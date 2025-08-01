import { Meteor } from 'meteor/meteor';
import { SurveyResponses } from './surveyResponses';
import { check, Match } from 'meteor/check';

// Publish all survey responses
Meteor.publish('responses.all', function () {
  return SurveyResponses.find({});
});

// Publish responses for a specific survey
Meteor.publish('responses.bySurvey', function (surveyId) {
  check(surveyId, String);
  return SurveyResponses.find({ surveyId });
});

// Publish responses for analytics with optimized fields
Meteor.publish('responses.analytics', function (options = {}) {
  check(options, {
    surveyId: Match.Maybe(String),
    startDate: Match.Maybe(String),
    endDate: Match.Maybe(String),
    limit: Match.Maybe(Number)
  });
  
  const query: any = {};
  
  // Apply filters if provided
  if (options.surveyId) {
    query.surveyId = options.surveyId;
  }
  
  if (options.startDate || options.endDate) {
    query.createdAt = {};
    
    if (options.startDate) {
      query.createdAt.$gte = new Date(options.startDate);
    }
    
    if (options.endDate) {
      query.createdAt.$lte = new Date(options.endDate);
    }
  }
  
  // Set default limit if not provided
  const limit = options.limit || 100;
  
  // Only return necessary fields for analytics
  return SurveyResponses.find(query, {
    fields: {
      _id: 1,
      surveyId: 1,
      completed: 1,
      startTime: 1,
      endTime: 1,
      completionTime: 1,
      browser: 1,
      deviceType: 1,
      ipAddress: 1,
      createdAt: 1,
      updatedAt: 1
    },
    sort: { createdAt: -1 },
    limit
  });
});

import { Meteor } from 'meteor/meteor';
import { Surveys } from './surveys';
import { check, Match } from 'meteor/check';

// Publish all surveys
Meteor.publish('surveys.all', function () {
  return Surveys.find({});
});

// Publish a single survey by ID
Meteor.publish('surveys.single', function (surveyId) {
  check(surveyId, String);
  return Surveys.find({ _id: surveyId });
});

// Publish surveys for analytics with optimized fields
Meteor.publish('surveys.analytics', function (surveyId) {
  check(surveyId, Match.Maybe(String));
  
  const query = surveyId ? { _id: surveyId } : {};
  
  // Only return necessary fields for analytics
  return Surveys.find(query, {
    fields: {
      _id: 1,
      title: 1,
      description: 1,
      createdAt: 1,
      updatedAt: 1,
      selectedTags: 1,
      templateTags: 1,
      published: 1,
      shareToken: 1
    }
  });
});

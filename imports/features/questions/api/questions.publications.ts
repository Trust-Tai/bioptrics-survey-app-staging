import { Meteor } from 'meteor/meteor';
import { Questions } from './questions';
import { check, Match } from 'meteor/check';
import { Surveys } from '/imports/features/surveys/api/surveys';

// Publish all questions
Meteor.publish('questions.all', function () {
  return Questions.find({});
});

// Publish a single question by ID
Meteor.publish('questions.single', function (questionId) {
  check(questionId, String);
  return Questions.find({ _id: questionId });
});

// Publish questions for analytics with optimized fields
Meteor.publish('questions.analytics', function () {
  // Only return necessary fields for analytics
  return Questions.find({}, {
    fields: {
      _id: 1,
      currentVersion: 1,
      'versions.questionText': 1,
      'versions.responseType': 1,
      'versions.categoryTags': 1,
      'versions.surveyThemes': 1,
      createdAt: 1,
      updatedAt: 1
    }
  });
});

// Publish questions for a specific survey with optimized fields
Meteor.publish('questions.bySurvey', function (surveyId) {
  check(surveyId, String);
  
  // Find the survey to get the selected questions
  const survey = Surveys.findOne(
    { _id: surveyId },
    { fields: { selectedQuestions: 1, sectionQuestions: 1 } }
  );
  
  if (!survey) return this.ready();
  
  // Collect all question IDs from the survey
  let questionIds: string[] = [];
  
  // Add questions from selectedQuestions
  if (survey.selectedQuestions && Array.isArray(survey.selectedQuestions)) {
    questionIds = [...questionIds, ...survey.selectedQuestions.map(q => q.id)];
  }
  
  // Add questions from sectionQuestions
  if (survey.sectionQuestions && Array.isArray(survey.sectionQuestions)) {
    const sectionQuestionIds = survey.sectionQuestions.map(q => q.id);
    questionIds = [...questionIds, ...sectionQuestionIds];
  }
  
  // Remove duplicates
  questionIds = [...new Set(questionIds)];
  
  if (questionIds.length === 0) return this.ready();
  
  // Return only the questions used in this survey with optimized fields
  return Questions.find(
    { _id: { $in: questionIds } },
    {
      fields: {
        _id: 1,
        currentVersion: 1,
        'versions.questionText': 1,
        'versions.responseType': 1,
        'versions.categoryTags': 1,
        'versions.surveyThemes': 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  );
});

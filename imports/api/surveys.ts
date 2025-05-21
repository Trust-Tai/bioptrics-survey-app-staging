import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export interface SurveyDoc {
  _id?: string;
  title: string;
  description: string;
  createdAt: Date;
  questions: string[]; // Array of question IDs or question texts
}

export const Surveys = new Mongo.Collection<SurveyDoc>('surveys');

export interface SurveyResponseDoc {
  _id?: string;
  surveyId: string;
  answers: { [questionId: string]: any };
  submittedAt: Date;
}

export const SurveyResponses = new Mongo.Collection<SurveyResponseDoc>('survey_responses');

if (Meteor.isServer) {
  Meteor.publish('surveys.all', function () {
    return Surveys.find();
  });
}

Meteor.methods({
  'surveys.insert'(survey: Omit<SurveyDoc, '_id'|'createdAt'>) {
    console.log('surveys.insert called with:', survey);
    if (!survey.title) {
      throw new Meteor.Error('missing-title', 'Survey title is required');
    }
    if (!survey.questions || !Array.isArray(survey.questions) || !survey.questions.length) {
      throw new Meteor.Error('missing-questions', 'At least one question is required');
    }
    return Surveys.insertAsync({ ...survey, createdAt: new Date() });
  },
  'surveys.remove'(surveyId: string) {
    return Surveys.remove(surveyId);
  },
  // Public method to fetch survey by ID
  'surveys.get'(surveyId: string) {
    check(surveyId, String);
    return Surveys.findOne({ _id: surveyId });
  },
  // Allow anonymous submission of survey responses
  'surveys.submitResponse'(surveyId: string, answers: { [questionId: string]: any }) {
    check(surveyId, String);
    check(answers, Object);
    // Optionally, validate that the survey exists
    if (!Surveys.findOne({ _id: surveyId })) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    return SurveyResponses.insert({ surveyId, answers, submittedAt: new Date() });
  },
});

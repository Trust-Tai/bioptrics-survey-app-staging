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
    return Surveys.insert({ ...survey, createdAt: new Date() });
  },
  'surveys.remove'(surveyId: string) {
    return Surveys.remove(surveyId);
  },
});

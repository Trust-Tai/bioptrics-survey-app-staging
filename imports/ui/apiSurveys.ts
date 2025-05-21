import { Meteor } from 'meteor/meteor';

export interface SurveyDoc {
  _id?: string;
  title: string;
  description: string;
  createdAt: Date | string;
  questions: string[];
}

export async function createSurvey(survey: Omit<SurveyDoc, '_id'|'createdAt'>): Promise<string> {
  return await Meteor.callAsync('surveys.insert', survey);
}

export async function getAllSurveys(): Promise<SurveyDoc[]> {
  return await Meteor.callAsync('surveys.all');
}

export async function getSurveyById(surveyId: string): Promise<SurveyDoc|null> {
  return await Meteor.callAsync('surveys.getById', surveyId);
}

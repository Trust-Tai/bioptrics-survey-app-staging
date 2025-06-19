import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export interface SurveyThemeType {
  _id?: string;
  name: string;
  color: string;
  description: string;
  createdAt?: Date | string;
  wpsCategoryId?: string; // Relationship to WPS Category
  assignableTo?: string[]; // Can be 'questions', 'surveys', or both
  keywords?: string[];
  priority?: number;
  isActive?: boolean;
}

export const SurveyThemes = new Mongo.Collection<SurveyThemeType>('surveyThemes');

if (Meteor.isServer) {
  Meteor.publish('surveyThemes.all', function () {
    return SurveyThemes.find();
  });
}

Meteor.methods({
  async 'surveyThemes.insert'(theme: Omit<SurveyThemeType, '_id'>) {
    return await SurveyThemes.insertAsync({ ...theme, createdAt: new Date() });
  },
  'surveyThemes.update'(id: string, updates: Partial<SurveyThemeType>) {
    return SurveyThemes.update(id, { $set: updates });
  },
  async 'surveyThemes.remove'(id: string) {
    return await SurveyThemes.removeAsync(id);
  },
});

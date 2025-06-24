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
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  layout?: string;
  buttonStyle?: string;
  questionStyle?: string;
  headerStyle?: string;
  backgroundImage?: string;
  customCSS?: string;
  previewImageUrl?: string;
  templateType?: string;
}

export const SurveyThemes = new Mongo.Collection<SurveyThemeType>('surveyThemes');

if (Meteor.isServer) {
  Meteor.publish('surveyThemes.all', function () {
    return SurveyThemes.find();
  });
  
  Meteor.publish('surveyThemes.byId', function (themeId: string) {
    return SurveyThemes.find({ _id: themeId });
  });
  
  Meteor.publish('surveyThemes.bySurveyId', function (surveyId: string) {
    // This assumes there's a field in the surveys collection that references a theme ID
    const { Surveys } = require('../../../features/surveys/api/surveys');
    const survey = Surveys.findOne({ _id: surveyId });
    
    if (survey && survey.themeId) {
      return SurveyThemes.find({ _id: survey.themeId });
    }
    return this.ready();
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
  'surveyThemes.assignToSurvey'(themeId: string, surveyId: string) {
    const { Surveys } = require('../../../features/surveys/api/surveys');
    return Surveys.update(surveyId, { $set: { themeId } });
  },
  'surveyThemes.removeFromSurvey'(surveyId: string) {
    const { Surveys } = require('../../../features/surveys/api/surveys');
    return Surveys.update(surveyId, { $unset: { themeId: "" } });
  },
});

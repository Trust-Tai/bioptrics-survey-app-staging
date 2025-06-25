import { Meteor } from 'meteor/meteor';
import { SurveyThemes } from './surveyThemes';

// Define fields to publish for survey themes
const themeFields = {
  name: 1,
  description: 1,
  color: 1,
  primaryColor: 1,
  secondaryColor: 1,
  accentColor: 1,
  backgroundColor: 1,
  textColor: 1,
  headingFont: 1,
  bodyFont: 1,
  backgroundImage: 1,
  layout: 1,
  buttonStyle: 1,
  questionStyle: 1,
  customCSS: 1,
  templateType: 1,
  createdAt: 1,
  updatedAt: 1
};

// Publish all survey themes (used by the admin survey builder)
Meteor.publish('surveyThemes.all', function() {
  return SurveyThemes.find({}, { fields: themeFields });
});

// Publish a specific theme by ID (used by the public survey to apply theme)
Meteor.publish('surveyThemes.byId', function(themeId: string) {
  if (!themeId) return this.ready();
  
  return SurveyThemes.find(
    { _id: themeId },
    { fields: themeFields }
  );
});

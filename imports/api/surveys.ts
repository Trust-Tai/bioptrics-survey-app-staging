import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

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
    
    // Add default fields for new surveys
    const newSurvey = {
      ...survey,
      createdAt: new Date(),
      status: 'Draft', // Default status
      startDate: new Date(), // Default to today
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Default to 14 days from now
      invitedCount: 0,
      publicSlug: Random.id(8) // Generate a random slug
    };
    
    return Surveys.insertAsync(newSurvey);
  },
  
  'surveys.update'(surveyId: string, updates: Partial<SurveyDoc>) {
    check(surveyId, String);
    
    // Validate that survey exists
    const survey = Surveys.findOne({ _id: surveyId });
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    return Surveys.updateAsync({ _id: surveyId }, { $set: updates });
  },
  
  'surveys.remove'(surveyId: string) {
    check(surveyId, String);
    
    // Validate that survey exists and is in Draft status
    const survey = Surveys.findOne({ _id: surveyId });
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    // In a real app, you might want to check if the survey is in Draft status
    // before allowing deletion
    const status = (survey as any).status;
    if (status && status !== 'Draft') {
      throw new Meteor.Error('invalid-status', 'Only surveys in Draft status can be deleted');
    }
    
    return Surveys.remove(surveyId);
  },
  
  'surveys.close'(surveyId: string) {
    check(surveyId, String);
    
    // Validate that survey exists and is in Active status
    const survey = Surveys.findOne({ _id: surveyId });
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    // Check that the survey is in Active status
    const status = (survey as any).status;
    if (!status || status !== 'Active') {
      throw new Meteor.Error('invalid-status', 'Only active surveys can be closed');
    }
    
    return Surveys.updateAsync({ _id: surveyId }, { $set: { status: 'Closed' } });
  },
  
  'surveys.duplicate'(surveyId: string) {
    check(surveyId, String);
    
    // Find the survey to duplicate
    const survey = Surveys.findOne({ _id: surveyId });
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    // Create a copy with a new title and Draft status
    const newSurvey = {
      ...survey,
      _id: undefined, // Remove the _id to let MongoDB generate a new one
      title: `${survey.title} (Copy)`,
      createdAt: new Date(),
      status: 'Draft',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      invitedCount: 0,
      publicSlug: Random.id(8) // Generate a new random slug
    };
    
    // Insert the new survey and return its ID
    const newId = Surveys.insertAsync(newSurvey);
    return newId;
  },
  
  'surveys.publish'(surveyId: string, startDate: Date, endDate: Date) {
    check(surveyId, String);
    check(startDate, Date);
    check(endDate, Date);
    
    // Validate that survey exists and is in Draft status
    const survey = Surveys.findOne({ _id: surveyId });
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    // Check that the survey is in Draft status
    const status = (survey as any).status;
    if (!status || status !== 'Draft') {
      throw new Meteor.Error('invalid-status', 'Only draft surveys can be published');
    }
    
    // Validate dates
    if (endDate <= startDate) {
      throw new Meteor.Error('invalid-dates', 'End date must be after start date');
    }
    
    return Surveys.updateAsync(
      { _id: surveyId },
      { $set: { status: 'Active', startDate, endDate } }
    );
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

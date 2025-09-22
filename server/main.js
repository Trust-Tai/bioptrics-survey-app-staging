import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import 'meteor/accounts-password';
import { LinksCollection } from '../imports/api/links';
import '../imports/api/auth';
import '../imports/api/questions';
import '../imports/api/goals';
import '../imports/api/goals.methods';
import '../imports/api/products/products';
import '../imports/api/products/methods';
import { seedProducts } from '../imports/api/products/seed';
import '../imports/features/surveys/api/surveyResponses';
import '../imports/features/surveys/api/incompleteSurveyResponses';
// Import survey methods from both locations
// The new enhanced methods are in imports/api/surveyMethods
import '../imports/features/surveys/api/surveyMethods';
import '../imports/features/surveys/api/questionResponseMethods';
import '../imports/api/surveyMethods';
// Import survey invitation API
import '../imports/features/surveys/api/surveyInvitationAPI';
import '../imports/features/surveys/api/deviceUsageMethods';
import '../imports/features/surveys/api/analyticsMetrics';
import '../imports/features/surveys/api/surveyStats';
import { WPSCategories } from '../imports/api/wpsCategories';
import '../imports/api/wpsCategories.methods';
import { seedWPSCategories } from '../imports/api/wpsCategories.seed';
import '../imports/features/wps-framework/api/wpsCategories.publications';
import '../imports/api/surveyThemes';
// Import survey themes seed data and publications
import { seedDefaultThemes } from '../imports/features/survey-themes/api/seedThemes';
import { seedAdditionalThemes } from '../imports/features/survey-themes/api/seedAdditionalThemes';
import '../imports/features/survey-themes/api/publications';
import '../imports/features/surveys/api/surveys';
import '../imports/api/users.methods';
import '../imports/features/organization/api/organizationSettings';
// Import Question Tags API
import '../imports/features/question-tags/api';
// Import Question Categories API
import '../imports/features/question-categories/api';
// Import Question Templates API
import '../imports/features/questions/api/questionTemplates';
// Import Layers API
import '../imports/api/layers';
// Import Tag Items API
import '../imports/api/tagItems';
// Import Onboarding Steps API
import { seedOnboardingSteps } from '../imports/api/onboardingSteps';
// Import Survey Report Methods
import '../imports/api/surveys/methods/reportMethods';
// Import migration methods
import '../scripts/migrate-survey-questions';

Meteor.publish('wpsCategories', function () {
  return WPSCategories.find();
});

Meteor.startup(async () => {
  // Ensure unique index on name
  WPSCategories.rawCollection().createIndex({ name: 1 }, { unique: true }).catch(err => {
    if (err.code !== 11000) { // ignore duplicate key error on index creation
      console.error('Error creating unique index on WPSCategories.name:', err);
    }
  });
  seedWPSCategories().catch(err => {
    console.error('WPS Categories seed error:', err);
  });
  
  // Seed default survey themes
  seedDefaultThemes().catch(err => {
    console.error('Survey Themes seed error:', err);
  });
  
  // Seed additional survey themes (50 more themes)
  seedAdditionalThemes().catch(err => {
    console.error('Additional Survey Themes seed error:', err);
  });
  
  // Initialize IncompleteSurveyResponses collection if empty
  const { IncompleteSurveyResponses } = require('../imports/features/surveys/api/incompleteSurveyResponses');
  
  // Check if the collection is empty
  const incompleteResponsesCount = await IncompleteSurveyResponses.find().countAsync();
  console.log(`Found ${incompleteResponsesCount} incomplete survey responses`);
  
  if (incompleteResponsesCount === 0) {
    // Add a sample document to make the collection visible
    try {
      const sampleId = await IncompleteSurveyResponses.insert({
        surveyId: 'sample-survey-id',
        respondentId: 'sample-respondent-id',
        startedAt: new Date(),
        lastUpdatedAt: new Date(),
        responses: [],
        isCompleted: false
      });
      console.log('Created sample incomplete survey response with ID:', sampleId);
    } catch (error) {
      console.error('Error creating sample incomplete survey response:', error);
    }
  }
  
  // Initialize SurveyInvitations and EmailTemplates collections
  const { SurveyInvitations } = require('../imports/features/surveys/api/surveyInvitations');
  const { EmailTemplates } = require('../imports/features/surveys/api/emailTemplates');
  
  // Create indexes for better query performance
  try {
    // Check if indexes already exist before creating them
    const surveyInvIndexes = await SurveyInvitations.rawCollection().listIndexes().toArray();
    const emailTemplateIndexes = await EmailTemplates.rawCollection().listIndexes().toArray();
    
    // Create SurveyInvitations indexes if they don't exist
    if (!surveyInvIndexes.some(idx => idx.name === 'surveyId_1')) {
      await SurveyInvitations.rawCollection().createIndex({ surveyId: 1 });
      console.log('Created surveyId index for SurveyInvitations');
    }
    
    if (!surveyInvIndexes.some(idx => idx.name === 'recipientEmail_1')) {
      await SurveyInvitations.rawCollection().createIndex({ recipientEmail: 1 });
      console.log('Created recipientEmail index for SurveyInvitations');
    }
    
    if (!surveyInvIndexes.some(idx => idx.name === 'status_1')) {
      await SurveyInvitations.rawCollection().createIndex({ status: 1 });
      console.log('Created status index for SurveyInvitations');
    }
    
    // Create EmailTemplates index if it doesn't exist
    const indexName = 'surveyId_1_type_1';
    if (!emailTemplateIndexes.some(idx => idx.name === indexName)) {
      await EmailTemplates.rawCollection().createIndex({ surveyId: 1, type: 1 }, { unique: true });
      console.log('Created surveyId_type index for EmailTemplates');
    } else {
      // Check if the existing index has the unique constraint
      const existingIndex = emailTemplateIndexes.find(idx => idx.name === indexName);
      if (!existingIndex.unique) {
        // Drop and recreate with unique constraint
        await EmailTemplates.rawCollection().dropIndex(indexName);
        await EmailTemplates.rawCollection().createIndex({ surveyId: 1, type: 1 }, { unique: true });
        console.log('Updated surveyId_type index for EmailTemplates with unique constraint');
      }
    }
    
    console.log('Verified indexes for SurveyInvitations and EmailTemplates collections');
  } catch (error) {
    console.error('Error managing indexes for survey sharing collections:', error);
  }

  // --- ONBOARDING STEPS SEEDING ---
  await seedOnboardingSteps();

  // --- ADMIN USER CREATION ---
  const adminEmail = 'tayeshobajo@gmail.com';
  const adminPassword = '9v5Ss6sd85DUE5F9';
  const firstName = 'Tai';
  const lastName = 'Shobajo';

  // Use asynchronous Meteor API for user lookup
  let user = await Meteor.users.findOneAsync({ 'emails.address': adminEmail });

  if (!user) {
    const userId = Accounts.createUser({
      email: adminEmail,
      password: adminPassword,
      profile: {
        firstName,
        lastName,
        admin: true,
      },
    });
    console.log('Admin user created:', adminEmail);
  } else {
    // Ensure admin flag and names are set
    await Meteor.users.updateAsync(user._id, {
      $set: {
        'profile.admin': true,
        'profile.firstName': firstName,
        'profile.lastName': lastName,
      }
    });
    // Ensure password is correct
    try {
      await Accounts.setPasswordAsync(user._id, adminPassword, { logout: false });
      console.log('Admin password set/reset for:', adminEmail);
    } catch (err) {
      console.error('Error setting admin password:', err);
    }
  }
});

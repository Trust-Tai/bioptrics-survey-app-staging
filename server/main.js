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
import '../imports/features/surveys/api/deviceUsageMethods';
import '../imports/features/surveys/api/analyticsMetrics';
import '../imports/features/surveys/api/surveyStats';
// Import survey invitation system
import '../imports/features/surveys/api/surveyInvitations';
import '../imports/features/surveys/api/emailTemplates';
import '../imports/features/surveys/api/emailLogs';
import '../imports/features/surveys/api/surveyInvitationAPI';
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
import { Surveys } from '../imports/features/surveys/api/surveys';
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
// Import LMS module
import '../imports/modules/lms/api/courses';
import '../imports/modules/lms/api/courseTemplates';
import '../imports/modules/lms/api/courses.methods';
import '../imports/modules/lms/api/courses.publications';
import { seedCourseTemplates } from '../imports/modules/lms/api/seedTemplates';
// Import LMS Course Builder module
import '../imports/modules/lms/api/modules';
import '../imports/modules/lms/api/topics';
import '../imports/modules/lms/api/quizzes';
import '../imports/modules/lms/api/modules.methods';
import '../imports/modules/lms/api/topics.methods';
import '../imports/modules/lms/api/quizzes.methods';
import '../imports/modules/lms/api/modules.publications';
import '../imports/modules/lms/api/topics.publications';
import '../imports/modules/lms/api/quizzes.publications';
// Import LMS Learner module (enrollments & notes)
import '../imports/modules/lms/api/enrollments';
import '../imports/modules/lms/api/enrollments.methods';
import '../imports/modules/lms/api/enrollments.publications';
import '../imports/modules/lms/api/notes';
import '../imports/modules/lms/api/notes.methods';
import '../imports/modules/lms/api/notes.publications';

Meteor.publish('wpsCategories', function () {
  return WPSCategories.find();
});

Meteor.startup(async () => {
  // Migration: Set creationSource field for existing surveys
  try {
    console.log('Running migration: Setting creationSource field for existing surveys');
    const surveysWithoutCreationSource = await Surveys.find({ creationSource: { $exists: false } }).countAsync();
    console.log(`Found ${surveysWithoutCreationSource} surveys without creationSource field`);
    
    if (surveysWithoutCreationSource > 0) {
      // Set all existing surveys without creationSource to 'manual'
      const result = await Surveys.updateAsync(
        { creationSource: { $exists: false } },
        { $set: { creationSource: 'manual' } },
        { multi: true }
      );
      console.log(`Migration complete: Set creationSource to 'manual' for ${result.modifiedCount || 'unknown number of'} surveys`);
    }
  } catch (error) {
    console.error('Error during survey creationSource migration:', error);
  }
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

  // --- ONBOARDING STEPS SEEDING ---
  await seedOnboardingSteps();

  // --- LMS COURSE TEMPLATES SEEDING ---
  await seedCourseTemplates();

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

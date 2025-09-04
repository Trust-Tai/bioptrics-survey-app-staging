/**
 * Migration script to consolidate selectedQuestions into sectionQuestions format
 * This eliminates the dual storage system and standardizes on sectionQuestions
 */

import { Meteor } from 'meteor/meteor';
import { Surveys } from '../imports/features/surveys/api/surveys';

const migrateSurveyQuestions = async () => {
  console.log('Starting survey questions migration...');
  
  // Find surveys that have selectedQuestions and haven't been migrated yet
  const surveysToMigrate = await Surveys.find({
    selectedQuestions: { $exists: true, $ne: {} },
    _migratedAt: { $exists: false }
  }).fetchAsync();
  
  console.log('surveysToMigrate type:', typeof surveysToMigrate);
  console.log('surveysToMigrate isArray:', Array.isArray(surveysToMigrate));
  console.log('surveysToMigrate:', surveysToMigrate);
  console.log(`Found ${surveysToMigrate ? surveysToMigrate.length : 'undefined'} surveys to migrate`);
  
  if (!Array.isArray(surveysToMigrate)) {
    console.error('surveysToMigrate is not an array:', surveysToMigrate);
    return { migratedCount: 0, errorCount: 1, error: 'Query did not return an array' };
  }
  
  let migratedCount = 0;
  let errorCount = 0;
  
  for (const survey of surveysToMigrate) {
    try {
      const index = surveysToMigrate.indexOf(survey);
      console.log(`Migrating survey ${index + 1}/${surveysToMigrate.length}: ${survey.title}`);
      
      const sectionQuestions = [];
      let questionOrder = 0;
      
      // Convert selectedQuestions object to sectionQuestions array
      if (survey.selectedQuestions && typeof survey.selectedQuestions === 'object') {
        Object.entries(survey.selectedQuestions).forEach(([sectionId, questions]) => {
          if (Array.isArray(questions)) {
            questions.forEach((question) => {
              const sectionQuestion = {
                id: question.id || question._id,
                text: question.text,
                type: question.type,
                options: question.options || [],
                sectionId: question.sectionId || null, // null for unsectioned questions
                order: questionOrder++
              };
              
              sectionQuestions.push(sectionQuestion);
            });
          }
        });
      }
      
      // Update the survey with the new sectionQuestions format
      // If sectionQuestions already exists, merge with new questions
      let finalSectionQuestions = sectionQuestions;
      if (survey.sectionQuestions && Array.isArray(survey.sectionQuestions)) {
        // Merge existing sectionQuestions with migrated ones, avoiding duplicates
        const existingIds = new Set(survey.sectionQuestions.map(q => q.id));
        const newQuestions = sectionQuestions.filter(q => !existingIds.has(q.id));
        finalSectionQuestions = [...survey.sectionQuestions, ...newQuestions];
      }
      
      const updateResult = await Surveys.updateAsync(survey._id, {
        $set: {
          sectionQuestions: finalSectionQuestions,
          _migratedAt: new Date(),
          _migrationVersion: '1.0'
        }
      });
      
      if (updateResult) {
        migratedCount++;
        console.log(`✓ Migrated survey "${survey.title}" with ${sectionQuestions.length} questions`);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      errorCount++;
      console.error(`✗ Error migrating survey "${survey.title}":`, error.message);
    }
  }
  
  console.log(`\nMigration completed:`);
  console.log(`- Successfully migrated: ${migratedCount} surveys`);
  console.log(`- Errors: ${errorCount} surveys`);
  
  return { migratedCount, errorCount };
};

// Method to clean up selectedQuestions after successful migration
const cleanupLegacyQuestions = async () => {
  console.log('Starting cleanup of legacy selectedQuestions...');
  
  // Only clean up surveys that have both selectedQuestions and sectionQuestions
  const surveysToCleanup = await Surveys.find({
    selectedQuestions: { $exists: true },
    sectionQuestions: { $exists: true },
    _migratedAt: { $exists: true }
  }).fetchAsync();
  
  console.log(`Found ${surveysToCleanup.length} surveys to cleanup`);
  
  let cleanedCount = 0;
  
  for (const survey of surveysToCleanup) {
    try {
      const updateResult = await Surveys.updateAsync(survey._id, {
        $unset: {
          selectedQuestions: 1
        },
        $set: {
          _cleanedUpAt: new Date()
        }
      });
      
      if (updateResult) {
        cleanedCount++;
        console.log(`✓ Cleaned up survey "${survey.title}"`);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error(`✗ Error cleaning up survey "${survey.title}":`, error.message);
    }
  }
  
  console.log(`Cleanup completed: ${cleanedCount} surveys cleaned`);
  return cleanedCount;
};

// Meteor methods for running migration
if (Meteor.isServer) {
  Meteor.methods({
    async 'surveys.migrateQuestions'() {
      // Only allow admin users to run migration
      if (!this.userId) {
        throw new Meteor.Error('unauthorized', 'Must be logged in to run migration');
      }
      
      return await migrateSurveyQuestions();
    },
    
    async 'surveys.cleanupLegacyQuestions'() {
      // Only allow admin users to run cleanup
      if (!this.userId) {
        throw new Meteor.Error('unauthorized', 'Must be logged in to run cleanup');
      }
      
      return await cleanupLegacyQuestions();
    },
    
    async 'surveys.getMigrationStatus'() {
      const totalSurveys = await Surveys.find().countAsync();
      const legacySurveys = await Surveys.find({
        selectedQuestions: { $exists: true, $ne: {} }
      }).countAsync();
      const modernSurveys = await Surveys.find({
        sectionQuestions: { $exists: true, $not: { $size: 0 } }
      }).countAsync();
      const migratedSurveys = await Surveys.find({
        _migratedAt: { $exists: true }
      }).countAsync();
      
      return {
        totalSurveys,
        legacySurveys,
        modernSurveys,
        migratedSurveys,
        needsMigration: legacySurveys - migratedSurveys
      };
    }
  });
}

export { migrateSurveyQuestions, cleanupLegacyQuestions };

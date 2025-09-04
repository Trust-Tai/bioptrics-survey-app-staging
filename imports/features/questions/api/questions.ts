import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';

export interface CustomField {
  title: string;
  content: string;
}

export interface QuestionVersion {
  category: string;
  version: number;
  versionName?: string; // Added for editable version names
  questionText: string;
  description: string;
  responseType: string;
  options?: string[] | { min: number; max: number; step: number };
  adminNotes?: string;
  updatedAt: Date;
  updatedBy: string;
  language?: string;
  surveyThemes?: string[];
  categoryTags?: string[];
  labels?: string[];
  organizationId?: string;
  isReusable?: boolean;
  usageCount?: number;
  lastUsedAt?: Date;
  priority?: number;
  isActive?: boolean;
  keywords?: string[];
  estimatedTimeSeconds?: number;
  customFields?: CustomField[];
  // Added fields for survey-specific questions feature
  saveToQuestionBank?: boolean;
  surveyId?: string;
  creationSource?: string; // 'manual' or 'imported'
}

export interface QuestionDoc {
  _id?: string;
  currentVersion: number;
  versions: QuestionVersion[];
  createdAt: Date;
  createdBy: string;
  folderId?: string | null; // null for questions not in any folder
}

// Extend the Collection type to include schema-related properties
interface ExtendedCollection<T extends object> extends Mongo.Collection<T> {
  schema?: any;
  attachSchema?: (schema: any) => void;
}

export const Questions = new Mongo.Collection<QuestionDoc>('questions') as ExtendedCollection<QuestionDoc>;

// Define an interface for the stats document
export interface QuestionStatsDoc {
  _id: string;
  totalQuestions: number;
  avgQualityScore: number;
  timestamp: Date;
}

// Client-side collection for question stats
export const QuestionStats = new Mongo.Collection<QuestionStatsDoc>('questionStats');

// Only attach schema if the method exists (TypeScript safety)
if (typeof Questions.attachSchema === 'function') {
  Questions.schema = new SimpleSchema({
    currentVersion: { type: SimpleSchema.Integer },
    versions: { type: Array },
    'versions.$': { type: Object },
    'versions.$.version': { type: SimpleSchema.Integer },
    'versions.$.questionText': { type: String },
    'versions.$.description': { type: String },
    'versions.$.responseType': { type: String },
    'versions.$.category': { type: String },
    // Make options truly optional and flexible (array or object)
    'versions.$.options': { type: SimpleSchema.oneOf(Array, Object), optional: true, blackbox: true },
    'versions.$.adminNotes': { type: String, optional: true },
    'versions.$.updatedAt': { type: Date },
    'versions.$.updatedBy': { type: String },
    'versions.$.language': { type: String, optional: true },
    'versions.$.surveyThemes': { type: Array, optional: true },
    'versions.$.surveyThemes.$': { type: String },
    'versions.$.categoryTags': { type: Array, optional: true },
    'versions.$.categoryTags.$': { type: String },
    'versions.$.labels': { type: Array, optional: true },
    'versions.$.labels.$': { type: String },
    'versions.$.organizationId': { type: String, optional: true },
    'versions.$.isReusable': { type: Boolean, optional: true },
    'versions.$.usageCount': { type: SimpleSchema.Integer, optional: true },
    'versions.$.lastUsedAt': { type: Date, optional: true },
    'versions.$.priority': { type: SimpleSchema.Integer, optional: true },
    'versions.$.isActive': { type: Boolean, optional: true },
    'versions.$.image': { type: String, optional: true },
    // Assessment mode fields
    'versions.$.isAssessment': { type: Boolean, optional: true },
    'versions.$.correctAnswers': { type: Array, optional: true },
    'versions.$.correctAnswers.$': { type: String },
    'versions.$.points': { type: SimpleSchema.Integer, optional: true },
    'versions.$.keywords': { type: Array, optional: true },
    'versions.$.keywords.$': { type: String },
    'versions.$.estimatedTimeSeconds': { type: SimpleSchema.Integer, optional: true },
    'versions.$.customFields': { type: Array, optional: true },
    'versions.$.customFields.$': { type: Object, blackbox: true },
    'versions.$.customFields.$.title': { type: String },
    'versions.$.customFields.$.content': { type: String },
    // Survey-specific question fields
    'versions.$.saveToQuestionBank': { type: Boolean, optional: true, defaultValue: true },
    'versions.$.surveyId': { type: String, optional: true },
    'versions.$.creationSource': { type: String, optional: true },
    createdAt: { type: Date },
    createdBy: { type: String },
    folderId: { type: String, optional: true },
  });
  Questions.attachSchema(Questions.schema);
}

if (Meteor.isServer) {
  
  Meteor.publish('questions.all', function(surveyId) {
    // If surveyId is provided, include both global questions and survey-specific questions for this survey
    // Otherwise, only return global questions (saved to Question Bank)
    // Build the query
    // Use type assertion to avoid TypeScript errors with MongoDB operators
    const query: any = {
      $or: [
        // Global questions (saved to Question Bank)
        { 'versions.saveToQuestionBank': { $ne: false } },
        { 'versions.saveToQuestionBank': { $exists: false } }
      ]
    };
    
    // If surveyId is provided, also include survey-specific questions for this survey
    if (surveyId) {
      query.$or.push({
        $and: [
          { 'versions.saveToQuestionBank': false },
          { 'versions.surveyId': surveyId }
        ]
      });
    }
    
    console.log(`[questions.all] Publishing questions with${surveyId ? ' surveyId: ' + surveyId : ' no surveyId'}`);
    
    // Use field projection to only return the fields needed for the UI
    return Questions.find(query, {
      fields: {
        _id: 1,
        currentVersion: 1,
        createdAt: 1,
        folderId: 1,
        'versions.version': 1,
        'versions.questionText': 1,
        'versions.responseType': 1,
        'versions.category': 1,
        'versions.categoryTags': 1,
        'versions.labels': 1,
        'versions.isActive': 1,
        'versions.updatedAt': 1,
        'versions.surveyThemes': 1,
        'versions.saveToQuestionBank': 1,
        'versions.surveyId': 1,
        'versions.image': 1
      }
    });
  });
  
  Meteor.publish('questions.single', function(questionId) {
    check(questionId, String);
    return Questions.find({ _id: questionId });
  });
  
  Meteor.methods({
    'questions.getStats': async function() {
      try {
        console.log('[questions.getStats] Method called');
        // For stats, we only need counts and aggregates, not the full documents
        
        // Get total questions count - using countAsync instead of count
        const totalQuestions = await Questions.find({}).countAsync();
        console.log('[questions.getStats] Total questions count:', totalQuestions);
        
        // Calculate average quality score
        let totalScore = 0;
        let scoredQuestions = 0;
        
        // Use a cursor to avoid loading all documents into memory at once
        const cursor = Questions.find({}, {
          fields: {
            'versions': 1,
            'currentVersion': 1
          }
        });
        
        cursor.forEach((question) => {
          try {
            if (question.versions && question.versions.length > 0) {
              const latestVersion = question.versions.find(v => v.version === question.currentVersion);
              if (latestVersion && latestVersion.qualityScore) {
                totalScore += latestVersion.qualityScore;
                scoredQuestions++;
              }
            }
          } catch (err) {
            console.error('[questions.getStats] Error processing question:', err);
            // Continue with next question
          }
        });
        
        const avgQualityScore = scoredQuestions > 0 ? totalScore / scoredQuestions : 4.5;
        console.log('[questions.getStats] Average quality score:', avgQualityScore, 'from', scoredQuestions, 'scored questions');
        
        // Return the stats as a simple object
        const result = {
          totalQuestions,
          avgQualityScore,
          timestamp: new Date()
        };
        
        console.log('[questions.getStats] Returning stats:', result);
        return result;
      } catch (error) {
        console.error('[questions.getStats] Error calculating stats:', error);
        // Return default values instead of throwing an error
        return {
          totalQuestions: 0,
          avgQualityScore: 0,
          timestamp: new Date(),
          error: error.message
        };
      }
    },
    // Public method to get a single question by ID
    'questions.getById': function (id: string) {
      check(id, String);
      
      console.log(`[questions.getById] Fetching question with ID: ${id}`);
      
      try {
        const question = Questions.findOne({ _id: id });
        if (!question) {
          console.log(`[questions.getById] Question not found with ID: ${id}`);
          throw new Meteor.Error('questions.getById.notFound', 'Question not found');
        }
        
        console.log(`[questions.getById] Found question: ${question._id}`);
        return question;
      } catch (error) {
        console.error(`[questions.getById] Error fetching question ${id}:`, error);
        throw new Meteor.Error('questions.getById.error', 'Failed to fetch question');
      }
    },
    
    // Public method to fetch multiple questions by ID
    'questions.getMany': function (ids: string[]) {
      check(ids, Array);
      
      console.log(`[questions.getMany] Fetching ${ids.length} questions:`, ids);
      
      if (!ids.length) {
        console.log('[questions.getMany] No question IDs provided');
        return [];
      }
      
      try {
        const questions = Questions.find({ _id: { $in: ids } }).fetch();
        console.log(`[questions.getMany] Found ${questions.length} of ${ids.length} requested questions`);
        
        // Log which IDs were not found
        if (questions.length < ids.length) {
          const foundIds = questions.map(q => q._id);
          const missingIds = ids.filter(id => !foundIds.includes(id));
          console.log('[questions.getMany] Missing question IDs:', missingIds);
        }
        
        return questions;
      } catch (error) {
        console.error('[questions.getMany] Error fetching questions:', error);
        throw new Meteor.Error('questions.getMany.error', 'Failed to fetch questions');
      }
    },
    'questions.delete': async function (questionId: string) {
      check(questionId, String);
      // Allow deletion from Bank admin (no Meteor user check)
      try {
        // Use _id to ensure we're deleting the exact document
        const result = await Questions.removeAsync({ _id: questionId });
        console.log(`[questions.delete] Deleted question ${questionId}, result:`, result);
        return result;
      } catch (error) {
        console.error(`[questions.delete] Error deleting question ${questionId}:`, error);
        throw new Meteor.Error('questions.delete.error', 'Failed to delete question');
      }
    },
    'questions.insert': async function (data: Omit<QuestionVersion, 'version'|'updatedAt'|'updatedBy'>, userId: string) {
      try {
       
        console.log('[questions.insert] Received data:', data);

        const now = new Date();
        const effectiveUserId = userId || (this.userId || 'system');
        
        const version: QuestionVersion = {
          ...data,
          version: 1,
          updatedAt: now,
          updatedBy: effectiveUserId,
        };
       
        console.log('[questions.insert] Constructed version:', version);
        const result = await Questions.insertAsync({
          currentVersion: 1,
          versions: [version],
          createdAt: now,
          createdBy: effectiveUserId,
        });
       
        console.log('[questions.insert] Insert result:', result);
        return result;
      } catch (err) {
       
        console.error('[questions.insert] Error:', err);
        throw err;
      }
    },
    'questions.update': async function (questionId: string, data: Omit<QuestionVersion, 'version'|'updatedAt'|'updatedBy'>, userId: string) {

      const question = await Questions.findOneAsync(questionId);
      if (!question) throw new Meteor.Error('Not found');
      const now = new Date();
      const effectiveUserId = userId || (this.userId || 'system');
      
      const newVersion: QuestionVersion = {
        ...data,
        version: question.currentVersion + 1,
        updatedAt: now,
        updatedBy: effectiveUserId,
      };
      return await Questions.updateAsync(questionId, {
        $set: { currentVersion: newVersion.version },
        $push: { versions: newVersion },
      });
    },
    
    // Method to handle question image uploads
    'questions.updateFolder': function(questionId: string, folderId: string | null) {
      // Check if user is logged in
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to update question folders');
      }

      // Validate parameters
      check(questionId, String);
      if (folderId !== null) {
        check(folderId, String);
      }

      // Check if question exists
      const question = Questions.findOne(questionId);
      if (!question) {
        throw new Meteor.Error('question-not-found', 'Question not found');
      }

      // If folderId is provided, check if folder exists
      if (folderId) {
        const folder = Meteor.call('folders.getById', folderId);
        if (!folder) {
          throw new Meteor.Error('folder-not-found', 'Folder not found');
        }
      }

      // Update question's folder
      Questions.update(questionId, {
        $set: {
          folderId: folderId,
        },
      });

      return questionId;
    },

    'questions.getByFolder': function(folderId: string | null) {
      // Check if user is logged in
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get questions by folder');
      }

      // Validate parameters
      if (folderId !== null) {
        check(folderId, String);
      }

      // If folderId is null, get questions without a folder
      if (folderId === null) {
        return Questions.find({ folderId: { $exists: false } }).fetch();
      }

      // Check if folder exists
      const folder = Meteor.call('folders.getById', folderId);
      if (!folder) {
        throw new Meteor.Error('folder-not-found', 'Folder not found');
      }

      // Get questions in folder
      return Questions.find({ folderId: folderId }).fetch();
    },

    'questions.countByFolder': function(folderId: string | null) {
      // Check if user is logged in
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to count questions by folder');
      }

      // Validate parameters
      if (folderId !== null) {
        check(folderId, String);
      }

      // If folderId is null, count questions without a folder
      if (folderId === null) {
        return Questions.find({ folderId: { $exists: false } }).count();
      }

      // Count questions in folder
      return Questions.find({ folderId: folderId }).count();
    },

    'questions.moveToFolder': function(questionIds: string[], folderId: string | null) {
      // Check if user is logged in
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to move questions to folders');
      }

      // Validate parameters
      check(questionIds, [String]);
      if (folderId !== null) {
        check(folderId, String);
      }

      // If folderId is provided, check if folder exists
      if (folderId) {
        const folder = Meteor.call('folders.getById', folderId);
        if (!folder) {
          throw new Meteor.Error('folder-not-found', 'Folder not found');
        }
      }

      // Move questions to folder
      Questions.update(
        { _id: { $in: questionIds } },
        { $set: { folderId: folderId } },
        { multi: true }
      );

      return questionIds.length;
    },

    'uploadQuestionImage': function(data: { file: string, name: string }) {
      // Check if user is logged in
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to upload images');
      }
      
      try {
        // Validate the input data
        check(data, {
          file: String,
          name: String
        });
        
        // Extract the base64 data from the data URL
        const base64Data = data.file.split(',')[1];
        if (!base64Data) {
          throw new Meteor.Error('invalid-file', 'Invalid file format');
        }
        
        // Generate a unique filename
        const fileExtension = data.name.split('.').pop() || 'jpg';
        const filename = `question_image_${Random.id()}.${fileExtension}`;
        
        // In a production environment, you would save this to a storage service
        // like AWS S3, Google Cloud Storage, etc.
        // For this example, we'll simulate storing and return a URL
        
        // Log the upload (in production, replace with actual storage)
        console.log(`[uploadQuestionImage] Uploaded image: ${filename}`);
        
        // Store the image in the Assets directory or use a CDN in production
        // Here we're just returning a simulated URL
        // In production, implement proper file storage and return the actual URL
        const url = `/uploads/questions/${filename}`;
        
        // For now, we'll use the base64 data directly in the URL for immediate display
        // This is NOT recommended for production as it can be very large
        // In production, store the file and return a proper URL
        return { url: data.file };
      } catch (error: any) {
        console.error('[uploadQuestionImage] Error:', error);
        throw new Meteor.Error('upload-failed', `Failed to upload image: ${error.message || 'Unknown error'}`);
      }
    },
    
    /**
     * Revert a question to a previous version
     * @param questionId - ID of the question to revert
     * @param versionNumber - Version number to revert to
     * @returns The updated question document
     */
    'questions.revertToVersion': async function(questionId: string, versionNumber: number) {
      try {
        console.log('Reverting question version - method called with:', { questionId, versionNumber, userId: this.userId });
        
        // Check if user is logged in
        if (!this.userId) {
          console.log('User not logged in - access denied');
          throw new Meteor.Error('not-authorized', 'You must be logged in to revert question versions');
        }
        
        // Validate parameters
        check(questionId, String);
        check(versionNumber, Number);
        
        // Get the question document - using findOneAsync instead of findOne
        const question = await Questions.findOneAsync({ _id: questionId });
        if (!question) {
          console.log('Question not found:', questionId);
          throw new Meteor.Error('not-found', 'Question not found');
        }
        
        console.log('Question found:', { id: question._id, versions: question.versions.length });
        
        // Check if the version exists
        if (versionNumber < 1 || versionNumber > question.versions.length) {
          console.log('Invalid version number:', versionNumber);
          throw new Meteor.Error('invalid-version', 'Invalid version number');
        }
        
        // Get the target version (array is 0-indexed, but versions are 1-indexed)
        const targetVersion = question.versions[versionNumber - 1];
        
        if (!targetVersion) {
          console.log('Target version not found:', versionNumber);
          throw new Meteor.Error('invalid-version', 'Target version not found');
        }
        
        console.log('Target version found:', { version: targetVersion.version });
        
        // Check user roles or permissions - allow admins and the original creator
        // This assumes you have a roles collection or some way to check if user is admin
        const isAdmin = await Meteor.users.findOneAsync({ _id: this.userId, roles: { $in: ['admin'] } });
        const isCreator = question.createdBy === this.userId;
        
        // Skip permission check in development for testing
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        if (!isDevelopment && !isAdmin && !isCreator) {
          console.log('User not authorized to revert this question:', { userId: this.userId, isAdmin, isCreator });
          throw new Meteor.Error('access-denied', 'You do not have permission to revert this question');
        }
        
        try {
          // Create a new version based on the target version
          // Make a clean copy without any unexpected properties
          const newVersion = {
            category: targetVersion.category || '',
            version: question.versions.length + 1,
            questionText: targetVersion.questionText || '',
            description: targetVersion.description || '',
            responseType: targetVersion.responseType || '',
            options: targetVersion.options || [],
            updatedAt: new Date(),
            updatedBy: this.userId,
            adminNotes: `Reverted to version ${versionNumber}`,
            versionName: targetVersion.versionName || `v${question.versions.length + 1} (Reverted from v${versionNumber})`,
            // Include optional fields with safe defaults
            language: targetVersion.language || 'en',
            surveyThemes: targetVersion.surveyThemes || [],
            categoryTags: targetVersion.categoryTags || [],
            organizationId: targetVersion.organizationId || '',
            isReusable: targetVersion.isReusable || false,
            isActive: targetVersion.isActive || true,
          };
          
          console.log('Creating new version:', { 
            newVersionNumber: newVersion.version,
            fields: Object.keys(newVersion)
          });
          
          // Update the question document
          await Questions.updateAsync(
            { _id: questionId },
            { 
              $push: { versions: newVersion },
              $set: { currentVersion: question.versions.length + 1 }
            }
          );
          
          console.log('Question updated successfully');
          
          // Use findOneAsync instead of findOne
          return await Questions.findOneAsync({ _id: questionId });
        } catch (updateError) {
          console.error('Error updating question with new version:', updateError);
          throw new Meteor.Error('update-failed', `Failed to update question: ${updateError.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error reverting question version:', error);
        throw new Meteor.Error('revert-failed', error.message || 'Failed to revert question version');
      }
    },

    /**
     * Update the name of a specific question version
     * @param questionId - ID of the question
     * @param versionNumber - Version number to update
     * @param versionName - New name for the version
     * @returns The updated question document
     */
    'questions.updateVersionName': async function(questionId: string, versionNumber: number, versionName: string) {
      // Check if user is logged in
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to update version names');
      }
      
      // Validate parameters
      check(questionId, String);
      check(versionNumber, Number);
      check(versionName, String);
      
      try {
        // Get the question document
        const question = await Questions.findOneAsync({ _id: questionId });
        if (!question) {
          throw new Meteor.Error('not-found', 'Question not found');
        }
        
        // Check if the version exists
        if (!question.versions || versionNumber < 1 || versionNumber > question.versions.length) {
          throw new Meteor.Error('invalid-version', 'Invalid version number');
        }
        
        // Update the version name
        // We need to use the array index (0-based) but version numbers are 1-based
        const arrayIndex = versionNumber - 1;
        const updateField = `versions.${arrayIndex}.versionName`;
        
        await Questions.updateAsync(
          { _id: questionId },
          { $set: { [updateField]: versionName } }
        );
        
        return await Questions.findOneAsync({ _id: questionId });
      } catch (error: any) {
        console.error('Error updating version name:', error);
        throw new Meteor.Error('update-failed', `Failed to update version name: ${error.message || 'Unknown error'}`);
      }
    }
  });
}

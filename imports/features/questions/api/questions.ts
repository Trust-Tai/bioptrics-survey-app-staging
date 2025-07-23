import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import SimpleSchema from 'simpl-schema';

export interface CustomField {
  title: string;
  content: string;
}

export interface QuestionVersion {
  category: string;
  version: number;
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
  organizationId?: string;
  isReusable?: boolean;
  usageCount?: number;
  lastUsedAt?: Date;
  priority?: number;
  isActive?: boolean;
  keywords?: string[];
  estimatedTimeSeconds?: number;
  customFields?: CustomField[];
}

export interface QuestionDoc {
  _id?: string;
  currentVersion: number;
  versions: QuestionVersion[];
  createdAt: Date;
  createdBy: string;
}

// Extend the Collection type to include schema-related properties
interface ExtendedCollection<T extends object> extends Mongo.Collection<T> {
  schema?: any;
  attachSchema?: (schema: any) => void;
}

export const Questions = new Mongo.Collection<QuestionDoc>('questions') as ExtendedCollection<QuestionDoc>;

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
    createdAt: { type: Date },
    createdBy: { type: String },
  });
  Questions.attachSchema(Questions.schema);
}

if (Meteor.isServer) {
  Meteor.publish('questions.all', function() {
    return Questions.find();
  });
  
  Meteor.publish('questions.single', function(questionId) {
    check(questionId, String);
    return Questions.find({ _id: questionId });
  });
}

// Import necessary packages for file handling
import { Random } from 'meteor/random';

Meteor.methods({
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
});

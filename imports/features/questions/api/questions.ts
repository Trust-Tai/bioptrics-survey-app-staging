import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import SimpleSchema from 'simpl-schema';

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
    'versions.$.organizationId': { type: String, optional: true },
    'versions.$.isReusable': { type: Boolean, optional: true },
    'versions.$.usageCount': { type: SimpleSchema.Integer, optional: true },
    'versions.$.lastUsedAt': { type: Date, optional: true },
    'versions.$.priority': { type: SimpleSchema.Integer, optional: true },
    'versions.$.isActive': { type: Boolean, optional: true },
    'versions.$.keywords': { type: Array, optional: true },
    'versions.$.keywords.$': { type: String },
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

Meteor.methods({
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
});

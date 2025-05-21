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
    createdAt: { type: Date },
    createdBy: { type: String },
  });
  Questions.attachSchema(Questions.schema);
}

if (Meteor.isServer) {
  Meteor.publish('questions.all', function() {
    return Questions.find();
  });
}

Meteor.methods({
  // Public method to fetch multiple questions by ID
  'questions.getMany': function (ids: string[]) {
    check(ids, Array);
    return Questions.find({ _id: { $in: ids } }).fetch();
  },
  'questions.delete': async function (questionId: string) {
    // Allow deletion from Bank admin (no Meteor user check)
    return await Questions.removeAsync(questionId);
  },
  'questions.insert': async function (data: Omit<QuestionVersion, 'version'|'updatedAt'|'updatedBy'>, userId: string) {
    try {
      // eslint-disable-next-line no-console
      console.log('[questions.insert] Received data:', data);

      const now = new Date();
      const effectiveUserId = userId || (this.userId || 'system');
      
      const version: QuestionVersion = {
        ...data,
        version: 1,
        updatedAt: now,
        updatedBy: effectiveUserId,
      };
      // eslint-disable-next-line no-console
      console.log('[questions.insert] Constructed version:', version);
      const result = await Questions.insertAsync({
        currentVersion: 1,
        versions: [version],
        createdAt: now,
        createdBy: effectiveUserId,
      });
      // eslint-disable-next-line no-console
      console.log('[questions.insert] Insert result:', result);
      return result;
    } catch (err) {
      // eslint-disable-next-line no-console
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

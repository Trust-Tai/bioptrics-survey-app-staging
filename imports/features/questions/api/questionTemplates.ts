import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Question, QuestionVersion } from './questions.methods.client';

export interface QuestionTemplate {
  _id?: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  questionData: Question;
}

export const QuestionTemplates = new Mongo.Collection<QuestionTemplate>('questionTemplates');

// @ts-ignore - attachSchema may not be recognized by TypeScript but is available in Meteor's Mongo collections
QuestionTemplates.attachSchema?.(new SimpleSchema({
  name: { type: String },
  description: { type: String, optional: true },
  createdAt: { type: Date },
  createdBy: { type: String },
  questionData: { type: Object, blackbox: true },
}));

Meteor.methods({
  'questionTemplates.insert'(template: Omit<QuestionTemplate, '_id'>) {
    if (!this.userId) throw new Meteor.Error('not-authorized');
    return QuestionTemplates.insert({ ...template, createdAt: new Date(), createdBy: this.userId });
  },
  'questionTemplates.list'() {
    if (!this.userId) throw new Meteor.Error('not-authorized');
    return QuestionTemplates.find({}, { sort: { createdAt: -1 } }).fetch();
  },
  'questionTemplates.remove'(templateId: string) {
    if (!this.userId) throw new Meteor.Error('not-authorized');
    return QuestionTemplates.remove({ _id: templateId });
  },
});

// Add publications for question templates
if (Meteor.isServer) {
  Meteor.publish('questionTemplates.all', function() {
    if (!this.userId) return this.ready();
    return QuestionTemplates.find({}, { sort: { createdAt: -1 } });
  });
}
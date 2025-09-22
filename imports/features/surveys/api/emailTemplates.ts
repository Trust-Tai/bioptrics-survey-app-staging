import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export interface EmailTemplate {
  _id?: string;
  surveyId: string;
  type: 'invitation' | 'reminder';
  subject: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // userId
}

export const EmailTemplates = new Mongo.Collection<EmailTemplate>('emailTemplates');

// Allow rules for EmailTemplates collection
EmailTemplates.allow({
  insert(userId, doc) {
    // Allow inserts if user is logged in
    return !!userId;
  },
  update(userId, doc, fields, modifier) {
    // Allow updates if user is logged in
    return !!userId;
  },
  remove(userId, doc) {
    // Allow removal if user is logged in
    return !!userId;
  }
});

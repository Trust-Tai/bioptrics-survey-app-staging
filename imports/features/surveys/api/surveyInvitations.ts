import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export interface SurveyInvitation {
  _id?: string;
  surveyId: string;
  recipientEmail: string;
  status: 'pending' | 'sent' | 'accepted' | 'completed' | 'failed';
  sentAt: Date;
  sentBy: string; // userId of the sender
  acceptedAt?: Date;
  completedAt?: Date;
  lastReminderSentAt?: Date;
  reminderCount?: number;
  token?: string; // Token for survey access
}

export const SurveyInvitations = new Mongo.Collection<SurveyInvitation>('surveyInvitations');

// // Allow rules for SurveyInvitations collection
// SurveyInvitations.allow({
//   insert(userId, doc) {
//     // Allow inserts if user is logged in
//     return !!userId;
//   },
//   update(userId, doc, fields, modifier) {
//     // Allow updates if user is logged in
//     return !!userId;
//   },
//   remove(userId, doc) {
//     // Allow removal if user is logged in
//     return !!userId;
//   }
// });

import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export interface EmailLog {
  _id?: string;
  invitationId: string;
  surveyId: string;
  recipientEmail: string;
  subject: string;
  sentAt: Date;
  status: 'success' | 'failed';
  errorMessage?: string;
  messageId?: string;
  sentBy: string; // userId
}

export const EmailLogs = new Mongo.Collection<EmailLog>('emailLogs');

// Allow rules for EmailLogs collection
EmailLogs.allow({
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

// Create index for faster queries
if (Meteor.isServer) {
  Meteor.startup(() => {
    EmailLogs.createIndexAsync({ surveyId: 1 });
    EmailLogs.createIndexAsync({ invitationId: 1 });
    EmailLogs.createIndexAsync({ recipientEmail: 1 });
    EmailLogs.createIndexAsync({ sentAt: -1 });
  });
}

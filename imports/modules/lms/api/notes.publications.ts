import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Notes } from './notes';

Meteor.publish('notes.my', function () {
  // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
  const userId = this.userId || 'admin'; // Fallback for JWT auth

  return Notes.find({ userId }, { sort: { updatedAt: -1 } });
});

Meteor.publish('notes.byCourse', function (courseId: string) {
  check(courseId, String);

  // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
  const userId = this.userId || 'admin'; // Fallback for JWT auth

  return Notes.find({ userId, courseId }, { sort: { updatedAt: -1 } });
});

Meteor.publish('notes.byTopic', function (topicId: string) {
  check(topicId, String);

  // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
  const userId = this.userId || 'admin'; // Fallback for JWT auth

  return Notes.find({ userId, topicId }, { sort: { updatedAt: -1 } });
});

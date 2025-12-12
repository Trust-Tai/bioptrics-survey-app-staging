import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Enrollments } from './enrollments';

Meteor.publish('enrollments.my', function () {
  // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
  const userId = this.userId || 'admin'; // Fallback for JWT auth

  return Enrollments.find({ userId });
});

Meteor.publish('enrollments.byCourse', function (courseId: string) {
  check(courseId, String);

  // Note: JWT authentication is handled by admin_jwt token, not Meteor accounts
  const userId = this.userId || 'admin'; // Fallback for JWT auth

  return Enrollments.find({ userId, courseId });
});

Meteor.publish('enrollments.all', function () {
  if (!this.userId) {
    return this.ready();
  }

  // Check if admin
  const user = Meteor.users.findOne(this.userId);
  if (user?.profile?.role !== 'admin') {
    return this.ready();
  }

  return Enrollments.find({});
});

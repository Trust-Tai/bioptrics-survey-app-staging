import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Topics } from './topics';

// Publish all topics for a course
Meteor.publish('topics.byCourse', function (courseId: string) {
  check(courseId, String);

  if (!this.userId) {
    return this.ready();
  }

  return Topics.find({ courseId }, { sort: { order: 1 } });
});

// Publish all topics for a module
Meteor.publish('topics.byModule', function (moduleId: string) {
  check(moduleId, String);

  if (!this.userId) {
    return this.ready();
  }

  return Topics.find({ moduleId }, { sort: { order: 1 } });
});

// Publish a single topic
Meteor.publish('topics.single', function (topicId: string) {
  check(topicId, String);

  if (!this.userId) {
    return this.ready();
  }

  return Topics.find({ _id: topicId });
});

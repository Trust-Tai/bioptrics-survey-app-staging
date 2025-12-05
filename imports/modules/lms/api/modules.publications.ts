import { Meteor } from 'meteor/meteor';
import { Modules } from './modules';
import { Topics } from './topics';
import { Quizzes } from './quizzes';

if (Meteor.isServer) {
  // Publish modules for a specific course
  Meteor.publish('modules.byCourse', function (courseId: string) {
    if (!this.userId) {
      return this.ready();
    }

    return Modules.find({ courseId }, { sort: { order: 1 } });
  });

  // Publish single module
  Meteor.publish('modules.single', function (moduleId: string) {
    if (!this.userId) {
      return this.ready();
    }

    return Modules.find({ _id: moduleId });
  });

  // Publish topics for a specific module
  Meteor.publish('topics.byModule', function (moduleId: string) {
    if (!this.userId) {
      return this.ready();
    }

    return Topics.find({ moduleId }, { sort: { order: 1 } });
  });

  // Publish topics for a specific course
  Meteor.publish('topics.byCourse', function (courseId: string) {
    if (!this.userId) {
      return this.ready();
    }

    return Topics.find({ courseId }, { sort: { order: 1 } });
  });

  // Publish single topic
  Meteor.publish('topics.single', function (topicId: string) {
    if (!this.userId) {
      return this.ready();
    }

    return Topics.find({ _id: topicId });
  });

  // Publish quizzes for a specific module
  Meteor.publish('quizzes.byModule', function (moduleId: string) {
    if (!this.userId) {
      return this.ready();
    }

    return Quizzes.find({ moduleId }, { sort: { order: 1 } });
  });

  // Publish quizzes for a specific course
  Meteor.publish('quizzes.byCourse', function (courseId: string) {
    if (!this.userId) {
      return this.ready();
    }

    return Quizzes.find({ courseId }, { sort: { order: 1 } });
  });

  // Publish single quiz
  Meteor.publish('quizzes.single', function (quizId: string) {
    if (!this.userId) {
      return this.ready();
    }

    return Quizzes.find({ _id: quizId });
  });

  // Publish complete course structure (course + modules + topics + quizzes)
  Meteor.publish('course.fullStructure', function (courseId: string) {
    if (!this.userId) {
      return this.ready();
    }

    return [
      Modules.find({ courseId }, { sort: { order: 1 } }),
      Topics.find({ courseId }, { sort: { order: 1 } }),
      Quizzes.find({ courseId }, { sort: { order: 1 } }),
    ];
  });
}

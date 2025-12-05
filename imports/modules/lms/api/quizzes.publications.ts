import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Quizzes } from './quizzes';

if (Meteor.isServer) {
  // Publish single quiz by ID
  Meteor.publish('quizzes.single', function (quizId: string) {
    check(quizId, String);
    
    return Quizzes.find({ _id: quizId });
  });

  // Publish all quizzes for a module
  Meteor.publish('quizzes.byModule', function (moduleId: string) {
    check(moduleId, String);
    
    return Quizzes.find({ moduleId }, { sort: { order: 1 } });
  });

  // Publish all quizzes for a course
  Meteor.publish('quizzes.byCourse', function (courseId: string) {
    check(courseId, String);
    
    return Quizzes.find({ courseId }, { sort: { order: 1 } });
  });
}

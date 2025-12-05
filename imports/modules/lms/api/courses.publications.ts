import { Meteor } from 'meteor/meteor';
import { Courses } from './courses';
import { CourseTemplates } from './courseTemplates';

if (Meteor.isServer) {
  // Publish all courses for logged-in users
  Meteor.publish('courses.all', function () {
    if (!this.userId) {
      return this.ready();
    }

    return Courses.find({}, {
      sort: { updatedAt: -1 },
    });
  });

  // Publish single course by ID
  Meteor.publish('courses.single', function (courseId: string) {
    if (!this.userId) {
      return this.ready();
    }

    return Courses.find({ _id: courseId });
  });

  // Publish user's own courses
  Meteor.publish('courses.myOwn', function () {
    if (!this.userId) {
      return this.ready();
    }

    return Courses.find(
      { createdBy: this.userId },
      { sort: { updatedAt: -1 } }
    );
  });

  // Publish published courses (for marketplace)
  Meteor.publish('courses.published', function () {
    return Courses.find(
      { status: 'published' },
      { sort: { rating: -1, purchases: -1 } }
    );
  });

  // Publish all active course templates
  Meteor.publish('courseTemplates.all', function () {
    return CourseTemplates.find({ isActive: true });
  });

  // Publish templates by category
  Meteor.publish('courseTemplates.byCategory', function (category: string) {
    return CourseTemplates.find({
      isActive: true,
      category: category,
    });
  });
}

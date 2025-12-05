import { Mongo } from 'meteor/mongo';

export interface CourseTemplateDoc {
  _id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  includes: string[];
  template: any; // Template structure/content
  thumbnail?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const CourseTemplates = new Mongo.Collection<CourseTemplateDoc>('courseTemplates');

// Indexes
if (Meteor.isServer) {
  CourseTemplates.createIndexAsync({ category: 1 });
  CourseTemplates.createIndexAsync({ isActive: 1 });
}

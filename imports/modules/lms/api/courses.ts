import { Mongo } from 'meteor/mongo';

export interface CourseBlock {
  id: string;
  type: string;
  content: any;
  order: number;
}

export interface CourseDoc {
  _id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  blocks: number;
  purchases: number;
  rating: number;
  thumbnail?: string;
  content?: CourseBlock[];
  category?: string;
  tags?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Courses = new Mongo.Collection<CourseDoc>('courses');

// Indexes for better performance
if (Meteor.isServer) {
  Courses.createIndexAsync({ createdBy: 1 });
  Courses.createIndexAsync({ status: 1 });
  Courses.createIndexAsync({ updatedAt: -1 });
}

import { Mongo } from 'meteor/mongo';

export interface LearningObjective {
  id: string;
  text: string;
  order: number;
}

export interface ModuleDoc {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  goals?: string;
  order: number;
  estimatedMinutes: number;
  learningObjectives: LearningObjective[];
  status: 'draft' | 'published';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Modules = new Mongo.Collection<ModuleDoc>('lms_modules');

// Indexes for better performance
if (Meteor.isServer) {
  Modules.createIndexAsync({ courseId: 1, order: 1 });
  Modules.createIndexAsync({ courseId: 1, status: 1 });
  Modules.createIndexAsync({ createdBy: 1 });
}

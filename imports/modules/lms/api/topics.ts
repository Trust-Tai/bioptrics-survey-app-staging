import { Mongo } from 'meteor/mongo';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'quiz' | 'html';
  content: any;
  order: number;
}

export interface TopicDoc {
  _id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  contentBlocks: ContentBlock[];
  estimatedMinutes?: number;
  status: 'draft' | 'published';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Topics = new Mongo.Collection<TopicDoc>('lms_topics');

// Indexes for better performance
if (Meteor.isServer) {
  Topics.createIndexAsync({ moduleId: 1, order: 1 });
  Topics.createIndexAsync({ courseId: 1 });
  Topics.createIndexAsync({ createdBy: 1 });
}

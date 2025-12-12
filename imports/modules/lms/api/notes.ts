import { Mongo } from 'meteor/mongo';

export interface NoteDoc {
  _id: string;
  userId: string;
  courseId: string;
  moduleId?: string;
  topicId?: string;
  title?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Notes = new Mongo.Collection<NoteDoc>('lms_notes');

// Indexes for better performance
if (Meteor.isServer) {
  Notes.createIndexAsync({ userId: 1 });
  Notes.createIndexAsync({ userId: 1, courseId: 1 });
  Notes.createIndexAsync({ userId: 1, topicId: 1 });
  Notes.createIndexAsync({ updatedAt: -1 });
}

import { Mongo } from 'meteor/mongo';

export interface TopicProgress {
  topicId: string;
  completed: boolean;
  completedAt?: Date;
  timeSpent?: number; // in seconds
}

export interface ModuleProgress {
  moduleId: string;
  topicsProgress: TopicProgress[];
  completed: boolean;
  completedAt?: Date;
}

export interface EnrollmentDoc {
  _id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  lastAccessedAt: Date;
  currentModuleId?: string;
  currentTopicId?: string;
  modulesProgress: ModuleProgress[];
  overallProgress: number; // 0-100 percentage
  completed: boolean;
  completedAt?: Date;
  certificateIssued?: boolean;
  certificateIssuedAt?: Date;
}

export const Enrollments = new Mongo.Collection<EnrollmentDoc>('lms_enrollments');

// Indexes for better performance
if (Meteor.isServer) {
  Enrollments.createIndexAsync({ userId: 1, courseId: 1 }, { unique: true });
  Enrollments.createIndexAsync({ userId: 1 });
  Enrollments.createIndexAsync({ courseId: 1 });
  Enrollments.createIndexAsync({ completed: 1 });
}

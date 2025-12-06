import { Mongo } from 'meteor/mongo';

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'single-select' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  order: number;
  allowOther?: boolean;
  otherLabel?: string;
}

export interface QuizSettings {
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  maxAttempts: number;
  allowRetakes: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  requireCompletion: boolean;
}

export interface QuizDoc {
  _id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  questions: QuizQuestion[];
  settings: QuizSettings;
  estimatedMinutes?: number;
  status: 'draft' | 'published';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Quizzes = new Mongo.Collection<QuizDoc>('lms_quizzes');

// Indexes for better performance
if (Meteor.isServer) {
  Quizzes.createIndexAsync({ moduleId: 1, order: 1 });
  Quizzes.createIndexAsync({ courseId: 1 });
  Quizzes.createIndexAsync({ createdBy: 1 });
}

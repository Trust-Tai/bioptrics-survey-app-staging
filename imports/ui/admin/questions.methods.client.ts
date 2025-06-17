import { Meteor } from 'meteor/meteor';

// Define a custom field interface
export interface CustomField {
  title: string;
  content: string;
}

// Define the Question interface locally for this helper file
export interface Question {
  text: string;
  description: string;
  answerType: string;
  answers: string[];
  required: boolean;
  image: string;
  leftLabel?: string;
  rightLabel?: string;
  feedbackType?: 'none' | 'text' | 'rating' | 'file';
  feedbackValue?: string;
  wpsCategoryIds?: string[];
  surveyThemeIds?: string[];
  questionTagId?: string;
  customFields?: CustomField[];
  isReusable?: boolean;
  priority?: number;
  isActive?: boolean;
  keywords?: string[];
  organizationId?: string;
  labels?: string[];
}

// Helper to map QuestionBuilder state to QuestionVersion
export function mapQuestionToVersion(q: Question, userId: string, published: boolean) {
  return {
    questionText: q.text,
    description: q.description,
    responseType: q.answerType,
    categoryTags: q.wpsCategoryIds || [],
    surveyThemes: q.surveyThemeIds || [],
    questionTag: q.questionTagId,
    customFields: q.customFields || [],
    options: q.answers,
    adminNotes: '',
    language: 'en',
    published,
    updatedBy: userId,
    isReusable: q.isReusable,
    isActive: q.isActive,
    priority: q.priority,
    keywords: q.keywords || [],
    organizationId: q.organizationId || '',
    labels: q.labels || [],
  };
}

export async function saveQuestionsToDB(questions: Question[], userId: string) {
  // Save as draft (not published)
  for (const q of questions) {
    await Meteor.callAsync('questions.insert', mapQuestionToVersion(q, userId, false), userId);
  }
}

export async function publishQuestionsToDB(questions: Question[], userId: string) {
  for (const q of questions) {
    await Meteor.callAsync('questions.insert', mapQuestionToVersion(q, userId, true), userId);
  }
}

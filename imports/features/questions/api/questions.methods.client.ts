import { Meteor } from 'meteor/meteor';
import { Questions } from './questions';

// Define the Question interface locally for this helper file
export interface CustomField {
  title: string;
  content: string;
}

export interface Question {
  text: string;
  description: string;
  answerType: string;
  answers: string[];
  required: boolean;
  image: string;
  leftLabel?: string;
  rightLabel?: string;
  wpsCategoryIds?: string[];
  surveyThemeIds?: string[];
  questionTagId?: string;
  customFields?: CustomField[];
  isReusable?: boolean;
  priority?: number;
  isActive?: boolean;
  keywords?: string[];
  organizationId?: string;
  // Feedback fields
  collectFeedback?: boolean;
  feedbackType?: 'text' | 'rating' | 'file';
  feedbackPrompt?: string;
  // Demographics collection
  collectDemographics?: boolean;
  selectedDemographics?: string[];
}

// Define the QuestionVersion interface to match what's expected by the DB
export interface QuestionVersion {
  versionNumber?: number;
  questionText: string;
  description: string;
  responseType: string;
  options: string[];
  required?: boolean;
  image?: string;
  leftLabel?: string;
  rightLabel?: string;
  categoryTags: string[];
  surveyThemes: string[];
  adminNotes: string;
  language: string;
  published: boolean;
  updatedBy: string;
  createdAt?: Date;
  // Feedback fields
  collectFeedback?: boolean;
  feedbackType?: 'text' | 'rating' | 'file';
  feedbackPrompt?: string;
}

// Helper to map QuestionBuilder state to QuestionVersion
export function mapQuestionToVersion(q: Question, userId?: string) {
  return {
    questionText: q.text,
    description: q.description,
    responseType: q.answerType,
    options: q.answers,
    required: q.required,
    image: q.image,
    leftLabel: q.leftLabel,
    rightLabel: q.rightLabel,
    categoryTags: q.wpsCategoryIds || [],
    surveyThemes: q.surveyThemeIds || [],
    questionTag: q.questionTagId,
    customFields: q.customFields || [],
    adminNotes: '',
    language: 'en',
    published: false, // Default to false, will be set to true in publishQuestionsToDB
    updatedBy: userId || Meteor.userId() || '',
    // Feedback fields
    collectFeedback: q.collectFeedback ?? false,
    feedbackType: q.feedbackType ?? 'text',
    feedbackPrompt: q.feedbackPrompt || '',
  };
}

export async function saveQuestionsToDB(editId: string | null, questionVersion: QuestionVersion) {
  if (editId) {
    // Update existing question
    await Meteor.callAsync('questions.update', editId, {
      ...questionVersion,
      published: false
    });
  } else {
    // Create new question
    await Meteor.callAsync('questions.insert', {
      ...questionVersion,
      published: false
    });
  }
}

export async function publishQuestionsToDB(editId: string | null, questionVersion: QuestionVersion) {
  if (editId) {
    // Update existing question and publish
    await Meteor.callAsync('questions.update', editId, {
      ...questionVersion,
      published: true
    });
  } else {
    // Create new question and publish
    await Meteor.callAsync('questions.insert', {
      ...questionVersion,
      published: true
    });
  }
}
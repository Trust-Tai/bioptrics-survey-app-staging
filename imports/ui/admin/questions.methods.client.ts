import { Meteor } from 'meteor/meteor';

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
}

// Helper to map QuestionBuilder state to QuestionVersion
export function mapQuestionToVersion(q: Question, userId: string, published: boolean) {
  return {
    questionText: q.text,
    description: q.description,
    responseType: q.answerType,
    categoryTags: q.wpsCategoryIds || [],
    surveyThemes: q.surveyThemeIds || [],
    options: q.answers,
    adminNotes: '',
    language: 'en',
    published,
    updatedBy: userId,
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

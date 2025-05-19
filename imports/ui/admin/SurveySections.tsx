import React from 'react';

export const SURVEY_SECTIONS = [
  'Welcome Screen',
  'Engagement/Manager Relationships',
  'Peer/Team Dynamics',
  'Feedback & Communication Quality',
  'Recognition and Pride',
  'Safety & Wellness Indicators',
  'Site-specific open text boxes',
  'Optional Demographics',
];

export type SurveySection = typeof SURVEY_SECTIONS[number];

export interface SectionQuestion {
  section: SurveySection;
  questionId: string;
}

export interface SectionQuestionsMap {
  [section: string]: string[]; // array of question IDs per section
}

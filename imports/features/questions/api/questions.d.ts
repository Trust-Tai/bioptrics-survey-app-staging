export interface QuestionVersion {
  version: number;
  versionNumber?: number; // Alias for version
  versionName?: string; // Added for editable version names
  questionText: string;
  text?: string; // Alias for questionText
  description: string;
  responseType: string;
  answerType?: string; // Alias for responseType
  categoryTags: string[];
  sopReference?: string;
  adminNotes?: string;
  answerMetadata?: Record<string, string>; // e.g., { 'A': 'engaged' }
  answers?: string[]; // For multiple choice options
  required?: boolean;
  image?: string;
  leftLabel?: string;
  rightLabel?: string;
  feedbackType?: string;
  feedbackValue?: string;
  estimatedTimeSeconds?: number; // Estimated time to answer the question in seconds
  updatedAt: Date;
  updatedBy: string;
  language?: string;
  surveyThemes?: string[];
}

export interface QuestionDoc {
  _id?: string;
  currentVersion: number;
  versions: QuestionVersion[];
  createdAt: Date;
  createdBy: string;
  wpsCategoryIds?: string[];
  surveyThemeIds?: string[];
  isReusable?: boolean;
  priority?: number;
  isActive?: boolean;
  keywords?: string[];
  organizationId?: string;
}

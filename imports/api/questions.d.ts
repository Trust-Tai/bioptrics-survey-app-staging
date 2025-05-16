export interface QuestionVersion {
  version: number;
  questionText: string;
  description: string;
  responseType: string;
  categoryTags: string[];
  sopReference?: string;
  adminNotes?: string;
  answerMetadata?: Record<string, string>; // e.g., { 'A': 'engaged' }
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
}

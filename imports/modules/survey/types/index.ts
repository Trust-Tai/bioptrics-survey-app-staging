// Survey types exports
export interface SurveyModuleConfig {
  id: string;
  name: string;
  version: string;
}

export interface SurveyData {
  _id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionData {
  _id: string;
  questionText: string;
  responseType: string;
  options?: string[];
}

export interface ResponseData {
  _id: string;
  surveyId: string;
  responses: any[];
  submittedAt: Date;
}

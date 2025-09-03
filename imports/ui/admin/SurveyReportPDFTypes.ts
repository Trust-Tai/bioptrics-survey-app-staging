// Type definitions for SurveyReportPDF component
export interface ReportData {
  reportTitle: string;
  reportSubtitle: string;
  description: string;
  date: string;
  logoUrl: string;
  totalRespondents: number;
  parentTags: ParentTag[];
}

export interface ParentTag {
  id: string;
  name: string;
  description: string;
  childTags: ChildTag[];
}

export interface ChildTag {
  id: string;
  name: string;
  description: string;
  questions: QuestionReport[];
}

export interface QuestionReport {
  id: string;
  title: string;
  description: string;
  responseOverview: string;
  respondents: number;
  options: OptionReport[];
}

export interface OptionReport {
  label: string;
  count: number;
  percentage: number;
  color: string;
  numericValue?: string; // For matching numeric answers
}

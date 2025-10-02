export interface AnalyticsQuestion {
  questionId: string;
  questionText: string;
  questionType: string;
  progress: Record<string, number>;
  latestResponses?: Array<{
    answer: string;
    date: Date;
  }>;
}

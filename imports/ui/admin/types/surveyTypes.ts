// Shared Survey interface for admin components
export interface Survey {
  _id: string;
  title: string;
  description: string;
  status: 'Draft' | 'Active' | 'Closed';
  startDate: Date;
  endDate: Date;
  invitedCount: number;
  responseCount: number;
  publicSlug: string;
  createdAt: Date;
  questions: string[];
}

export type SurveyStatus = 'All' | 'Draft' | 'Active' | 'Closed';

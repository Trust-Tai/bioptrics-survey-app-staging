// Shared Survey interface for admin components
export interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: string[];
  status: 'Draft' | 'Active' | 'Closed';
  startDate: Date;
  endDate: Date;
  responseCount: number;
  invitedCount: number;
  createdAt: Date;
  publicSlug?: string;
  isTemplate?: boolean;
  branching?: BranchingRule[];
  participants?: string[];
  emailSettings?: EmailSettings;
  siteId?: string;
  department?: string;
  tags?: string[];
}

export interface BranchingRule {
  questionId: string;
  condition: 'equals' | 'greaterThan' | 'lessThan' | 'contains';
  value: any;
  nextQuestionId: string;
}

export interface EmailSettings {
  sendReminders: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[];
  reminderTemplate?: string;
}

export type SurveyStatus = 'All' | 'Draft' | 'Active' | 'Closed';

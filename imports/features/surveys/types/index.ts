// Shared types for the surveys feature
export interface SurveySectionItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  priority: number;
  icon?: string;
  color?: string;
  instructions?: string;
  isRequired?: boolean;
  visibilityCondition?: {
    dependsOnSectionId?: string;
    dependsOnQuestionId?: string;
    condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  };
  timeLimit?: number;
  questionIds?: string[];
  templateId?: string;
  customCss?: string;
  progressIndicator?: boolean;
  completionPercentage?: number;
  averageTimeSpent?: number;
  skipLogic?: {
    enabled: boolean;
    rules: Array<{
      condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
      questionId: string;
      value: any;
      skipToSectionId: string;
    }>;
  };
  layout?: 'standard' | 'grid' | 'card' | 'tabbed';
  theme?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  feedback?: {
    enabled: boolean;
    prompt?: string;
    type: 'rating' | 'text' | 'both' | 'thumbs';
  };
}

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  instructions: string;
  organizationId?: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SectionTimeData {
  total: number;
  count: number;
}

export interface SectionAnalytics {
  sectionId: string;
  sectionName: string;
  completionRate: number;
  averageTimeSpent: number; // in seconds
  responseCount: number;
  color?: string;
}

export interface SurveyAnalyticsData {
  totalResponses: number;
  completionRate: number;
  averageTimeSpent: number; // in seconds
  sectionAnalytics: SectionAnalytics[];
  responseOverTime: {
    date: string;
    count: number;
  }[];
  deviceBreakdown: {
    device: string;
    count: number;
  }[];
}

export interface QuestionItem {
  id: string;
  text: string;
  type: string;
  sectionId?: string;
  order?: number;
}

export interface VisibilityCondition {
  dependsOnSectionId?: string;
  dependsOnQuestionId?: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

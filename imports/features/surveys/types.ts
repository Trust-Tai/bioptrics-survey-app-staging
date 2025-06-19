export interface VisibilityCondition {
  dependsOnSectionId?: string;
  dependsOnQuestionId?: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  instructions: string;
  isDefault?: boolean;
  color?: string;
  isRequired?: boolean;
  progressIndicator?: boolean;
  timeLimit?: number;
  customCss?: string;
  layout?: string;
  theme?: string | {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  skipLogic?: any;
  feedback?: any;
}

export interface SurveySectionItem {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  isActive: boolean;
  isRequired?: boolean;
  color?: string;
  priority: number;
  icon?: string;
  visibilityCondition?: VisibilityCondition;
  timeLimit?: number;
  questionIds?: string[];
  templateId?: string;
  customCss?: string;
  progressIndicator?: boolean;
  completionPercentage?: number;
  averageTimeSpent?: number;
  skipLogic?: any;
  layout?: string;
  theme?: string | {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  feedback?: any;
}

export interface QuestionItem {
  id: string;
  text: string;
  type: string;
  status: 'draft' | 'published';
  sectionId?: string;
  order?: number;
}

export interface SurveyItem {
  _id?: string;
  title: string;
  description: string;
  logo?: string;
  image?: string;
  color?: string;
  selectedQuestions?: Record<string, any>;
  siteTextQuestions?: Array<any>;
  siteTextQForm?: any;
  selectedDemographics?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  published?: boolean;
  shareToken?: string;
  organizationId?: string;
  startDate?: Date;
  endDate?: Date;
  isTemplate?: boolean;
  templateName?: string;
  templateCategory?: string;
  templateDescription?: string;
  templateTags?: string[];
  clonedFromId?: string;
  branchingLogic?: {
    rules: Array<{
      questionId: string;
      condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
      value: any;
      jumpToQuestionId: string;
    }>;
    enabled: boolean;
  };
  sections?: SurveySectionItem[];
  surveySections?: SurveySectionItem[];
  sectionQuestions?: QuestionItem[];
  defaultSettings?: {
    allowAnonymous?: boolean;
    requireLogin?: boolean;
    showProgressBar?: boolean;
    allowSave?: boolean;
    allowSkip?: boolean;
    showThankYou?: boolean;
    thankYouMessage?: string;
    redirectUrl?: string;
    notificationEmails?: string[];
    expiryDate?: Date;
    responseLimit?: number;
    themes?: string[];
    categories?: string[];
    startDate?: Date;
    autoPublish?: boolean;
    recurringSchedule?: boolean;
    recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
    restrictAccess?: boolean;
    allowedGroups?: string[];
    passwordProtected?: boolean;
    accessPassword?: string;
  };
  isActive?: boolean;
  priority?: number;
  keywords?: string[];
}

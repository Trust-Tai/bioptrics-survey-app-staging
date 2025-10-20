export interface KPICardData {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ComponentType;
  color: string;
}

export interface PolicyComplianceData {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  status: 'on-track' | 'needs-attention' | 'at-risk';
  team: string;
  category: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export interface ChangeNoticeData {
  id: string;
  title: string;
  category: string;
  progress: number;
  understoodRate: number;
  status: 'on-track' | 'needs-attention' | 'at-risk';
}

export interface SafetyHeatmapData {
  category: string;
  sites: {
    [siteName: string]: number | null;
  };
}

export interface RadarChartData {
  category: string;
  value: number;
}

export interface QuickStartSurveyData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
}

export interface InsightAlertData {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  type: 'policy' | 'notice' | 'psychological';
}

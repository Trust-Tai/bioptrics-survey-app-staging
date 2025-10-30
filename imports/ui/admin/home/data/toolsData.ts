export interface ToolData {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: string; // Lucide icon name
  stats: {
    deployments: number;
    successRate: number;
  };
  features: string[];
  setupTime: string;
  timeToInsights: string;
  buttonText: string;
  cardColor?: string;
  link: string;
}

export const toolsData: ToolData[] = [
  {
    id: 'wps-check',
    title: 'Whole Person Safety (WPS) Check',
    description: 'Monitor holistic safety across your organization with comprehensive wellness insights',
    badge: 'POPULAR',
    icon: 'Heart',
    stats: {
      deployments: 1247,
      successRate: 94
    },
    features: [
      'Holistic safety metrics',
      'Wellness tracking',
      'Risk identification'
    ],
    setupTime: '5 minutes',
    timeToInsights: '48 hours',
    buttonText: 'Deploy This Solution →',
    cardColor: '#6b8e9d',
    link: '/admin/wps-dashboard'
  },
  {
    id: 'culture-surveys',
    title: 'Culture Pre-built Surveys',
    description: 'Launch validated culture assessment surveys designed by experts to measure what matters most',
    badge: 'POPULAR',
    icon: 'Heart',
    stats: {
      deployments: 1247,
      successRate: 94
    },
    features: [
      'Validated survey templates',
      'Expert-designed questions',
      'Benchmark comparisons'
    ],
    setupTime: '5 minutes',
    timeToInsights: '48 hours',
    buttonText: 'Deploy This Solution →',
    cardColor: '#6b8e9d',
    link: '/admin/survey-catalog'
  },
  {
    id: 'survey-builder',
    title: 'Survey Builder',
    description: 'Create custom surveys with our guided builder. Best practices built in to ensure quality data',
    badge: 'FLEXIBLE',
    icon: 'BarChart3',
    stats: {
      deployments: 892,
      successRate: 89
    },
    features: [
      'Drag-and-drop builder',
      'Custom question types',
      'Logic branching'
    ],
    setupTime: '10 minutes',
    timeToInsights: '24 hours',
    buttonText: 'Deploy This Solution →',
    cardColor: '#6b8e9d',
    link: '/admin/surveys/builder'
  },
  {
    id: 'assessment-builder',
    title: 'Assessment Builder',
    description: 'Build comprehensive assessments with scoring logic and automated insights',
    badge: 'ADVANCED',
    icon: 'ClipboardList',
    stats: {
      deployments: 634,
      successRate: 91
    },
    features: [
      'Automated scoring',
      'Custom rubrics',
      'Performance analytics'
    ],
    setupTime: '15 minutes',
    timeToInsights: '48 hours',
    buttonText: 'Deploy This Solution →',
    cardColor: '#c17a5f',
    link: '/admin/assessment-builder'
  },
  {
    id: 'change-notification',
    title: 'Change Notification Builder',
    description: 'Create and track organizational change communications with read receipts and comprehension checks',
    badge: 'COMMUNICATION',
    icon: 'Bell',
    stats: {
      deployments: 523,
      successRate: 87
    },
    features: [
      'Read receipt tracking',
      'Comprehension checks',
      'Multi-channel delivery'
    ],
    setupTime: '8 minutes',
    timeToInsights: '24 hours',
    buttonText: 'Deploy This Solution →',
    cardColor: '#9ca3a8',
    link: '/admin/change-notification'
  },
  {
    id: 'policy-review',
    title: 'Policy Review',
    description: 'Manage policy acknowledgments and compliance tracking across your organization',
    badge: 'REGULATORY',
    icon: 'FileText',
    stats: {
      deployments: 892,
      successRate: 98
    },
    features: [
      'Audit trail generation',
      'Digital signature capture',
      'Automated reminders'
    ],
    setupTime: '3 minutes',
    timeToInsights: '1 hour',
    buttonText: 'Deploy This Solution →',
    cardColor: '#5cb85c',
    link: '/admin/policy-review'
  },
  {
    id: 'knowledge-check',
    title: 'Knowledge Check',
    description: 'Verify understanding with quick knowledge checks and quizzes that drive learning',
    badge: 'LEARNING',
    icon: 'Brain',
    stats: {
      deployments: 721,
      successRate: 92
    },
    features: [
      'Instant feedback',
      'Progress tracking',
      'Adaptive difficulty'
    ],
    setupTime: '7 minutes',
    timeToInsights: '30 minutes',
    buttonText: 'Deploy This Solution →',
    cardColor: '#6b8e9d',
    link: '/admin/knowledge-check'
  },
  {
    id: 'root-cause-analysis',
    title: 'Root Cause Analysis',
    description: 'Dig deeper into issues with structured root cause analysis tools and frameworks',
    badge: 'ANALYSIS',
    icon: 'Search',
    stats: {
      deployments: 445,
      successRate: 88
    },
    features: [
      '5 Whys framework',
      'Fishbone diagrams',
      'Action plan generation'
    ],
    setupTime: '12 minutes',
    timeToInsights: '2 hours',
    buttonText: 'Deploy This Solution →',
    cardColor: '#6b8e9d',
    link: '/admin/root-cause-analysis'
  }
];

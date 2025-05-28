// Export all admin analytics components
export { default as AdminAnalyticsDashboard } from './AdminAnalyticsDashboard';
export { default as AnalyticsDashboard } from './AnalyticsDashboard';

// Export migrated components
export * from './filters';
export * from './kpi';
export * from './charts';
export * from './heatmap';
export * from './trends';
export * from './issues';
export * from './comments';

// Note: All components have been migrated from the UI directory to the feature-based structure
// This follows the feature-based architecture pattern we're implementing throughout the application

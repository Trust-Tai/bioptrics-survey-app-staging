import { Mongo } from 'meteor/mongo';

// Shared collections accessible by all modules
export const SharedCollections = {
  Users: new Mongo.Collection('users'),
  Organizations: new Mongo.Collection('organizations'),
  AuditLogs: new Mongo.Collection('audit_logs'),
  Files: new Mongo.Collection('files'),
  Notifications: new Mongo.Collection('notifications')
};

// Re-export for convenience
export const { Users, Organizations, AuditLogs, Files, Notifications } = SharedCollections;

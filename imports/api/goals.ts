/**
 * This file is kept for backward compatibility with existing imports.
 * It re-exports the Goals collection from the feature-based location.
 */

import { Goals, GoalDoc } from '/imports/features/survey-goals/api/goals';

// Re-export the collection and type
export { Goals, GoalDoc };

// Note: The server-side code (publications, methods, and startup code) has been removed
// to prevent duplicate definitions. These are now defined in the feature-based location.
// See /imports/features/survey-goals/api/goals.ts for the implementation.

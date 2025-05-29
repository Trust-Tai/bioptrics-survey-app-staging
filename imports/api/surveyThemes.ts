/**
 * This file is kept for backward compatibility with existing imports.
 * It re-exports the SurveyThemes collection from the feature-based location.
 */

import { SurveyThemes, SurveyThemeType } from '/imports/features/survey-themes/api/surveyThemes';

// Re-export the collection and type
export { SurveyThemes, SurveyThemeType };

// Note: The server-side code (publications and methods) has been removed
// to prevent duplicate definitions. These are now defined in the feature-based location.
// See /imports/features/survey-themes/api/surveyThemes.ts for the implementation.

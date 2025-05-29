/**
 * This file is kept for backward compatibility with existing imports.
 * It re-exports the SurveyResponses collection from the feature-based location.
 */

import { SurveyResponses, SurveyResponseDoc } from '/imports/features/surveys/api/surveyResponses';

// For backward compatibility, we'll alias SurveyResponses as Responses
export const Responses = SurveyResponses;

// Export the type as ResponseDoc for backward compatibility
export type ResponseDoc = SurveyResponseDoc;

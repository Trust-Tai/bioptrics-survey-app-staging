/**
 * This file is kept for backward compatibility with existing imports.
 * It re-exports the Questions collection from the feature-based location.
 */

import { Questions, QuestionDoc, QuestionVersion } from '/imports/features/questions/api/questions';

// Re-export the types and collection
export { Questions, QuestionDoc, QuestionVersion };

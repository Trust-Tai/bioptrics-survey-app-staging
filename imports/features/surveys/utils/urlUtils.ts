/**
 * Utility functions for handling survey URLs
 */

/**
 * Encode a survey ID for use in public URLs
 * @param surveyId The survey ID to encode
 * @returns The encoded survey ID
 */
export const encodeSurveyId = (surveyId: string): string => {
  // Use base64 encoding for the survey ID
  return Buffer.from(surveyId).toString('base64');
};

/**
 * Decode a survey ID from a public URL
 * @param encodedId The encoded survey ID
 * @returns The original survey ID
 */
export const decodeSurveyId = (encodedId: string): string => {
  // Decode the base64 encoded survey ID
  return Buffer.from(encodedId, 'base64').toString('utf8');
};

/**
 * Generate a public survey URL
 * @param surveyId The survey ID
 * @returns The public survey URL
 */
export const generatePublicSurveyUrl = (surveyId: string): string => {
  const encodedId = encodeSurveyId(surveyId);
  return `public/${encodedId}`;
};

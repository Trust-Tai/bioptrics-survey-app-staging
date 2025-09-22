/**
 * Utility functions for email sending
 */

/**
 * Sleep function to add delay between email sends
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

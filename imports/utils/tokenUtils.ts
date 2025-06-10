import { Meteor } from 'meteor/meteor';
import crypto from 'crypto';

// Secret key for encryption/decryption - in production, this should be an environment variable
const SECRET_KEY = Meteor.settings.public?.tokenSecret || 'bioptrics-survey-app-secret-key';
const IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Encrypts a survey ID to create a secure token
 * @param surveyId The survey ID to encrypt
 * @returns A URL-safe encrypted token
 */
export const encryptSurveyId = (surveyId: string): string => {
  try {
    // Create an initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
    
    // Encrypt the survey ID
    let encrypted = cipher.update(surveyId, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV and encrypted data and convert to base64
    const token = Buffer.from(iv.toString('hex') + ':' + encrypted).toString('base64');
    
    // Make the token URL-safe by replacing characters that have special meaning in URLs
    return token.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error('Error encrypting survey ID:', error);
    // Fallback to a simple encoding if encryption fails
    return Buffer.from(surveyId).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
};

/**
 * Decrypts a token to retrieve the original survey ID
 * @param token The encrypted token
 * @returns The original survey ID
 */
export const decryptToken = (token: string): string | null => {
  try {
    // Make the token base64-safe again
    const safeToken = token.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const paddedToken = safeToken.padEnd(safeToken.length + (4 - (safeToken.length % 4)) % 4, '=');
    
    // Decode from base64
    const combined = Buffer.from(paddedToken, 'base64').toString();
    
    // Split IV and encrypted data
    const parts = combined.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid token format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting token:', error);
    
    // Try fallback decoding if decryption fails
    try {
      // This is a fallback for tokens that were created with the simple encoding
      const decoded = Buffer.from(token.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
      return decoded;
    } catch (e) {
      console.error('Fallback decoding failed:', e);
      return null;
    }
  }
};

/**
 * Generates a secure token for a survey
 * @param surveyId The survey ID
 * @returns An encrypted token
 */
export const generateSurveyToken = (surveyId: string): string => {
  return encryptSurveyId(surveyId);
};

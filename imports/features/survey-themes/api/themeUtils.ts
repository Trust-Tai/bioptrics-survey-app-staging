import { Meteor } from 'meteor/meteor';
import { SurveyThemes } from './surveyThemes';

/**
 * Finds a theme ID by its name
 * @param themeName The name of the theme to find
 * @returns The theme ID if found, null otherwise
 */
export const findThemeIdByName = async (themeName: string): Promise<string | null> => {
  if (!themeName) return null;
  
  try {
    const theme = await SurveyThemes.findOneAsync({ name: themeName });
    return theme?._id || null;
  } catch (error) {
    console.error(`Error finding theme by name "${themeName}":`, error);
    return null;
  }
};

// Register as a Meteor method for easy access
Meteor.methods({
  async 'surveyThemes.findIdByName'(themeName: string) {
    return await findThemeIdByName(themeName);
  }
});

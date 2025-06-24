import { Meteor } from 'meteor/meteor';
import { SurveyThemes } from './surveyThemes';
import { additionalThemesPart1 } from './additionalThemes';
import { additionalThemesPart2Export as additionalThemesPart2 } from './additionalThemesPart2';
import { additionalThemesPart3Export as additionalThemesPart3 } from './additionalThemesPart3';
import { additionalThemesPart4Export as additionalThemesPart4 } from './additionalThemesPart4';
import { additionalThemesPart5Export as additionalThemesPart5 } from './additionalThemesPart5';

// Combine all theme parts into one array
const allAdditionalThemes = [
  ...additionalThemesPart1,
  ...additionalThemesPart2,
  ...additionalThemesPart3,
  ...additionalThemesPart4,
  ...additionalThemesPart5
];

// Function to seed additional themes
export const seedAdditionalThemes = async () => {
  console.log('Checking for existing additional themes...');
  
  // Get existing theme names to avoid duplicates
  const existingThemes = await SurveyThemes.find({}, { fields: { name: 1 } }).fetchAsync();
  const existingThemeNames = existingThemes.map((theme: any) => theme.name.toLowerCase());
  
  // Filter out themes that already exist
  const themesToInsert = allAdditionalThemes.filter(theme => 
    !existingThemeNames.includes(theme.name.toLowerCase())
  );
  
  if (themesToInsert.length > 0) {
    console.log(`Seeding ${themesToInsert.length} new additional survey themes...`);
    
    // Use Promise.all to wait for all insertions to complete
    await Promise.all(themesToInsert.map(async (theme) => {
      await SurveyThemes.insertAsync({
        ...theme,
        createdAt: new Date()
      });
    }));
    
    console.log(`Added ${themesToInsert.length} new additional themes`);
  } else {
    console.log('All additional themes already exist, no new themes added');
  }
};

// Call this function on server startup
if (Meteor.isServer) {
  Meteor.startup(() => {
    // Wait for default themes to be seeded first
    setTimeout(() => {
      seedAdditionalThemes().catch(err => {
        console.error('Error seeding additional themes:', err);
      });
    }, 2000); // Wait 2 seconds after server startup
  });
}

// Export a method to manually trigger seeding
Meteor.methods({
  'seedAdditionalThemes': async function() {
    if (Meteor.isServer) {
      try {
        await seedAdditionalThemes();
        return { success: true, message: 'Additional themes seeded successfully' };
      } catch (error) {
        console.error('Error seeding additional themes:', error);
        throw new Meteor.Error('seed-error', 'Failed to seed additional themes');
      }
    }
  }
});

import { Meteor } from 'meteor/meteor';
import { SurveyThemes } from './surveyThemes';

// Default themes to seed the database
const defaultThemes = [
  {
    name: 'Corporate Blue',
    color: '#1a4b8c',
    description: 'Professional theme with blue color palette, ideal for corporate surveys',
    primaryColor: '#1a4b8c',
    secondaryColor: '#2c7be5',
    accentColor: '#27aae1',
    backgroundColor: '#ffffff',
    textColor: '#2c3e50',
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    layout: 'default',
    buttonStyle: 'rounded',
    questionStyle: 'card',
    headerStyle: 'solid',
    templateType: 'corporate',
    priority: 100,
    isActive: true,
    previewImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    name: 'Modern Purple',
    color: '#552a47',
    description: 'Sleek and modern theme with purple accents',
    primaryColor: '#552a47',
    secondaryColor: '#8e44ad',
    accentColor: '#9b59b6',
    backgroundColor: '#f9f7ff',
    textColor: '#2c3e50',
    headingFont: 'Poppins, sans-serif',
    bodyFont: 'Inter, sans-serif',
    layout: 'default',
    buttonStyle: 'pill',
    questionStyle: 'card',
    headerStyle: 'gradient',
    templateType: 'modern',
    priority: 90,
    isActive: true,
    previewImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    name: 'Minimal Light',
    color: '#f8f9fa',
    description: 'Clean and minimal design with light colors',
    primaryColor: '#495057',
    secondaryColor: '#6c757d',
    accentColor: '#20c997',
    backgroundColor: '#ffffff',
    textColor: '#212529',
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    layout: 'spacious',
    buttonStyle: 'minimal',
    questionStyle: 'flat',
    headerStyle: 'minimal',
    templateType: 'minimal',
    priority: 80,
    isActive: true,
    previewImageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    name: 'Vibrant Green',
    color: '#2ecc71',
    description: 'Energetic theme with green accents, perfect for environmental surveys',
    primaryColor: '#27ae60',
    secondaryColor: '#2ecc71',
    accentColor: '#16a085',
    backgroundColor: '#f0fff4',
    textColor: '#2c3e50',
    headingFont: 'Montserrat, sans-serif',
    bodyFont: 'Open Sans, sans-serif',
    layout: 'default',
    buttonStyle: 'rounded',
    questionStyle: 'bordered',
    headerStyle: 'solid',
    templateType: 'standard',
    priority: 70,
    isActive: true,
    previewImageUrl: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    name: 'Warm Orange',
    color: '#e67e22',
    description: 'Warm and inviting theme with orange accents',
    primaryColor: '#e67e22',
    secondaryColor: '#f39c12',
    accentColor: '#d35400',
    backgroundColor: '#fff9f0',
    textColor: '#34495e',
    headingFont: 'Poppins, sans-serif',
    bodyFont: 'Roboto, sans-serif',
    layout: 'default',
    buttonStyle: 'rounded',
    questionStyle: 'card',
    headerStyle: 'accent',
    templateType: 'standard',
    priority: 60,
    isActive: true,
    previewImageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    name: 'Dark Mode',
    color: '#2c3e50',
    description: 'Dark theme for reduced eye strain and modern look',
    primaryColor: '#3498db',
    secondaryColor: '#2980b9',
    accentColor: '#1abc9c',
    backgroundColor: '#2c3e50',
    textColor: '#ecf0f1',
    headingFont: 'Montserrat, sans-serif',
    bodyFont: 'Open Sans, sans-serif',
    layout: 'default',
    buttonStyle: 'pill',
    questionStyle: 'bordered',
    headerStyle: 'gradient',
    templateType: 'modern',
    priority: 50,
    isActive: true,
    previewImageUrl: 'https://images.unsplash.com/photo-1550684376-efcbd6e3a031?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    name: 'Playful',
    color: '#ff6b6b',
    description: 'Fun and playful theme with bright colors',
    primaryColor: '#ff6b6b',
    secondaryColor: '#ff9e7d',
    accentColor: '#48dbfb',
    backgroundColor: '#ffffff',
    textColor: '#2c3e50',
    headingFont: 'Poppins, sans-serif',
    bodyFont: 'Lato, sans-serif',
    layout: 'default',
    buttonStyle: 'pill',
    questionStyle: 'card',
    headerStyle: 'accent',
    templateType: 'playful',
    priority: 40,
    isActive: true,
    previewImageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    name: 'Elegant',
    color: '#6c5ce7',
    description: 'Sophisticated and elegant theme with purple and gold accents',
    primaryColor: '#6c5ce7',
    secondaryColor: '#a29bfe',
    accentColor: '#ffeaa7',
    backgroundColor: '#ffffff',
    textColor: '#2d3436',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Source Sans Pro, sans-serif',
    layout: 'spacious',
    buttonStyle: 'rounded',
    questionStyle: 'bordered',
    headerStyle: 'gradient',
    templateType: 'elegant',
    priority: 30,
    isActive: true,
    previewImageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  }
];

// Function to seed default themes
export const seedDefaultThemes = async () => {
  console.log('Checking for existing survey themes...');
  
  // Get existing theme names to avoid duplicates
  const existingThemes = await SurveyThemes.find({}, { fields: { name: 1 } }).fetchAsync();
  const existingThemeNames = existingThemes.map((theme: any) => theme.name.toLowerCase());
  
  // Filter out themes that already exist
  const themesToInsert = defaultThemes.filter(theme => 
    !existingThemeNames.includes(theme.name.toLowerCase())
  );
  
  if (themesToInsert.length > 0) {
    console.log(`Seeding ${themesToInsert.length} new survey themes...`);
    
    // Use Promise.all to wait for all insertions to complete
    await Promise.all(themesToInsert.map(async (theme) => {
      await SurveyThemes.insertAsync({
        ...theme,
        createdAt: new Date()
      });
    }));
    
    console.log(`Added ${themesToInsert.length} new themes`);
  } else {
    console.log('All default themes already exist, no new themes added');
  }
};

// Call this function on server startup
if (Meteor.isServer) {
  Meteor.startup(() => {
    seedDefaultThemes().catch(err => {
      console.error('Error seeding default themes:', err);
    });
  });
}

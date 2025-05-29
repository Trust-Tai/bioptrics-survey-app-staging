import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Interface for organization settings
export interface OrganizationSettings {
  _id?: string;
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  
  // Terminology customization
  terminology: {
    surveyLabel: string;        // Default: "Survey"
    questionLabel: string;      // Default: "Question"
    categoryLabel: string;      // Default: "Category"
    tagLabel: string;           // Default: "Tag"
    participantLabel: string;   // Default: "Participant"
    departmentLabel: string;    // Default: "Department"
    siteLabel: string;          // Default: "Site"
  };
  
  // Categories customization
  questionCategories: {
    id: string;
    name: string;
    description?: string;
    assignableTo: ('surveys' | 'questions')[];
  }[];
  
  // Tags customization
  questionTags: {
    id: string;
    name: string;
    color?: string;
    description?: string;
    assignableTo: ('surveys' | 'questions')[];
  }[];
  
  // Default settings
  defaultSettings: {
    enableDemographics: boolean;
    requireComments: boolean;
    anonymousResponses: boolean;
    allowMultipleSubmissions: boolean;
  };
  
  // Contact information
  contactEmail: string;
  supportPhone?: string;
  
  // Last updated
  updatedAt: Date;
  updatedBy: string;
}

// Create the collection
export const OrganizationSettingsCollection = new Mongo.Collection<OrganizationSettings>('organizationSettings');

// Only allow one organization settings document
if (Meteor.isServer) {
  // Publish organization settings
  Meteor.publish('organizationSettings', function() {
    return OrganizationSettingsCollection.find({}, { limit: 1 });
  });
  
  // Initialize with default settings if none exist
  Meteor.startup(async () => {
    const settingsCount = await OrganizationSettingsCollection.find().countAsync();
    
    if (settingsCount === 0) {
      await OrganizationSettingsCollection.insertAsync({
        name: 'Bioptrics',
        primaryColor: '#b0802b',
        secondaryColor: '#402C00',
        terminology: {
          surveyLabel: 'Survey',
          questionLabel: 'Question',
          categoryLabel: 'Category',
          tagLabel: 'Tag',
          participantLabel: 'Participant',
          departmentLabel: 'Department',
          siteLabel: 'Site'
        },
        questionCategories: [
          {
            id: 'behavior-safety',
            name: 'Behavior Safety',
            description: 'Questions related to safety behaviors and practices',
            assignableTo: ['questions']
          },
          {
            id: 'workplace-safety',
            name: 'Workplace Safety',
            description: 'Questions about physical workplace safety',
            assignableTo: ['questions']
          },
          {
            id: 'knowledge-equity',
            name: 'Knowledge Equity',
            description: 'Questions about equal access to information and training',
            assignableTo: ['questions']
          },
          {
            id: 'well-being',
            name: 'Well-Being Safety',
            description: 'Questions about mental and physical well-being',
            assignableTo: ['questions']
          },
          {
            id: 'inclusion',
            name: 'Inclusion Safety',
            description: 'Questions about creating an inclusive environment',
            assignableTo: ['questions']
          }
        ],
        questionTags: [
          {
            id: 'high-priority',
            name: 'High Priority',
            color: '#e74c3c',
            description: 'Questions that need immediate attention',
            assignableTo: ['questions', 'surveys']
          },
          {
            id: 'compliance',
            name: 'Compliance',
            color: '#3498db',
            description: 'Questions related to regulatory compliance',
            assignableTo: ['questions', 'surveys']
          },
          {
            id: 'training',
            name: 'Training',
            color: '#2ecc71',
            description: 'Questions about training and skill development',
            assignableTo: ['questions']
          },
          {
            id: 'feedback',
            name: 'Feedback',
            color: '#f39c12',
            description: 'Questions seeking participant feedback',
            assignableTo: ['questions']
          },
          {
            id: 'improvement',
            name: 'Improvement',
            color: '#9b59b6',
            description: 'Questions about process improvement',
            assignableTo: ['surveys']
          }
        ],
        defaultSettings: {
          enableDemographics: true,
          requireComments: false,
          anonymousResponses: true,
          allowMultipleSubmissions: false
        },
        contactEmail: 'support@newgold.com',
        updatedAt: new Date(),
        updatedBy: 'system'
      });
    }
  });
}

// Methods for updating organization settings
Meteor.methods({
  'organizationSettings.update': async function(settings: Partial<OrganizationSettings>) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update organization settings');
    }
    
    // Check if user is admin (you'll need to implement this check)
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user?.profile?.admin) {
      throw new Meteor.Error('not-authorized', 'Only administrators can update organization settings');
    }
    
    // Get the current settings
    const currentSettings = await OrganizationSettingsCollection.findOneAsync();
    if (!currentSettings) {
      throw new Meteor.Error('not-found', 'Organization settings not found');
    }
    
    // Update the settings
    return OrganizationSettingsCollection.updateAsync(
      currentSettings._id!, 
      { 
        $set: {
          ...settings,
          updatedAt: new Date(),
          updatedBy: this.userId
        } 
      }
    );
  }
});

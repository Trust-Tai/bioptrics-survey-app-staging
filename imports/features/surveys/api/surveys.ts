import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { Accounts } from 'meteor/accounts-base';
import { findThemeIdByName } from '../../survey-themes/api/themeUtils';

// Collaborator interface is defined below as an exported interface

// Extend the User type to include roles
declare module 'meteor/meteor' {
  namespace Meteor {
    interface User {
      roles?: string[];
    }
  }
}

// Define the collaborator role type
export type CollaboratorRole = 'editor' | 'viewer';

// Define the collaborator interface
export interface Collaborator {
  userId: string;      // User ID of the collaborator
  email: string;       // Email of the collaborator
  name?: string;       // Name of the collaborator (optional)
  role: CollaboratorRole; // Role of the collaborator (editor or viewer)
  addedAt: Date;       // When the collaborator was added
  addedBy: string;     // User ID of who added the collaborator
}

export type SurveyStatus = 'active' | 'draft' | 'inactive';

export interface SurveyDoc {
  _id?: string;
  title: string;
  description: string;
  logo?: string;
  image?: string;
  featuredImage?: string;
  color?: string;
  layout?: 'multiStep'  // Questions data (ordering managed via surveyOrder only)
  selectedQuestions?: Record<string, any[]>;
  siteTextQuestions?: any[];
  selectedDemographics: string[];
  selectedTheme?: string;
  selectedCategories?: string[];
  selectedTags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  published: boolean;
  status?: SurveyStatus; // New field for survey status (active, draft, inactive)
  shareToken?: string;
  organizationId?: string;
  startDate?: Date;
  endDate?: Date;
  // Collaboration feature: array of collaborators who can access this survey
  collaborators?: Collaborator[];
  // Template-related fields
  isTemplate?: boolean;
  templateName?: string;
  templateCategory?: string;
  templateDescription?: string;
  templateTags?: string[];
  clonedFromId?: string;
  // Question branching logic
  branchingLogic?: {
    rules: Array<{
      questionId: string;
      condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
      value: any;
      jumpToQuestionId: string;
    }>;
    enabled: boolean;
  };
  // Survey sections for organization and display
  sections?: Array<any>;
  surveySections?: Array<{
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    icon?: string;
    color?: string;
    instructions?: string;
    isRequired?: boolean;
    visibilityCondition?: {
      dependsOnSectionId?: string;
      dependsOnQuestionId?: string;
      condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
      value: any;
    };
    timeLimit?: number; // in seconds
    questionIds?: string[];
    templateId?: string;
    customCss?: string;
    progressIndicator?: boolean;
  }>;
  
  // Questions organized by section
  sectionQuestions?: Array<{
    id: string;
    text: string;
    type: string;
    sectionId?: string;
    order?: number;
  }>;
  // Thank you screen customization
  thankYouMessage?: string;
  thankYouTitle?: string;
  thankYouDetails?: string;
  thankYouIcon?: string;
  thankYouBoxes?: Array<{
    title: string;
    subtitle: string;
    icon: string;
    selected?: boolean;
  }>;
  
  // Welcome screen expectations
  expectations?: Array<{
    title: string;
    description: string;
    image?: string;
  }>;
  expectationsTitle?: string;
  startButtonLabel?: string;
  surveyOrder?: Array<{
    type: 'question' | 'section';
    id: string;
    order: number;
  }>;
  
  defaultSettings?: {
    allowAnonymous?: boolean;
    requireLogin?: boolean;
    showProgressBar?: boolean;
    allowSave?: boolean;
    allowSkip?: boolean;
    showThankYou?: boolean;
    thankYouMessage?: string;
    redirectUrl?: string;
    notificationEmails?: string[];
    expiryDate?: Date;
    responseLimit?: number;
    themes?: string[];
    categories?: string[];
    // New properties for scheduling
    startDate?: Date;
    autoPublish?: boolean;
    recurringSchedule?: boolean;
    recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
    // New properties for access control
    restrictAccess?: boolean;
    allowedGroups?: string[];
    passwordProtected?: boolean;
    accessPassword?: string;
    // Survey retake setting
    allowRetake?: boolean;
  };
  isActive?: boolean;
  priority?: number;
  keywords?: string[];
}

// Import SurveyResponseDoc from the dedicated file
import { SurveyResponseDoc, SurveyResponses } from './surveyResponses';

export const Surveys = new Mongo.Collection<SurveyDoc>('surveys');

// Re-export SurveyResponseDoc for backward compatibility
export { SurveyResponseDoc };

// Re-export for backward compatibility¸
export { SurveyResponses };

if (Meteor.isServer) {
  Meteor.publish('surveys.all', function () {
    return Surveys.find();
  });
  
  Meteor.publish('surveys.single', function (surveyId) {
    check(surveyId, String);
    return Surveys.find({ _id: surveyId });
  });
  
  Meteor.publish('surveys.templates', function () {
    return Surveys.find({ isTemplate: true });
  });
  
  Meteor.publish('surveys.public', async function (shareToken: string) {
    return Surveys.find({ shareToken, published: true });
  });

  // Publication for surveys where the user is either the owner or a collaborator
  Meteor.publish('surveys.ownedAndCollaborated', function (options = {}) {
    if (!this.userId) {
      return this.ready();
    }
    
    // Extract options with defaults
    const limit = options.limit || 10; // Default limit changed to 10
    const skip = options.skip || 0; // Add skip parameter
    const fields = options.fields || {};
    
    // Return surveys where the user is either the owner or a collaborator
    return Surveys.find({
      $or: [
        { createdBy: this.userId },
        { 'collaborators.userId': this.userId }
      ]
    }, {
      sort: { updatedAt: -1 },
      limit: limit,
      skip: skip, // Add skip for pagination
      fields: fields
    });
  });
  
  // Optimized publication that includes creator data directly with surveys
  Meteor.publish('surveys.withCreatorData', function (options = {}) {
    if (!this.userId) {
      return this.ready();
    }
    
    // Extract options with defaults
    const limit = options.limit || 10; // Default limit changed to 10
    const skip = options.skip || 0;
    
    // Find surveys where the user is either the owner or a collaborator
    const surveys = Surveys.find({
      $or: [
        { createdBy: this.userId },
        { 'collaborators.userId': this.userId }
      ]
    }, {
      sort: { updatedAt: -1 },
      limit: limit,
      skip: skip,
      // Only fetch the fields needed for the table/card view
      fields: {
        _id: 1,
        title: 1,
        description: 1,
        published: 1,
        status: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
        sections: 1, // Needed for section count
        responses: 1, // Needed for response stats
        collaborators: 1, // Needed for sharing info
        scheduledFor: 1
      }
    }).fetch();
    
    // Extract unique creator IDs (filter out undefined values)
    const creatorIds = [...new Set(surveys.map(survey => survey.createdBy).filter(Boolean))];
    
    // Add survey documents to the publication
    surveys.forEach(survey => {
      // Cast survey to Record<string, unknown> to satisfy TypeScript
      // Ensure survey._id is a string to fix the type error
      const id = survey._id?.toString() || '';
      this.added('surveys', id, survey as unknown as Record<string, unknown>);
    });
    
    // Find and add only the necessary user data for creators
    if (creatorIds.length > 0) {
      Meteor.users.find(
        { _id: { $in: creatorIds } },
        { 
          fields: { 
            'profile.name': 1, 
            'username': 1, 
            'emails.address': 1 
          } 
        }
      ).forEach(user => {
        // Cast user to Record<string, unknown> to satisfy TypeScript
        this.added('users', user._id, user as unknown as Record<string, unknown>);
      });
    }
    
    this.ready();
  });

  // Preview: allow owner or admin to view the latest draft (published or not)
  Meteor.publish('surveys.preview', async function (encryptedToken) {
    check(encryptedToken, String);
    
    // Import the token decryption utility
    const { decryptToken } = await import('../../../utils/tokenUtils');
    
    // Try to decrypt the token to get the survey ID
    let surveyId;
    let surveyDoc;
    
    try {
      // First try to decrypt the token
      surveyId = decryptToken(encryptedToken);
      
      if (surveyId) {
        // If we successfully decrypted a survey ID, look it up directly
        surveyDoc = await Surveys.findOneAsync({ _id: surveyId });
      }
      
      // If we couldn't find the survey by ID, fall back to the old method
      if (!surveyDoc) {
        const surveyDocs = await Surveys.find({ shareToken: encryptedToken }).fetch();
        surveyDoc = surveyDocs[0];
      }
    } catch (error) {
      console.error('Error decrypting survey token:', error);
      // Fall back to the old method if decryption fails
      const surveyDocs = await Surveys.find({ shareToken: encryptedToken }).fetch();
      surveyDoc = surveyDocs[0];
    }
    
    if (!surveyDoc) return this.ready();
    
    // Allow public access to surveys with shareToken
    if (surveyDoc.shareToken) {
      // Return the survey by ID if we have it, otherwise by shareToken
      return surveyId ? Surveys.find({ _id: surveyId }) : Surveys.find({ shareToken: encryptedToken });
    }
    
    // If no shareToken and not the creator, admin, or collaborator, don't return anything
    if (!this.userId) {
      return this.ready();
    }
    
    const user = await Meteor.users.findOneAsync(this.userId);
    const isOwner = surveyDoc.createdBy === this.userId;
    const isAdmin = user?.roles?.includes('admin');
    const isCollaborator = surveyDoc.collaborators?.some(c => 
      c.userId === this.userId
    );
    
    if (!isOwner && !isAdmin && !isCollaborator) {
      return this.ready();
    }
    
    // Return the survey for creator or admin
    return surveyId ? Surveys.find({ _id: surveyId }) : Surveys.find({ shareToken: encryptedToken });
  });
  
  // Publication for survey responses has been moved to surveyResponses.ts
  // to avoid duplicate publications
  
  // Publication for responses to a specific survey
  Meteor.publish('survey_responses.bySurvey', async function (surveyId) {
    check(surveyId, String);
    
    if (!this.userId) {
      return this.ready();
    }
    
    // Check if user is admin or survey creator
    const user = await Meteor.users.findOneAsync(this.userId);
    const survey = await Surveys.findOneAsync(surveyId);
    
    if (user?.roles?.includes('admin') || (survey && survey.createdBy === this.userId)) {
      return SurveyResponses.find({ surveyId });
    }
    
    return this.ready();
  });
}

Meteor.methods({
  // Get a survey by ID
  async 'surveys.getSurvey'(surveyId: string) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    check(surveyId, String);
    
    // Find the survey
    const survey = await Surveys.findOneAsync(surveyId);
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    return survey;
  },
  
  // Update survey order (unified ordering system)
  async 'surveys.updateSurveyOrder'(surveyId: string, surveyOrder: Array<{type: 'question' | 'section'; id: string; order: number;}>) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    check(surveyId, String);
    check(surveyOrder, Array);
    
    // Find the survey to update
    const survey = await Surveys.findOneAsync(surveyId);
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    console.log('Updating survey order:', surveyOrder);
    
    // Update the survey with the new order
    const result = await Surveys.updateAsync(
      { _id: surveyId },
      { 
        $set: { 
          surveyOrder: surveyOrder,
          updatedAt: new Date()
        } 
      }
    );
    
    return result;
  },

  // REMOVED: Legacy method completely eliminated to enforce single source of truth
  
  // Create a survey template
  async 'surveys.saveAsTemplate'(survey: Partial<SurveyDoc>, templateDetails: { name: string, category: string, description: string, tags: string[] }) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    const now = new Date();
    
    // Validate template details
    check(templateDetails.name, String);
    check(templateDetails.category, String);
    check(templateDetails.description, String);
    check(templateDetails.tags, [String]);
    
    // Create a new template based on the survey
    const templateId = await Surveys.insertAsync({
      title: survey.title || '',
      description: survey.description || '',
      logo: survey.logo,
      image: survey.image,
      featuredImage: survey.featuredImage,
      color: survey.color,
      selectedQuestions: survey.selectedQuestions || {},
      siteTextQuestions: survey.siteTextQuestions || [],
      siteTextQForm: survey.siteTextQForm || {},
      selectedDemographics: survey.selectedDemographics || [],
      published: false,
      isTemplate: true,
      templateName: templateDetails.name,
      templateCategory: templateDetails.category,
      templateDescription: templateDetails.description,
      templateTags: templateDetails.tags,
      clonedFromId: survey._id,
      createdAt: now,
      updatedAt: now,
      createdBy: this.userId,
      defaultSettings: survey.defaultSettings || {},
      branchingLogic: survey.branchingLogic || { rules: [], enabled: false },
    });
    
    return { _id: templateId };
  },
  
  // Create survey from template
  async 'surveys.createFromTemplate'(templateId: string, customizations: { title?: string, description?: string }) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    const now = new Date();
    
    // Find the template
    const template = await Surveys.findOneAsync({ _id: templateId, isTemplate: true });
    if (!template) throw new Meteor.Error('Template not found');
    
    // Create a new survey based on the template
    const surveyId = await Surveys.insertAsync({
      title: customizations.title || `${template.title} (from template)`,
      description: customizations.description || template.description,
      logo: template.logo,
      image: template.image,
      featuredImage: template.featuredImage,
      color: template.color,
      selectedQuestions: template.selectedQuestions,
      siteTextQuestions: template.siteTextQuestions,
      siteTextQForm: template.siteTextQForm,
      selectedDemographics: template.selectedDemographics,
      published: false,
      clonedFromId: templateId,
      createdAt: now,
      updatedAt: now,
      createdBy: this.userId,
      defaultSettings: template.defaultSettings,
      branchingLogic: template.branchingLogic,
    });
    
    return { _id: surveyId };
  },
  
  // Update question branching logic
  async 'surveys.updateBranchingLogic'(surveyId: string, branchingLogic: { rules: Array<{ questionId: string, condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan', value: any, jumpToQuestionId: string }>, enabled: boolean }) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    
    // Validate the survey exists and user has permission
    const survey = await Surveys.findOneAsync(surveyId);
    if (!survey) throw new Meteor.Error('Survey not found');
    
    // Check if user is owner, admin, or editor collaborator
    const user = await Meteor.users.findOneAsync(this.userId);
    const isOwner = survey.createdBy === this.userId;
    const isAdmin = user?.roles?.includes('admin');
    const isEditorCollaborator = survey.collaborators?.some(c => 
      c.userId === this.userId && c.role === 'editor'
    );
    
    if (!isOwner && !isAdmin && !isEditorCollaborator) {
      throw new Meteor.Error('Not authorized', 'You do not have permission to update this survey');
    }
    
    // Update the branching logic
    await Surveys.updateAsync(surveyId, {
      $set: {
        branchingLogic,
        updatedAt: new Date(),
      },
    });
    
    return { success: true };
  },
  
  // Send survey notifications
  async 'surveys.sendNotifications'(surveyId: string, recipients: string[], message: string) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    
    // Validate the survey exists and user has permission
    const survey = await Surveys.findOneAsync(surveyId);
    if (!survey) throw new Meteor.Error('Survey not found');
    if (survey.createdBy !== this.userId && !(await Meteor.users.findOneAsync(this.userId))?.roles?.includes('admin')) {
      throw new Meteor.Error('Not authorized');
    }
    
    // Validate inputs
    check(recipients, [String]);
    check(message, String);
    
    // In a real implementation, this would send emails via a service like SendGrid or Mailgun
    // For now, we'll just log the notification and return success
    console.log(`Sending survey notification for survey ${surveyId} to ${recipients.length} recipients`);
    
    // Record the notification in the database (you would need to create a notifications collection)
    // For now, we'll just update the survey with the notification info
    await Surveys.updateAsync(surveyId, {
      $push: {
        'notificationHistory': {
          sentAt: new Date(),
          recipients: recipients,
          message: message,
          sentBy: this.userId,
        }
      },
      $set: {
        updatedAt: new Date(),
      },
    });
    
    return { success: true, recipientCount: recipients.length };
  },
  
  // Save or update as draft (not published)
  async 'surveys.saveDraft'(survey: Partial<SurveyDoc>) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    const now = new Date();
    if (survey._id) {
      // Update existing
      return await Surveys.updateAsync(survey._id, {
        $set: {
          title: survey.title || '',
          description: survey.description || '',
          logo: survey.logo,
          image: survey.image,
          featuredImage: survey.featuredImage,
          color: survey.color,
          selectedQuestions: survey.selectedQuestions || {},
          siteTextQuestions: survey.siteTextQuestions || [],
          siteTextQForm: survey.siteTextQForm || {},
          selectedDemographics: survey.selectedDemographics || [],
          // Include survey sections and section questions
          surveySections: survey.surveySections || [],
          sectionQuestions: survey.sectionQuestions || [],
          // Include default settings
          defaultSettings: survey.defaultSettings || {},
          // Include themes, categories, and tags
          selectedTheme: survey.selectedTheme,
          selectedCategories: survey.selectedCategories || [],
          selectedTags: survey.selectedTags || [],
          published: false,
          updatedAt: now,
        },
      });
    } else {
      // Insert new
      const doc = {
        title: survey.title || '',
        description: survey.description || '',
        logo: survey.logo,
        image: survey.image,
        featuredImage: survey.featuredImage,
        color: survey.color,
        selectedQuestions: survey.selectedQuestions || {},
        siteTextQuestions: survey.siteTextQuestions || [],
        siteTextQForm: survey.siteTextQForm || {},
        selectedDemographics: survey.selectedDemographics || [],
        // Include survey sections and section questions
        surveySections: survey.surveySections || [],
        sectionQuestions: survey.sectionQuestions || [],
        // Include default settings
        defaultSettings: survey.defaultSettings || {},
        // Include themes, categories, and tags
        selectedTheme: survey.selectedTheme,
        selectedCategories: survey.selectedCategories || [],
        selectedTags: survey.selectedTags || [],
        published: false,
        createdAt: now,
        updatedAt: now,
        createdBy: this.userId,
      };
      try {
        const _id = await Surveys.insertAsync(doc);
        console.log(`Survey created successfully with ID: ${_id}`);
        return { _id };
      } catch (error) {
        console.error('Error creating survey:', error);
        throw new Meteor.Error('creation-failed', 'Failed to create survey');
      }
    }
  },

  // Import a survey from external data
  async 'surveys.import'(importData: any) {
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to import a survey');
    }
    
    // Check if user has admin role or appropriate permissions
    // This is a common cause of 'Access denied' errors
    const currentUser = await Meteor.users.findOneAsync(this.userId);
    if (!currentUser) {
      throw new Meteor.Error('not-found', 'User not found');
    }
    
    // Check if user has admin role
    const isAdmin = currentUser.roles && Array.isArray(currentUser.roles) && currentUser.roles.includes('admin');
    
    // Allow any logged-in user to import surveys (remove this restriction)
    // If you want to restrict to admins only, uncomment the following lines:
    // if (!isAdmin) {
    //   throw new Meteor.Error('permission-denied', 'You do not have permission to import surveys');
    // }
    
    const now = new Date();
    
    try {
      // Transform imported data to match application survey structure
      const surveyDoc: Omit<SurveyDoc, '_id'> = {
        title: importData.title || 'Imported Survey',
        description: importData.description || '',
        logo: importData.logo || null,
        image: importData.image || null,
        featuredImage: importData.featuredImage || null,
        color: importData.color || '#552A47',
        layout: importData.layout || 'multiStep',
        // Required fields for SurveyDoc
        selectedQuestions: {}, // Will be populated during question processing
        siteTextQuestions: importData.siteTextQuestions || [],
        siteTextQForm: importData.siteTextQForm || {},
        selectedDemographics: importData.selectedDemographics || [],
        published: false,
        createdAt: now,
        updatedAt: now,
        createdBy: this.userId,
        status: 'draft',
        // Initialize optional fields
        surveySections: [],
        sectionQuestions: [],
        
        // Welcome screen expectations
        expectations: importData.expectations || [],
        expectationsTitle: importData.expectationsTitle || 'What to expect',
        startButtonLabel: importData.startButtonLabel || 'Start Survey',
        
        // Thank you screen customization
        thankYouMessage: importData.thankYouMessage || 'Thank you for completing the survey!',
        thankYouTitle: importData.thankYouTitle || 'Thank You',
        thankYouDetails: importData.thankYouDetails || '',
        thankYouIcon: importData.thankYouIcon || '',
        // Set all thankYouBoxes as selected by default
        thankYouBoxes: (importData.thankYouBoxes || []).map((box: {title: string; subtitle: string; icon: string; selected?: boolean}) => ({
          ...box,
          selected: box.selected !== undefined ? box.selected : true
        })),
        
        // Survey order - either use provided order or build it from questions and sections
        surveyOrder: importData.surveyOrder || [],
        defaultSettings: {
          responseSettings: {
            allowAnonymousResponses: importData.allowAnonymousResponses || false,
            allowMultipleResponses: importData.allowMultipleResponses || false,
            requireLogin: importData.requireLogin || false,
            showProgressBar: importData.showProgressBar !== undefined ? importData.showProgressBar : true,
            showQuestionNumbers: importData.showQuestionNumbers !== undefined ? importData.showQuestionNumbers : true,
            shuffleQuestions: importData.shuffleQuestions || false,
            shuffleSections: importData.shuffleSections || false,
          },
          collaborationSettings: {
            allowCollaboration: importData.allowCollaboration || false,
            // We'll process collaborators separately to ensure they're properly formatted
            collaborators: [],
          },
          appearanceSettings: {
            logo: importData.logo || '',
            featureImage: importData.featureImage || '',
            surveyLayout: importData.surveyLayout || 'standard',
            theme: importData.theme || 'light',
          },
          thankYouScreen: {
            enabled: importData.thankYouScreenEnabled || true,
            title: importData.thankYouTitle || 'Thank you for your response!',
            message: importData.thankYouMessage || 'Your response has been recorded.',
            redirectUrl: importData.redirectUrl || '',
            redirectDelay: importData.redirectDelay || 0,
            showSummary: importData.showSummary || false,
            summaryItems: importData.summaryItems || [],
          },
        },
        
        // Include themes, categories, and tags
        // If selectedTheme is a name instead of an ID, look up the ID
        selectedTheme: await (async () => {
          // Check if selectedTheme is a string and might be a theme name
          if (typeof importData.selectedTheme === 'string' && importData.selectedTheme) {
            // Try to find theme ID by name
            const themeId = await findThemeIdByName(importData.selectedTheme);
            if (themeId) {
              console.log(`Found theme ID ${themeId} for theme name "${importData.selectedTheme}"`); 
              return themeId;
            } else {
              console.log(`Theme name "${importData.selectedTheme}" not found, using as-is`);
              return importData.selectedTheme;
            }
          }
          return importData.selectedTheme || null;
        })(),
        selectedCategories: importData.selectedCategories || [],
        // We'll process tags separately to convert tag names to IDs
        
        // Additional fields
        isActive: importData.isActive !== undefined ? importData.isActive : true,
        priority: importData.priority || 0,
        keywords: importData.keywords || [],
        
        // Initialize with empty sections array
        surveySections: [],
      };
      
      // Process sections if available
      if (importData.sections && Array.isArray(importData.sections)) {
        if (!surveyDoc.surveySections) {
          surveyDoc.surveySections = [];
        }
        
        // Map imported sections to survey sections
        const mappedSections = importData.sections.map((section: any, index: number) => ({
          id: Random.id(),
          name: section.title || section.name || `Section ${index + 1}`,
          description: section.description || '',
          isActive: true,
          // Priority removed - order managed via surveyOrder only
          icon: section.icon || '',
          color: section.color || '',
          instructions: section.instructions || '',
          isRequired: section.isRequired || false,
          timeLimit: section.timeLimit || 0,
          questionIds: section.questionIds || [],
          templateId: section.templateId || '',
          customCss: section.customCss || '',
          progressIndicator: section.progressIndicator !== undefined ? section.progressIndicator : true,
        }));
        
        // Assign the mapped sections to surveyDoc.surveySections
        surveyDoc.surveySections = mappedSections;
      } else {
        // Create a default section if none provided
        surveyDoc.surveySections = [{
          id: Random.id(),
          name: 'Default Section',
          description: 'Default section for imported survey',
          isActive: true,
          priority: 0,
          progressIndicator: true
        }];
      }
      
      // Process questions if available
      if (importData.questions && Array.isArray(importData.questions)) {
        // Import Questions collection to check for existing questions
        const { Questions } = require('../../../api/questions');
        
        // Create an array to hold all questions
        const allQuestions: Array<{
          id: string;
          text: string;
          type: string;
          sectionId?: string;
          order?: number;
          options?: any[];
          required?: boolean;
          description?: string;
          placeholder?: string;
          defaultValue?: any;
          validation?: any;
        }> = [];
        
        // Initialize selectedQuestions as an object
        surveyDoc.selectedQuestions = {};
        
        // Ensure surveySections exists
        if (!surveyDoc.surveySections || surveyDoc.surveySections.length === 0) {
          surveyDoc.surveySections = [{
            id: Random.id(),
            name: 'Default Section',
            description: 'Default section for imported survey',
            isActive: true,
            // Priority removed - order managed via surveyOrder only
            progressIndicator: true,
            questionIds: []
          }];
        }
        
        const defaultSectionId = surveyDoc.surveySections[0].id;
        
        // Create a map to store questionIds for each section
        const sectionQuestionIdsMap: Record<string, string[]> = {};
        
        // Initialize the map with empty arrays for each section
        surveyDoc.surveySections.forEach((section) => {
          sectionQuestionIdsMap[section.id] = [];
        });
        
        // Create a map from imported section IDs to new section IDs
        const sectionIdMap: Record<string, string> = {};
        if (importData.sections && Array.isArray(importData.sections)) {
          importData.sections.forEach((importedSection: any, index: number) => {
            if (importedSection.id && surveyDoc.surveySections && surveyDoc.surveySections[index]) {
              sectionIdMap[importedSection.id] = surveyDoc.surveySections[index].id;
            }
          });
        }
        
        // Track reused and new questions
        let reusedQuestions = 0;
        let newQuestions = 0;
        
        // Process each question in the import data
        for (let index = 0; index < importData.questions.length; index++) {
          const question = importData.questions[index];
          
          // Extract question text and type for matching first
          const questionText = question.text || question.title || `Question ${index + 1}`;
          const questionType = question.type || 'text';
          
          // Map the imported sectionId to the new sectionId if available
          let sectionId = question.sectionId;
          
          // Check if sectionId exists and is not empty
          console.log(`Processing question "${questionText}" with original sectionId: ${sectionId || 'empty'}`); 
          
          if (sectionId && sectionId.trim() !== '') {
            // If it exists in the map, use the mapped value
            if (sectionIdMap[sectionId]) {
              const originalSectionId = sectionId;
              sectionId = sectionIdMap[sectionId];
              console.log(`Mapped sectionId from ${originalSectionId} to ${sectionId}`);
            } else {
              // If it doesn't exist in the map but is a valid value, keep it as is
              // This preserves any custom sectionId values
              console.log(`Keeping original sectionId: ${sectionId} (not found in section map)`);
            }
          } else {
            // If sectionId is empty, null, or undefined, keep it that way
            // This ensures questions without sections remain outside of sections
            sectionId = '';
            console.log(`Setting empty sectionId for question "${questionText}" to ensure it appears outside sections`);
          }
          
          // Try to find an existing question with the same text and type
          // The issue is that we're looking for 'text' field but storing in 'questionText'
          let existingQuestion = null;
          try {
            // First try to find by versions.questionText (where we actually store the text)
            existingQuestion = await Questions.findOneAsync({
              'versions.questionText': questionText,
              'versions.responseType': questionType
            });
            
            // If not found, try the old way as fallback
            if (!existingQuestion) {
              existingQuestion = await Questions.findOneAsync({
                text: questionText,
                type: questionType
              });
            }
            
            console.log(`Question search for "${questionText}" (${questionType}): ${existingQuestion ? 'Found existing' : 'Not found'}`);
          } catch (error) {
            console.error('Error searching for existing question:', error);
          }
          
          let questionId;
          
          if (existingQuestion && existingQuestion._id) {
            // Reuse the existing question
            questionId = existingQuestion._id;
            reusedQuestions++;
            console.log(`Reusing existing question: "${questionText}" with ID: ${questionId}`);
          } else {
            // Create a new question with proper versioning structure
            try {
              // Prepare question version data
              const questionVersion = {
                questionText: questionText,
                description: question.description || '',
                responseType: question.responseType || questionType, // Use responseType if provided, otherwise fall back to type
                options: question.options || [],
                required: question.required !== undefined ? question.required : false,
                image: question.image || '',
                categoryTags: question.categoryTags || [],
                surveyThemes: question.surveyThemes || [],
                customFields: question.customFields || [],
                labels: question.labels || [],
                isAssessment: question.isAssessment || false,
                correctAnswers: question.correctAnswers || [],
                points: question.points || 1,
                adminNotes: question.adminNotes || '',
                language: question.language || 'en',
                published: true,
                updatedBy: this.userId || 'system',
                collectFeedback: question.collectFeedback || false,
                feedbackType: question.feedbackType || 'text',
                feedbackPrompt: question.feedbackPrompt || '',
                estimatedTimeSeconds: question.estimatedTimeSeconds || 30,
                saveToQuestionBank: question.saveToQuestionBank !== undefined ? question.saveToQuestionBank : true,
                creationSource: 'imported', // Set creation source for imported questions
                version: 1,
                updatedAt: new Date()
              };
              
              // Prepare the complete question document with versioning
              const newQuestionData = {
                currentVersion: 1,
                versions: [questionVersion],
                createdAt: new Date(),
                createdBy: this.userId || 'system'
              };
              
              // Insert the new question
              questionId = await Questions.insertAsync(newQuestionData);
              newQuestions++;
              console.log(`Created new question: "${questionText}" with ID: ${questionId}`);
              console.log(`Question version structure:`, {
                currentVersion: newQuestionData.currentVersion,
                versionCount: newQuestionData.versions.length,
                responseType: questionVersion.responseType,
                questionText: questionVersion.questionText
              });
            } catch (error) {
              console.error(`Error creating new question "${questionText}":`, error);
              // Generate a random ID as fallback if insertion fails
              questionId = Random.id();
            }
          }
          
          // Create the transformed question with the ID (either existing or new)
          const transformedQuestion = {
            id: questionId,
            text: questionText,
            title: questionText, // Add title field to match what UI expects
            questionText: questionText, // Add questionText field for proper display
            type: question.responseType || questionType, // Use responseType if provided, otherwise fall back to type
            sectionId: sectionId,
            // Use the order property from the imported question if available, otherwise use the index
            order: question.order !== undefined ? question.order : index,
            options: question.options || [],
            required: question.required !== undefined ? question.required : false,
            description: question.description || '',
            placeholder: question.placeholder || '',
            defaultValue: question.defaultValue || null,
            validation: question.validation || null,
            responseType: question.responseType || questionType, // Add responseType field
          };
          
          // Log the transformed question structure
          console.log(`Transformed question:`, {
            id: transformedQuestion.id,
            title: transformedQuestion.title,
            questionText: transformedQuestion.questionText,
            type: transformedQuestion.type,
            responseType: transformedQuestion.responseType
          });
          
          allQuestions.push(transformedQuestion);
          
          // Add the question ID to the corresponding section's questionIds array only if it has a valid sectionId
          if (sectionId && sectionId.trim() !== '' && sectionQuestionIdsMap[sectionId]) {
            sectionQuestionIdsMap[sectionId].push(transformedQuestion.id);
            console.log(`Added question "${transformedQuestion.text}" to section ${sectionId}`);
          } else {
            console.log(`Question "${transformedQuestion.text}" will appear outside of any section`);
          }
          
          // Add the question to the selectedQuestions object with its ID as the key
          surveyDoc.selectedQuestions[transformedQuestion.id] = {
            id: transformedQuestion.id,
            text: transformedQuestion.text,
            title: transformedQuestion.text, // Add title field to match what UI expects
            questionText: transformedQuestion.text, // Add questionText field for proper display
            type: transformedQuestion.type,
            responseType: transformedQuestion.responseType, // Add responseType field
            options: transformedQuestion.options,
            required: transformedQuestion.required,
            description: transformedQuestion.description,
            placeholder: transformedQuestion.placeholder,
            defaultValue: transformedQuestion.defaultValue,
            validation: transformedQuestion.validation
          };
        }
        
        // Update each section's questionIds array with the new question IDs
        surveyDoc.surveySections = surveyDoc.surveySections.map((section) => ({
          ...section,
          questionIds: sectionQuestionIdsMap[section.id] || [],
          isActive: true // Ensure section is active
        }));
        
        // Assign questions to sections and ensure each question has the proper format
        surveyDoc.sectionQuestions = allQuestions.map(question => {
          // Use type assertion to handle additional properties
          const q = question as any;
          const sectionQuestion = {
            ...q,
            questionText: q.questionText || q.text, // Ensure questionText field is set
            title: q.title || q.text, // Ensure title field is set
            responseType: q.responseType || q.type, // Ensure responseType field is set
            // Ensure sectionId is properly preserved (empty string if it was empty)
            sectionId: q.sectionId && q.sectionId.trim() !== '' ? q.sectionId : ''
          };
          
          // Log the first few questions to verify structure
          if (allQuestions.indexOf(question) < 3) {
            console.log(`Section question ${allQuestions.indexOf(question) + 1}:`, {
              id: sectionQuestion.id,
              title: sectionQuestion.title,
              questionText: sectionQuestion.questionText,
              type: sectionQuestion.type,
              responseType: sectionQuestion.responseType,
              sectionId: sectionQuestion.sectionId || 'empty'
            });
          }
          
          return sectionQuestion;
        });
        
        // Log a summary of questions with empty sectionId
        const questionsWithoutSection = surveyDoc.sectionQuestions.filter(q => !q.sectionId || q.sectionId.trim() === '');
        console.log(`Found ${questionsWithoutSection.length} questions with empty sectionId that will appear outside sections:`, 
          questionsWithoutSection.map(q => (q as any).text || (q as any).questionText || 'Unnamed question').join(', '));
        
        // Ensure the section-question relationship is properly established
        console.log('Section-Question mapping:');
        surveyDoc.surveySections.forEach(section => {
          const questionIds = section.questionIds || [];
          console.log(`Section ${section.id} (${section.name}) has ${questionIds.length} questions:`, questionIds);
        });
        
        // Build surveyOrder array if not provided in importData
        if (!importData.surveyOrder || importData.surveyOrder.length === 0) {
          console.log('Building surveyOrder array from imported questions and sections');
          const builtSurveyOrder: Array<{type: 'question' | 'section'; id: string; order: number;}> = [];
          let orderIndex = 0;
          
          // First add standalone questions (questions without a section)
          const standaloneQuestions = surveyDoc.sectionQuestions.filter(q => !q.sectionId || q.sectionId.trim() === '');
          standaloneQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          standaloneQuestions.forEach(question => {
            builtSurveyOrder.push({
              id: question.id,
              type: 'question',
              order: orderIndex++
            });
          });
          
          // Then add sections and their questions
          surveyDoc.surveySections.forEach((section: any) => {
            // Add the section itself
            builtSurveyOrder.push({
              type: 'section',
              id: section.id,
              order: orderIndex++
            });
            
            // Find questions that belong to this section using sectionId
            const sectionQuestions = surveyDoc.sectionQuestions?.filter(q => q.sectionId === section.id) || [];
            
            // Sort questions by their order property
            sectionQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            // Add each question that belongs to this section
            sectionQuestions.forEach(question => {
              builtSurveyOrder.push({
                type: 'question',
                id: question.id,
                order: orderIndex++
              });
            });
          });
          
          surveyDoc.surveyOrder = builtSurveyOrder;
          console.log(`Built surveyOrder with ${builtSurveyOrder.length} items`);
          
          // Log thankYouBoxes to verify they are set as selected
          console.log('ThankYouBoxes configuration:');
          if (surveyDoc.thankYouBoxes && surveyDoc.thankYouBoxes.length > 0) {
            surveyDoc.thankYouBoxes.forEach((box, index) => {
              console.log(`Box ${index + 1}: ${box.title} - Selected: ${box.selected}`);
            });
          } else {
            console.log('No thankYouBoxes defined');
          }
          
          // Log the structure to verify
          console.log('Survey order structure:');
          builtSurveyOrder.forEach(item => {
            if (item.type === 'section') {
              const section = surveyDoc.surveySections?.find(s => s.id === item.id);
              console.log(`Section: ${section?.name || item.id} (order: ${item.order})`);
            } else {
              const question = surveyDoc.sectionQuestions?.find(q => q.id === item.id);
              const sectionId = question?.sectionId;
              const sectionName = sectionId ? 
                (surveyDoc.surveySections?.find(s => s.id === sectionId)?.name || sectionId) : 
                'No section';
              console.log(`  Question: ${(question as any)?.text || item.id} (order: ${item.order}, section: ${sectionName})`);
            }
          });
        }
        
        console.log(`Processed ${Object.keys(surveyDoc.selectedQuestions).length} questions for survey import (${reusedQuestions} reused, ${newQuestions} new)`);
      }
      
      // Override settings if provided
      if (importData.settings) {
        surveyDoc.defaultSettings = {
          ...surveyDoc.defaultSettings,
          ...importData.settings
        };
      }
      
      // Apply defaultSettings directly from the import data if available
      if (importData.defaultSettings) {
        surveyDoc.defaultSettings = {
          ...surveyDoc.defaultSettings,
          ...importData.defaultSettings
        };
        
        // Ensure retake settings are properly applied
        if (importData.defaultSettings.retakeSettings) {
          if (!surveyDoc.defaultSettings.retakeSettings) {
            surveyDoc.defaultSettings.retakeSettings = {};
          }
          surveyDoc.defaultSettings.retakeSettings = {
            ...surveyDoc.defaultSettings.retakeSettings,
            ...importData.defaultSettings.retakeSettings
          };
        }
        
        console.log('Applied survey retake settings:', {
          allowRetake: surveyDoc.defaultSettings.allowRetake,
          retakeSettings: surveyDoc.defaultSettings.retakeSettings
        });
      }
      
      // Process tags if available
      if (importData.selectedTags && Array.isArray(importData.selectedTags)) {
        try {
          // Import from Layers to ensure it's available
          const { Layers } = require('../../../api/layers');
          
          // Initialize selectedTags array
          surveyDoc.selectedTags = [];
          
          // Track tag statistics
          let existingTags = 0;
          let newTags = 0;
          
          // For each tag name in the import data
          for (const tagName of importData.selectedTags) {
            // Look up the tag by name - case insensitive search
            const tag = await Layers.findOneAsync({ 
              name: { $regex: new RegExp('^' + tagName + '$', 'i') } 
            });
            
            if (tag && tag._id) {
              // If found, add the tag ID to the survey
              surveyDoc.selectedTags.push(tag._id);
              existingTags++;
              console.log(`Using existing tag '${tagName}' with ID: ${tag._id}`);
            } else {
              console.log(`Tag '${tagName}' not found in the database, creating it...`);
              
              try {
                // Create a new tag with all required fields
                const tagId = `tag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                const newTagData = {
                  id: tagId,
                  name: tagName,
                  location: 'Surveys', // Set location to Surveys as required
                  color: importData.color || 'rgb(85, 42, 71)', // Use survey color or default
                  fields: [],
                  customFields: [],
                  active: true,
                  createdAt: new Date(),
                  createdBy: this.userId || 'system',
                  description: '' // Empty description as per example
                };
                
                // Log the tag data before insertion for debugging
                console.log(`Attempting to create new tag with data:`, JSON.stringify(newTagData));
                
                // Insert the new tag
                const newTagId = await Layers.insertAsync(newTagData);
                console.log(`Created new tag '${tagName}' with ID: ${newTagId}`);
                
                // Add the new tag ID to the survey
                if (newTagId) {
                  surveyDoc.selectedTags.push(newTagId);
                  newTags++;
                }
              } catch (createTagError: any) {
                console.error(`Failed to create tag '${tagName}':`, createTagError);
                console.error(`Error details: ${createTagError.message || 'Unknown error'}`);
                
                // Try to provide more specific error information
                if (createTagError.code === 11000) {
                  console.error('This appears to be a duplicate key error. The tag might already exist with a different case.');
                  
                  // Try to find the tag again with a more flexible search
                  try {
                    const existingTag = await Layers.findOneAsync({ 
                      name: { $regex: new RegExp(tagName, 'i') } 
                    });
                    
                    if (existingTag && existingTag._id) {
                      console.log(`Found existing tag with similar name: '${existingTag.name}' (ID: ${existingTag._id})`);
                      surveyDoc.selectedTags.push(existingTag._id);
                      existingTags++;
                    }
                  } catch (secondaryError) {
                    console.error('Failed in secondary tag lookup:', secondaryError);
                  }
                }
              }
            }
          }
          
          console.log(`Processed ${surveyDoc.selectedTags.length} tags for survey import (${existingTags} existing, ${newTags} new)`);
        } catch (tagError) {
          console.error('Error processing tags during survey import:', tagError);
          // Continue with import even if tag processing fails
        }
      } else {
        // Initialize with empty array if no tags provided
        surveyDoc.selectedTags = [];
      }
      
      try {
        // Add required fields for a valid survey
        surveyDoc.published = false;
        surveyDoc.createdAt = now;
        surveyDoc.updatedAt = now;
        surveyDoc.createdBy = this.userId;
        
        // Insert the survey as a draft
        console.log('Inserting survey document:', JSON.stringify(surveyDoc));
        const _id = await Surveys.insertAsync(surveyDoc);
        
        // Process collaborators if they exist in the import data
        if (importData.collaborators && Array.isArray(importData.collaborators) && importData.collaborators.length > 0) {
          console.log('Processing collaborators from import data:', importData.collaborators);
          
          // Process each collaborator
          for (const collaborator of importData.collaborators) {
            if (collaborator.email) {
              try {
                // Check if user exists
                let collaboratorUser = await Meteor.users.findOneAsync({ 'emails.address': collaborator.email });
                
                // If user doesn't exist and we have permission to create users, create a new user
                if (!collaboratorUser && isAdmin) {
                  console.log(`Creating new user for collaborator: ${collaborator.email}`);
                  
                  try {
                    // Generate a random password (user will need to reset it)
                    const randomPassword = Random.id(10);
                    
                    // Create the user account
                    const userId = Accounts.createUser({
                      email: collaborator.email,
                      password: randomPassword,
                      profile: {
                        name: collaborator.name || collaborator.email.split('@')[0] // Use provided name or part of email as name
                      }
                    });
                    
                    // Set the newly created user
                    collaboratorUser = await Meteor.users.findOneAsync(userId);
                    
                    // Send enrollment email to set password
                    if (collaboratorUser) {
                      Accounts.sendEnrollmentEmail(userId);
                      console.log(`Enrollment email sent to: ${collaborator.email}`);
                    }
                  } catch (userCreateError: any) {
                    console.error(`Error creating user for ${collaborator.email}:`, userCreateError);
                    // Continue with next collaborator if this one fails
                    continue;
                  }
                }
                
                // If we have a valid user, add them as a collaborator
                if (collaboratorUser) {
                  const collaboratorRole = collaborator.role || 'viewer';
                  
                  // Add the collaborator to the survey
                  await Surveys.updateAsync(
                    { _id },
                    { 
                      $push: { 
                        collaborators: {
                          userId: collaboratorUser._id,
                          email: collaborator.email,
                          name: collaborator.name || collaboratorUser.profile?.name || collaborator.email.split('@')[0],
                          role: collaboratorRole,
                          addedAt: new Date(),
                          addedBy: this.userId
                        }
                      },
                      $set: { updatedAt: new Date() }
                    }
                  );
                  
                  console.log(`Added collaborator ${collaborator.email} with role ${collaboratorRole} to survey ${_id}`);
                } else {
                  console.log(`Could not add collaborator: ${collaborator.email} - User not found and could not be created`);
                }
              } catch (error: any) {
                console.error(`Error processing collaborator ${collaborator.email}:`, error);
              }
            }
          }
        }
        
        console.log('Survey imported successfully with ID:', _id);
        return { _id, success: true, message: 'Survey imported successfully!' };
      } catch (error: any) {
        console.error('Error importing survey:', error);
        
        // Handle specific error cases
        if (error.error === 403) {
          throw new Meteor.Error('permission-denied', 'You do not have permission to import surveys');
        } else if (error.code === 11000) {
          throw new Meteor.Error('duplicate-error', 'A survey with this title already exists');
        } else {
          throw new Meteor.Error('import-failed', `Failed to import survey: ${error.message || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('Error in survey import:', error);
      
      // Return a more descriptive error
      const errorMessage = error.reason || error.message || 'An unknown error occurred';
      throw new Meteor.Error('import-error', `Error importing survey: ${errorMessage}`);
    }
  },
  
  async 'surveys.publish'(survey: Partial<SurveyDoc>) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    const now = new Date();
    
    // Find existing survey if we're updating
    const existingRaw = survey._id ? await Surveys.findOneAsync(survey._id) : null;
    const existing: SurveyDoc | undefined = (typeof existingRaw === 'object' && existingRaw !== null ? existingRaw as SurveyDoc : undefined);
    
    // Check if user is authorized to publish this survey
    if (existing) {
      const user = await Meteor.users.findOneAsync(this.userId);
      const isOwner = existing.createdBy === this.userId;
      const isAdmin = user?.roles?.includes('admin');
      const isEditorCollaborator = existing.collaborators?.some(c => 
        c.userId === this.userId && c.role === 'editor'
      );
      
      if (!isAdmin && !isOwner && !isEditorCollaborator) {
        throw new Meteor.Error('Not authorized', 'You do not have permission to publish this survey');
      }
    
      // If already published and has a shareToken, just return it
      if (existing.published && existing.shareToken) {
        return { _id: existing._id, shareToken: existing.shareToken };
      }
    }

    // If not, generate a new token if needed
    const shareToken = existing?.shareToken || Random.id(12);

    if (survey._id) {
      await Surveys.updateAsync(survey._id, {
        $set: {
          title: survey.title || (existing ? existing.title : ''),
          description: survey.description || (existing ? existing.description : ''),
          logo: survey.logo !== undefined ? survey.logo : existing?.logo,
          image: survey.image !== undefined ? survey.image : existing?.image,
          featuredImage: survey.featuredImage !== undefined ? survey.featuredImage : existing?.featuredImage,
          color: survey.color !== undefined ? survey.color : existing?.color,
          selectedQuestions: survey.selectedQuestions || (existing ? existing.selectedQuestions : {}),
          siteTextQuestions: survey.siteTextQuestions || (existing ? existing.siteTextQuestions : []),
          siteTextQForm: survey.siteTextQForm || (existing ? existing.siteTextQForm : {}),
          selectedDemographics: survey.selectedDemographics || (existing ? existing.selectedDemographics : []),
          // Include survey sections and section questions
          surveySections: survey.surveySections || (existing ? existing.surveySections : []),
          sectionQuestions: survey.sectionQuestions || (existing ? existing.sectionQuestions : []),
          // Include default settings
          defaultSettings: survey.defaultSettings || (existing ? existing.defaultSettings : {}),
          // Include themes, categories, and tags
          selectedTheme: survey.selectedTheme !== undefined ? survey.selectedTheme : existing?.selectedTheme,
          selectedCategories: survey.selectedCategories || (existing ? existing.selectedCategories : []),
          selectedTags: survey.selectedTags || (existing ? existing.selectedTags : []),
          // Include Thank You screen customization fields
          thankYouMessage: survey.thankYouMessage !== undefined ? survey.thankYouMessage : existing?.thankYouMessage,
          thankYouTitle: survey.thankYouTitle !== undefined ? survey.thankYouTitle : existing?.thankYouTitle,
          thankYouDetails: survey.thankYouDetails !== undefined ? survey.thankYouDetails : existing?.thankYouDetails,
          thankYouIcon: survey.thankYouIcon !== undefined ? survey.thankYouIcon : existing?.thankYouIcon,
          thankYouBoxes: survey.thankYouBoxes || (existing ? existing.thankYouBoxes : []),
          published: true,
          shareToken,
          updatedAt: now,
        },
      });
      return { _id: survey._id, shareToken };
    } else {
      const doc = {
        title: survey.title || '',
        description: survey.description || '',
        logo: survey.logo,
        image: survey.image,
        featuredImage: survey.featuredImage,
        color: survey.color,
        selectedQuestions: survey.selectedQuestions || {},
        siteTextQuestions: survey.siteTextQuestions || [],
        siteTextQForm: survey.siteTextQForm || {},
        selectedDemographics: survey.selectedDemographics || [],
        // Include survey sections and section questions
        surveySections: survey.surveySections || [],
        sectionQuestions: survey.sectionQuestions || [],
        // Include default settings
        defaultSettings: survey.defaultSettings || {},
        // Include themes, categories, and tags
        selectedTheme: survey.selectedTheme,
        selectedCategories: survey.selectedCategories || [],
        selectedTags: survey.selectedTags || [],
        published: true,
        shareToken,
        createdAt: now,
        updatedAt: now,
        createdBy: this.userId,
      };
      const _id = await Surveys.insertAsync(doc);
      return { _id, shareToken };
    }
  },

  async 'surveys.remove'(surveyId: string) {
    check(surveyId, String);
    
    if (!this.userId) throw new Meteor.Error('Not authorized');
    
    // Instead of removing the survey, update its status to 'inactive'
    return await Surveys.updateAsync(
      { _id: surveyId },
      { 
        $set: { 
          status: 'inactive',
          updatedAt: new Date() 
        } 
      }
    );
  },

  // Update an existing survey with all data including sections and questions
  async 'surveys.update'(surveyId: string, survey: Partial<SurveyDoc>) {
    check(surveyId, String);
    
    if (!this.userId) throw new Meteor.Error('Not authorized');
    
    // Validate the survey exists and user has permission
    const existingSurvey = await Surveys.findOneAsync(surveyId);
    if (!existingSurvey) throw new Meteor.Error('Survey not found');
    
    // Check if user is admin, survey creator, or editor collaborator
    const user = await Meteor.users.findOneAsync(this.userId);
    const isOwner = existingSurvey.createdBy === this.userId;
    const isAdmin = user?.roles?.includes('admin');
    const isEditorCollaborator = existingSurvey.collaborators?.some(c => 
      c.userId === this.userId && c.role === 'editor'
    );
    
    if (!isAdmin && !isOwner && !isEditorCollaborator) {
      throw new Meteor.Error('Not authorized to update this survey');
    }
    
    const now = new Date();
    
    await Surveys.updateAsync(surveyId, {
      $set: {
        title: survey.title || existingSurvey.title,
        description: survey.description || existingSurvey.description,
        logo: survey.logo !== undefined ? survey.logo : existingSurvey.logo,
        image: survey.image !== undefined ? survey.image : existingSurvey.image,
        featuredImage: survey.featuredImage !== undefined ? survey.featuredImage : existingSurvey.featuredImage,
        color: survey.color !== undefined ? survey.color : existingSurvey.color,
        selectedQuestions: survey.selectedQuestions || existingSurvey.selectedQuestions || {},
        siteTextQuestions: survey.siteTextQuestions || existingSurvey.siteTextQuestions || [],
        siteTextQForm: survey.siteTextQForm || existingSurvey.siteTextQForm || {},
        selectedDemographics: survey.selectedDemographics || existingSurvey.selectedDemographics || [],
        // Include survey sections (questions are managed via surveyOrder only)
        surveySections: survey.surveySections || existingSurvey.surveySections || [],
        // Include section questions to preserve section assignments
        sectionQuestions: survey.sectionQuestions || existingSurvey.sectionQuestions || [],
        // Include default settings
        defaultSettings: survey.defaultSettings || existingSurvey.defaultSettings || {},
        // Include themes, categories, and tags
        selectedTheme: survey.selectedTheme !== undefined ? survey.selectedTheme : existingSurvey.selectedTheme,
        selectedCategories: survey.selectedCategories || existingSurvey.selectedCategories || [],
        selectedTags: survey.selectedTags || existingSurvey.selectedTags || [],
        // Include Thank You screen customization fields
        thankYouMessage: survey.thankYouMessage !== undefined ? survey.thankYouMessage : existingSurvey.thankYouMessage,
        thankYouTitle: survey.thankYouTitle !== undefined ? survey.thankYouTitle : existingSurvey.thankYouTitle,
        thankYouDetails: survey.thankYouDetails !== undefined ? survey.thankYouDetails : existingSurvey.thankYouDetails,
        thankYouIcon: survey.thankYouIcon !== undefined ? survey.thankYouIcon : existingSurvey.thankYouIcon,
        thankYouBoxes: survey.thankYouBoxes || existingSurvey.thankYouBoxes || [],
        // Include layout setting
        layout: survey.layout !== undefined ? survey.layout : existingSurvey.layout,
        // Include expectations data
        expectations: survey.expectations !== undefined ? survey.expectations : existingSurvey.expectations,
        expectationsTitle: survey.expectationsTitle !== undefined ? survey.expectationsTitle : existingSurvey.expectationsTitle,
        startButtonLabel: survey.startButtonLabel !== undefined ? survey.startButtonLabel : existingSurvey.startButtonLabel,
        surveyOrder: survey.surveyOrder || existingSurvey.surveyOrder || [],
        updatedAt: now,
      },
    });
    
    return { success: true };
  },
  // Public method to fetch survey by ID
  async 'surveys.get'(surveyId: string) {
    check(surveyId, String);
    return await Surveys.findOneAsync({ _id: surveyId });
  },
  // Allow anonymous submission of survey responses
  // Generate an encrypted token for a survey ID
  async 'surveys.generateEncryptedToken'(surveyId: string) {
    check(surveyId, String);
    
    // Verify the survey exists
    const survey = await Surveys.findOneAsync(surveyId);
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    // Check if user is authorized (admin or survey creator)
    if (this.userId) {
      const user = await Meteor.users.findOneAsync(this.userId);
      if (survey.createdBy !== this.userId && !user?.roles?.includes('admin')) {
        throw new Meteor.Error('not-authorized', 'Not authorized to generate token for this survey');
      }
    } else if (!survey.published) {
      // Non-authenticated users can only access published surveys
      throw new Meteor.Error('not-authorized', 'Not authorized to access unpublished survey');
    }
    
    // Import the token generation utility
    const { generateSurveyToken } = await import('../../../utils/tokenUtils');
    
    // Generate and return the encrypted token
    return generateSurveyToken(surveyId);
  },
  
  async 'surveys.submitResponse'(data: { surveyId: string, responses: Record<string, any>, token?: string, deviceType?: 'desktop' | 'tablet' | 'mobile' }) {
    // Log the incoming data to verify deviceType is being received
    console.log('surveys.submitResponse received data:', { 
      surveyId: data.surveyId,
      responseCount: Object.keys(data.responses).length,
      deviceType: data.deviceType,
      token: data.token
    });
    check(data.surveyId, String);
    check(data.responses, Object);
    
    // Validate that the survey exists
    const survey = await Surveys.findOneAsync({ _id: data.surveyId });
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    console.log('Received survey response submission:', {
      surveyId: data.surveyId,
      responseCount: Object.keys(data.responses).length,
      hasToken: !!data.token,
      responseKeys: Object.keys(data.responses)
    });
    
    // Convert responses object to array format expected by SurveyResponseDoc
    const responsesArray = Object.entries(data.responses).map(([questionId, answer]) => {
      console.log(`Processing response for question ${questionId}:`, answer);
      return {
        questionId,
        answer,
      };
    });
    
    const now = new Date();
    const startTime = new Date(now.getTime() - 300000); // Assume started 5 minutes ago if not provided
    
    // First, create a properly structured metadata object with explicit type
    const metadata: {
      browser: string;
      ipAddress: string;
      deviceType: 'desktop' | 'tablet' | 'mobile';
      userAgent: string;
    } = {
      browser: this.connection?.httpHeaders?.['user-agent'] || 'Unknown',
      ipAddress: this.connection?.clientAddress || 'Unknown',
      deviceType: data.deviceType || 'desktop', // Include device type from client or default to desktop
      userAgent: this.connection?.httpHeaders?.['user-agent'] || 'Unknown'
    };
    
    console.log('Creating metadata with deviceType:', metadata.deviceType);
    
    // Create a document that matches the SurveyResponseDoc interface
    const responseDoc = {
      surveyId: data.surveyId,
      userId: this.userId || undefined,
      respondentId: data.token, // Store the token as respondentId
      responses: responsesArray,
      completed: true,
      startTime: startTime,
      endTime: now,
      completionTime: Math.floor((now.getTime() - startTime.getTime()) / 1000), // in seconds
      progress: 100,
      metadata: metadata, // Use the metadata object we created above
      createdAt: now,
      updatedAt: now
    };
    
    console.log('Survey response document with device type:', responseDoc.metadata);
    
    console.log('Inserting survey response document:', responseDoc);
    
    try {
      // We've already created the metadata object above, so no need to redefine it here
      console.log('Final response document with metadata:', responseDoc);
      
      const responseId = await SurveyResponses.insertAsync(responseDoc);
      console.log('Survey response saved with ID:', responseId);
      
      // Verify the response was saved correctly
      const savedResponse = await SurveyResponses.findOneAsync(responseId);
      console.log('Verified saved response metadata:', savedResponse?.metadata);
      
      // If we have an incomplete response with the same token, mark it as completed
      if (data.token) {
        const { IncompleteSurveyResponses } = await import('./incompleteSurveyResponses');
        await IncompleteSurveyResponses.updateAsync(
          { respondentId: data.token, surveyId: data.surveyId },
          { $set: { isCompleted: true } }
        );
      }
      
      return responseId;
    } catch (error) {
      console.error('Error saving survey response:', error);
      throw new Meteor.Error('db-error', 'Failed to save survey response');
    }
  },
  
  /**
   * Make a survey public by generating a share token
   * @param surveyId - The ID of the survey to make public
   * @returns The updated survey document
   */
  // Update survey status (active, inactive, draft, etc.)
  async 'surveys.updateStatus'(surveyId: string, status: SurveyStatus) {
    check(surveyId, String);
    check(status, String);
    
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update a survey status');
    }
    
    // Check if the survey exists
    const survey = await Surveys.findOneAsync(surveyId);
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    // Check if user has permission to update this survey
    const user = await Meteor.users.findOneAsync(this.userId);
    const isOwner = survey.createdBy === this.userId;
    const isAdmin = user?.roles?.includes('admin');
    const isEditorCollaborator = survey.collaborators?.some(c => 
      c.userId === this.userId && c.role === 'editor'
    );
    
    if (!isAdmin && !isOwner && !isEditorCollaborator) {
      throw new Meteor.Error('not-authorized', 'You do not have permission to update this survey status');
    }
    
    // Update the survey status
    await Surveys.updateAsync(
      { _id: surveyId },
      { 
        $set: { 
          status: status,
          updatedAt: new Date() 
        } 
      }
    );
    
    return await Surveys.findOneAsync(surveyId);
  },
  
  async 'surveys.makePublic'(surveyId: string) {
    check(surveyId, String);
    
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to make a survey public');
    }
    
    // Find the survey
    const survey = await Surveys.findOneAsync({ _id: surveyId });
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    // Check if user has permission to modify this survey
    if (survey.createdBy !== this.userId) {
      // Check if user is an admin
      const user = await Meteor.users.findOneAsync(this.userId);
      if (!user?.roles?.includes('admin')) {
        throw new Meteor.Error('not-authorized', 'You do not have permission to modify this survey');
      }
    }
    
    // Generate a share token if one doesn't exist
    const shareToken = survey.shareToken || Random.id(10);
    
    // Update the survey
    await Surveys.updateAsync(
      { _id: surveyId },
      { 
        $set: { 
          published: true,
          shareToken: shareToken,
          updatedAt: new Date()
        } 
      }
    );
    
    // Return the updated survey
    return await Surveys.findOneAsync({ _id: surveyId });
  },
  
  /**
   * Add a collaborator to a survey
   * @param surveyId - The ID of the survey to add a collaborator to
   * @param collaboratorEmail - The email of the user to add as a collaborator
   * @param role - The role to assign to the collaborator (editor or viewer)
   * @param sendNotification - Whether to send an email notification (default: true)
   * @returns The updated survey document
   */
  async 'surveys.addCollaborator'(surveyId: string, collaboratorEmail: string, role: CollaboratorRole, sendNotification = true) {
    check(surveyId, String);
    check(collaboratorEmail, String);
    check(role, String);
    
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add collaborators');
    }
    
    // Find the survey
    const survey = await Surveys.findOneAsync({ _id: surveyId });
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    // Check if user has permission to modify this survey (must be owner or admin)
    if (survey.createdBy !== this.userId) {
      // Check if user is an admin
      const user = await Meteor.users.findOneAsync(this.userId);
      if (!user?.roles?.includes('admin')) {
        throw new Meteor.Error('not-authorized', 'Only the survey owner or an admin can add collaborators');
      }
    }
    
    // Find the user to add as a collaborator
    const collaboratorUser = await Meteor.users.findOneAsync({ 'emails.address': collaboratorEmail });
    if (!collaboratorUser) {
      throw new Meteor.Error('user-not-found', 'User with this email address not found');
    }
    
    // Don't allow adding the owner as a collaborator
    if (collaboratorUser._id === survey.createdBy) {
      throw new Meteor.Error('invalid-operation', 'Cannot add the survey owner as a collaborator');
    }
    
    // Check if user is already a collaborator
    if (survey.collaborators?.some(c => c.userId === collaboratorUser._id)) {
      throw new Meteor.Error('already-exists', 'This user is already a collaborator on this survey');
    }
    
    // Create the collaborator object
    const collaborator: Collaborator = {
      userId: collaboratorUser._id,
      email: collaboratorEmail,
      name: collaboratorUser.profile?.name,
      role: role,
      addedAt: new Date(),
      addedBy: this.userId
    };
    
    // Add the collaborator to the survey
    await Surveys.updateAsync(
      { _id: surveyId },
      { 
        $push: { collaborators: collaborator },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Send email notification if requested
    if (sendNotification) {
      try {
        // Import the email service
        const { sendCollaboratorInvitation } = await import('../../../utils/emailService');
        
        // Get the inviter's name
        const inviter = await Meteor.users.findOneAsync(this.userId);
        const inviterName = inviter?.profile?.name || inviter?.username || 'A survey administrator';
        
        // Send the invitation email
        await sendCollaboratorInvitation(
          collaboratorEmail,
          survey.title,
          inviterName,
          role,
          surveyId
        );
        
        console.log(`Sent collaboration invitation email to ${collaboratorEmail} for survey ${surveyId}`);
      } catch (error) {
        // Log the error but don't fail the operation if email sending fails
        console.error('Failed to send collaborator invitation email:', error);
      }
    }
    
    // Return the updated survey
    return await Surveys.findOneAsync({ _id: surveyId });
  },

  /**
   * Remove a collaborator from a survey
   * @param surveyId - The ID of the survey to remove a collaborator from
   * @param collaboratorId - The ID of the user to remove as a collaborator
   * @returns The updated survey document
   */
  async 'surveys.removeCollaborator'(surveyId: string, collaboratorId: string) {
    check(surveyId, String);
    check(collaboratorId, String);
    
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to remove collaborators');
    }
    
    // Find the survey
    const survey = await Surveys.findOneAsync({ _id: surveyId });
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    // Check if user has permission to modify this survey (must be owner or admin)
    if (survey.createdBy !== this.userId) {
      // Check if user is an admin
      const user = await Meteor.users.findOneAsync(this.userId);
      if (!user?.roles?.includes('admin')) {
        throw new Meteor.Error('not-authorized', 'Only the survey owner or an admin can remove collaborators');
      }
    }
    
    // Check if the collaborator exists in the survey
    if (!survey.collaborators?.some(c => c.userId === collaboratorId)) {
      throw new Meteor.Error('not-found', 'Collaborator not found in this survey');
    }
    
    // Remove the collaborator from the survey
    await Surveys.updateAsync(
      { _id: surveyId },
      { 
        $pull: { collaborators: { userId: collaboratorId } },
        $set: { updatedAt: new Date() }
      }
    );
    
    // Return the updated survey
    return await Surveys.findOneAsync({ _id: surveyId });
  },
  
  /**
   * Get all collaborators for a survey
   * @param surveyId - The ID of the survey to get collaborators for
   * @returns Array of collaborators
   */
  async 'surveys.getCollaborators'(surveyId: string) {
    check(surveyId, String);
    
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to view collaborators');
    }
    
    // Find the survey
    const survey = await Surveys.findOneAsync({ _id: surveyId });
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    // Check if user has permission to view this survey (must be owner, collaborator, or admin)
    const isOwner = survey.createdBy === this.userId;
    const isCollaborator = survey.collaborators?.some(c => c.userId === this.userId);
    
    if (!isOwner && !isCollaborator) {
      // Check if user is an admin
      const user = await Meteor.users.findOneAsync(this.userId);
      if (!user?.roles?.includes('admin')) {
        throw new Meteor.Error('not-authorized', 'You do not have permission to view this survey\'s collaborators');
      }
    }
    
    // Return the collaborators array or an empty array if none
    return survey.collaborators || [];
  },

  // Get total count of surveys for pagination
  async 'surveys.getTotalCount'() {
    // Check if user is logged in
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to get survey count');
    }
    
    // Count surveys where the user is either the owner or a collaborator
    const totalCount = await Surveys.find({
      $or: [
        { createdBy: this.userId },
        { 'collaborators.userId': this.userId }
      ]
    }).countAsync();
    
    return totalCount;
  },
});

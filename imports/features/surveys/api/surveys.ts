import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { check } from 'meteor/check';

// Extend the User type to include roles
declare module 'meteor/meteor' {
  namespace Meteor {
    interface User {
      roles?: string[];
    }
  }
}

export interface SurveyDoc {
  _id?: string;
  title: string;
  description: string;
  logo?: string;
  image?: string;
  color?: string;
  selectedQuestions: Record<string, any>;
  siteTextQuestions: Array<any>;
  siteTextQForm: any;
  selectedDemographics: string[];
  selectedTheme?: string;
  selectedCategories?: string[];
  selectedTags?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  published: boolean;
  shareToken?: string;
  organizationId?: string;
  startDate?: Date;
  endDate?: Date;
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
    priority: number;
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

// Re-export for backward compatibility
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
    
    // If no shareToken and not the creator or admin, don't return anything
    if (!this.userId || 
        (surveyDoc.createdBy !== this.userId && 
         !(await Meteor.users.findOneAsync(this.userId))?.roles?.includes('admin'))) {
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
    if (survey.createdBy !== this.userId && !(await Meteor.users.findOneAsync(this.userId))?.roles?.includes('admin')) {
      throw new Meteor.Error('Not authorized');
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
      return await Surveys.insertAsync(doc);
    }
  },

  // Publish survey and generate shareable token
  async 'surveys.publish'(survey: Partial<SurveyDoc>) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    const now = new Date();

    // Fetch the existing survey from the DB
    const existingRaw = survey._id && await Surveys.findOneAsync(survey._id);
    const existing: SurveyDoc | undefined = (typeof existingRaw === 'object' && existingRaw !== null ? existingRaw as SurveyDoc : undefined);

    // If already published and has a shareToken, just return it
    if (existing && existing.published && existing.shareToken) {
      return { _id: existing._id, shareToken: existing.shareToken };
    }

    // If not, generate a new token if needed
    const shareToken = existing?.shareToken || Random.id(12);

    if (survey._id) {
      await Surveys.updateAsync(survey._id, {
        $set: {
          title: survey.title || (existing ? existing.title : ''),
          description: survey.description || (existing ? existing.description : ''),
          logo: survey.logo ?? (existing ? existing.logo : undefined),
          image: survey.image ?? (existing ? existing.image : undefined),
          color: survey.color ?? (existing ? existing.color : undefined),
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
          selectedTheme: survey.selectedTheme ?? (existing ? existing.selectedTheme : undefined),
          selectedCategories: survey.selectedCategories || (existing ? existing.selectedCategories : []),
          selectedTags: survey.selectedTags || (existing ? existing.selectedTags : []),
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
    return await Surveys.removeAsync(surveyId);
  },

  // Update an existing survey with all data including sections and questions
  async 'surveys.update'(surveyId: string, survey: Partial<SurveyDoc>) {
    check(surveyId, String);
    
    if (!this.userId) throw new Meteor.Error('Not authorized');
    
    // Validate the survey exists and user has permission
    const existingSurvey = await Surveys.findOneAsync(surveyId);
    if (!existingSurvey) throw new Meteor.Error('Survey not found');
    
    // Check if user is admin or survey creator
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user?.roles?.includes('admin') && existingSurvey.createdBy !== this.userId) {
      throw new Meteor.Error('Not authorized to update this survey');
    }
    
    const now = new Date();
    
    await Surveys.updateAsync(surveyId, {
      $set: {
        title: survey.title || existingSurvey.title,
        description: survey.description || existingSurvey.description,
        logo: survey.logo !== undefined ? survey.logo : existingSurvey.logo,
        image: survey.image !== undefined ? survey.image : existingSurvey.image,
        color: survey.color !== undefined ? survey.color : existingSurvey.color,
        selectedQuestions: survey.selectedQuestions || existingSurvey.selectedQuestions || {},
        siteTextQuestions: survey.siteTextQuestions || existingSurvey.siteTextQuestions || [],
        siteTextQForm: survey.siteTextQForm || existingSurvey.siteTextQForm || {},
        selectedDemographics: survey.selectedDemographics || existingSurvey.selectedDemographics || [],
        // Include survey sections and section questions
        surveySections: survey.surveySections || existingSurvey.surveySections || [],
        sectionQuestions: survey.sectionQuestions || existingSurvey.sectionQuestions || [],
        // Include default settings
        defaultSettings: survey.defaultSettings || existingSurvey.defaultSettings || {},
        // Include themes, categories, and tags
        selectedTheme: survey.selectedTheme !== undefined ? survey.selectedTheme : existingSurvey.selectedTheme,
        selectedCategories: survey.selectedCategories || existingSurvey.selectedCategories || [],
        selectedTags: survey.selectedTags || existingSurvey.selectedTags || [],
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
});

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { SurveyInvitations } from './surveyInvitations';
import { EmailTemplates } from './emailTemplates';
import { Surveys } from './surveys';

// For the counts publication
declare const Counts: any;

// Debug log to check if collections are defined
console.log('SurveyInvitations collection exists:', !!SurveyInvitations);
console.log('EmailTemplates collection exists:', !!EmailTemplates);
console.log('Surveys collection exists:', !!Surveys);

// =====================
// METHODS
// =====================

Meteor.methods({
  /**
   * Send invitations to participate in a survey
   * @param surveyId - The ID of the survey
   * @param emails - Array of email addresses to invite
   * @returns Object with success status and count of invitations sent
   */
  async 'surveys.sendInvitations'(surveyId, emails) {
    try {
      // Basic validation
      check(surveyId, String);
      check(emails, [String]);
      
      console.log('User ID:', this.userId);
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to send invitations');
      }
      
      console.log(`Processing ${emails.length} invitations for survey ${surveyId}`);
      
      // Use all emails without validation
      const validEmails = emails;
      
      console.log('Emails to process:', validEmails);
      
      const now = new Date();
      const invitationIds = [];
      
      // Process each email
      for (const email of validEmails) {
        try {
            console.log(`valid email: ${email}`);
          // Check if invitation already exists - using async version for server
          const existingInvitation = await SurveyInvitations.findOneAsync({
            surveyId,
            recipientEmail: email,
            status: { $in: ['pending', 'sent'] }
          });
          
          let invitationId;
          
          if (existingInvitation && existingInvitation._id) {
            // Update existing invitation
            await SurveyInvitations.updateAsync(existingInvitation._id, {
              $set: {
                status: 'sent',
                sentAt: now,
                sentBy: this.userId
              }
            });
            invitationId = existingInvitation._id;
            console.log(`Updated existing invitation for ${email}`);
          } else {
            // Create new invitation
            const newInvitation = {
              _id: Random.id(),
              surveyId,
              recipientEmail: email,
              status: 'sent' as 'sent', // Type assertion to match the union type
              sentAt: now,
              sentBy: this.userId
            };
            
            invitationId = await SurveyInvitations.insertAsync(newInvitation);
            console.log(`Created new invitation for ${email} with ID: ${invitationId}`);
          }
          
          if (invitationId) {
            invitationIds.push(invitationId);
          }
        } catch (err) {
          console.error(`Error processing invitation for ${email}:`, err);
        }
      }
      
      console.log(`Successfully processed ${invitationIds.length} invitations`);
      
      return {
        success: true,
        count: invitationIds.length
      };
    } catch (error) {
      console.error('Error in surveys.sendInvitations:', error);
      throw error;
    }
  },
  
  /**
   * Save an email template for a survey
   */
  async 'surveys.saveEmailTemplate'(surveyId, type, subject, body) {
    try {
      check(surveyId, String);
      check(type, String);
      check(subject, String);
      check(body, String);
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized');
      }
      
      const now = new Date();
      const templateType = type as 'invitation' | 'reminder';
      
      // Check if template exists
      const existingTemplate = await EmailTemplates.findOneAsync({
        surveyId,
        type: templateType
      });
      
      if (existingTemplate && existingTemplate._id) {
        // Update existing template
        await EmailTemplates.updateAsync(existingTemplate._id, {
          $set: {
            subject,
            body,
            updatedAt: now
          }
        });
        return existingTemplate._id;
      } else {
        // Create new template
        return await EmailTemplates.insertAsync({
          surveyId,
          type: templateType,
          subject,
          body,
          createdAt: now,
          updatedAt: now,
          createdBy: this.userId
        });
      }
    } catch (error) {
      console.error('Error in surveys.saveEmailTemplate:', error);
      throw error;
    }
  },
  
  /**
   * Get a survey by ID
   */
  async 'surveys.getById'(surveyId) {
    check(surveyId, String);
    
    console.log('Looking for survey with ID:', surveyId);
    
    try {
      // Try to find the survey
      const survey = await Surveys.findOneAsync(surveyId);
      console.log('Survey found:', survey ? 'Yes' : 'No');
      return survey;
    } catch (error) {
      console.error('Error finding survey:', error);
      return null;
    }
  },
  
  /**
   * Resend an invitation
   */
  async 'surveys.resendInvitation'(invitationId) {
    check(invitationId, String);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    const invitation = await SurveyInvitations.findOneAsync(invitationId);
    if (!invitation) {
      throw new Meteor.Error('not-found', 'Invitation not found');
    }
    
    // In a real implementation, this would resend the email
    // For now, we'll just update the status and timestamp
    await SurveyInvitations.updateAsync(invitationId, {
      $set: {
        status: 'sent' as 'sent',
        sentAt: new Date(),
        sentBy: this.userId
      }
    });
    
    return {
      success: true
    };
  }
});

// =====================
// PUBLICATIONS
// =====================

if (Meteor.isServer) {
  Meteor.publish('survey.invitations', function(surveyId, options = {}) {
    if (!this.userId) {
      return this.ready();
    }
    
    const { limit = 20, skip = 0 } = options;
    
    return SurveyInvitations.find(
      { surveyId },
      { 
        sort: { sentAt: -1 },
        limit,
        skip
      }
    );
  });

  // Publish count of invitations for pagination
  Meteor.publish('counts.surveyInvitations', function(surveyId) {
    if (!this.userId) {
      return this.ready();
    }
    
    Counts.publish(this, `count.surveyInvitations.${surveyId}`, SurveyInvitations.find({ surveyId }));
  });

  Meteor.publish('survey.emailTemplates', function(surveyId) {
    if (!this.userId) {
      return this.ready();
    }
    
    return EmailTemplates.find({ surveyId });
  });
}

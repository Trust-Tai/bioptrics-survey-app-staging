import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { SurveyInvitations } from './surveyInvitations';
import { EmailTemplates } from './emailTemplates';
import { EmailLogs } from './emailLogs';
import { Surveys } from './surveys';
import { sendEmail, processTemplate } from '../services/emailService';
import { generatePublicSurveyUrl } from '../utils/urlUtils';
import { sleep } from '../utils/emailUtils';

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
   * @param testMode - Whether to use test mode (default: true)
   * @returns Object with success status and count of invitations sent
   */
  async 'surveys.sendInvitations'(surveyId, emails, testMode = true) {
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
      
      // Get the survey details for template variables
      const survey = await Surveys.findOneAsync(surveyId);
      if (!survey) {
        throw new Meteor.Error('not-found', 'Survey not found');
      }
      
      // Get the email template
      const emailTemplate = await EmailTemplates.findOneAsync({
        surveyId,
        type: 'invitation'
      });
      
      if (!emailTemplate) {
        console.log('No email template found, using default template');
      }
      
      // Default template if none exists
      const defaultSubject = `You've been invited to participate in: ${survey.title || 'a survey'}`;
      const defaultTemplate = `
        <p>Hello,</p>
        <p>You have been invited to participate in the survey: <strong>{{surveyTitle}}</strong>.</p>
        <p>Click the link below to access the survey:</p>
        <p><a href="{{surveyLink}}">{{surveyLink}}</a></p>
        <p>Thank you,<br>The Survey Team</p>
      `;
      
      const now = new Date();
      const invitationIds = [];
      const emailsSent = [];
      
      // Process each email with rate limiting
      for (let i = 0; i < validEmails.length; i++) {
        const email = validEmails[i];
        
        // Calculate progress percentage
        const progress = Math.round(((i + 1) / validEmails.length) * 100);
        try {
            console.log(`valid email: ${email}`);
          // Check if invitation already exists - using async version for server
          const existingInvitation = await SurveyInvitations.findOneAsync({
            surveyId,
            recipientEmail: email,
            status: { $in: ['pending', 'sent'] }
          });
          
          // Generate a unique token for this invitation
          const token = Random.id(32);
          // Use the public URL format with encoded survey ID
          const publicPath = generatePublicSurveyUrl(surveyId);
          const surveyUrl = Meteor.absoluteUrl(publicPath);
          
          // Prepare invitation record
          let invitationId: string;
          let isNewInvitation = false;
          
          if (existingInvitation && existingInvitation._id) {
            // Update existing invitation
            await SurveyInvitations.updateAsync(existingInvitation._id, {
              $set: {
                status: 'sent',
                sentAt: now,
                sentBy: this.userId,
                token: token
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
              sentBy: this.userId,
              token: token
            };
            
            invitationId = await SurveyInvitations.insertAsync(newInvitation);
            isNewInvitation = true;
            console.log(`Created new invitation for ${email} with ID: ${invitationId}`);
          }
          
          // Only send email if not in test mode or explicitly requested
          if (!testMode) {
            try {
              // Add a delay between email sends to avoid rate limiting
              // Only add delay if this is not the first email
              if (i > 0) {
                console.log(`Adding delay of 2 seconds before sending email to ${email}`);
                await sleep(2000); // 2 second delay between emails
              }
              // Prepare email variables
              const variables = {
                recipientName: email.split('@')[0], // Simple name extraction
                surveyTitle: survey.title || 'Survey',
                surveyLink: surveyUrl,
                senderName: 'Survey Team' // Could be replaced with actual user name
              };
              
              // Use template from database or default
              const subject = emailTemplate?.subject || defaultSubject;
              const htmlContent = emailTemplate?.body || defaultTemplate;
              
              // Send the email
              const emailResult = await sendEmail(
                email,
                subject,
                htmlContent,
                variables
              );
              
              // Log the email sending
              await EmailLogs.insertAsync({
                invitationId,
                surveyId,
                recipientEmail: email,
                subject: processTemplate(subject, variables),
                sentAt: now,
                status: 'success',
                messageId: emailResult.messageId,
                sentBy: this.userId
              });
              
              emailsSent.push(email);
              console.log(`Email sent successfully to ${email}`);
            } catch (err: any) {
              // Log the error but continue with other emails
              console.error(`Failed to send email to ${email}:`, err);
              
              // Log the failure
              await EmailLogs.insertAsync({
                invitationId,
                surveyId,
                recipientEmail: email,
                subject: emailTemplate?.subject || defaultSubject,
                sentAt: now,
                status: 'failed',
                errorMessage: err.message || 'Unknown error',
                sentBy: this.userId
              });
            }
          } else {
            console.log(`Test mode: Email would be sent to ${email}`);
          }
          
          if (invitationId) {
            invitationIds.push(invitationId);
          }
        } catch (err: any) {
          console.error(`Error processing invitation for ${email}:`, err);
        }
      }
      
      console.log(`Successfully processed ${validEmails.length} invitations`);
      
      return {
        count: validEmails.length,
        emailsSent: emailsSent.length,
        testMode,
        progress: 100 // Final progress is 100%
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
   * @param invitationId - The ID of the invitation to resend
   * @param testMode - Whether to use test mode (default: true)
   * @returns Object with success status
   */
  async 'surveys.resendInvitation'(invitationId, testMode = true) {
    check(invitationId, String);
    check(testMode, Boolean);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    
    const invitation = await SurveyInvitations.findOneAsync(invitationId);
    if (!invitation) {
      throw new Meteor.Error('not-found', 'Invitation not found');
    }
    
    // Get the survey details
    const survey = await Surveys.findOneAsync(invitation.surveyId);
    if (!survey) {
      throw new Meteor.Error('not-found', 'Survey not found');
    }
    
    // Get the email template
    const emailTemplate = await EmailTemplates.findOneAsync({
      surveyId: invitation.surveyId,
      type: 'invitation'
    });
    
    // Default template if none exists
    const defaultSubject = `You've been invited to participate in: ${survey.title || 'a survey'}`;
    const defaultTemplate = `
      <p>Hello,</p>
      <p>You have been invited to participate in the survey: <strong>{{surveyTitle}}</strong>.</p>
      <p>Click the link below to access the survey:</p>
      <p><a href="{{surveyLink}}">{{surveyLink}}</a></p>
      <p>Thank you,<br>The Survey Team</p>
    `;
    
    // Generate or use existing token
    const token = invitation.token || Random.id(32);
    // Use the public URL format with encoded survey ID
    const publicPath = generatePublicSurveyUrl(invitation.surveyId);
    const surveyUrl = Meteor.absoluteUrl(publicPath);
    
    // Update the invitation
    const now = new Date();
    await SurveyInvitations.updateAsync(invitationId, {
      $set: {
        status: 'sent' as 'sent',
        sentAt: now,
        sentBy: this.userId,
        token: token
      }
    });
    
    // Only send email if not in test mode
    let emailSent = false;
    let emailError = null;
    
    if (!testMode) {
      try {
        // Add a small delay before sending to avoid rate limiting
        console.log(`Adding delay of 1 second before resending email to ${invitation.recipientEmail}`);
        await sleep(1000); // 1 second delay
        // Prepare email variables
        const variables = {
          recipientName: invitation.recipientEmail.split('@')[0], // Simple name extraction
          surveyTitle: survey.title || 'Survey',
          surveyLink: surveyUrl,
          senderName: 'Survey Team' // Could be replaced with actual user name
        };
        
        // Use template from database or default
        const subject = emailTemplate?.subject || defaultSubject;
        const htmlContent = emailTemplate?.body || defaultTemplate;
        
        // Send the email
        const emailResult = await sendEmail(
          invitation.recipientEmail,
          subject,
          htmlContent,
          variables
        );
        
        // Log the email sending
        await EmailLogs.insertAsync({
          invitationId,
          surveyId: invitation.surveyId,
          recipientEmail: invitation.recipientEmail,
          subject: processTemplate(subject, variables),
          sentAt: now,
          status: 'success',
          messageId: emailResult.messageId,
          sentBy: this.userId
        });
        
        emailSent = true;
        console.log(`Email resent successfully to ${invitation.recipientEmail}`);
      } catch (err: any) {
        // Log the error
        console.error(`Failed to resend email to ${invitation.recipientEmail}:`, err);
        emailError = err.message || 'Unknown error';
        
        // Log the failure
        await EmailLogs.insertAsync({
          invitationId,
          surveyId: invitation.surveyId,
          recipientEmail: invitation.recipientEmail,
          subject: emailTemplate?.subject || defaultSubject,
          sentAt: now,
          status: 'failed',
          errorMessage: emailError,
          sentBy: this.userId
        });
      }
    } else {
      console.log(`Test mode: Email would be resent to ${invitation.recipientEmail}`);
    }
    
    return {
      success: true,
      emailSent,
      testMode,
      emailError
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
  
  // Publish email logs for a survey
  Meteor.publish('survey.emailLogs', function(surveyId, options = {}) {
    if (!this.userId) {
      return this.ready();
    }
    
    const { limit = 20, skip = 0 } = options;
    
    return EmailLogs.find(
      { surveyId },
      { 
        sort: { sentAt: -1 },
        limit,
        skip
      }
    );
  });
  
  // Publish email logs for a specific invitation
  Meteor.publish('invitation.emailLogs', function(invitationId) {
    if (!this.userId) {
      return this.ready();
    }
    
    return EmailLogs.find({ invitationId });
  });
}

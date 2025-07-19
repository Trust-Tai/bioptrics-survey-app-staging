import { Meteor } from 'meteor/meteor';
import nodemailer from 'nodemailer';

/**
 * Email service for sending notifications
 * This is a simple implementation using nodemailer
 */

// Create a transporter using the default SMTP transport
let transporter: nodemailer.Transporter;

// Initialize the transporter based on environment
Meteor.startup(() => {
  // In production, you would use actual SMTP credentials
  if (Meteor.isProduction) {
    // Example for production environment
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.example.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER || 'user@example.com',
        pass: process.env.MAIL_PASSWORD || 'password',
      },
    });
  } else {
    // For development/testing, use Ethereal (fake SMTP service)
    // This will log the preview URL instead of actually sending emails
    nodemailer.createTestAccount().then((testAccount) => {
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      
      console.log('Ethereal email test account created for development');
    }).catch(error => {
      console.error('Failed to create test email account:', error);
    });
  }
});

/**
 * Send an email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content of the email
 * @returns Promise with info about the sent message
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!transporter) {
    console.error('Email transporter not initialized');
    throw new Error('Email service not available');
  }
  
  const mailOptions = {
    from: process.env.MAIL_FROM || '"Bioptrics Survey App" <surveys@bioptrics.com>',
    to,
    subject,
    html,
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    
    // Log preview URL in development
    if (!Meteor.isProduction && info.messageId) {
      console.log('Email preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send a collaborator invitation email
 * @param to - Recipient email address
 * @param surveyTitle - Title of the survey
 * @param inviterName - Name of the person who sent the invitation
 * @param role - Role assigned to the collaborator
 * @param surveyId - ID of the survey
 */
export const sendCollaboratorInvitation = async (
  to: string, 
  surveyTitle: string, 
  inviterName: string, 
  role: string,
  surveyId: string
) => {
  const subject = `You've been added as a collaborator on "${surveyTitle}"`;
  
  // Create dashboard URL for the survey
  const baseUrl = Meteor.absoluteUrl().replace(/\/$/, '');
  const surveyUrl = `${baseUrl}/admin/survey/${surveyId}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Survey Collaboration Invitation</h2>
      <p>Hello,</p>
      <p>${inviterName} has added you as a collaborator with <strong>${role}</strong> role on the survey: <strong>${surveyTitle}</strong>.</p>
      
      <div style="margin: 20px 0;">
        <p><strong>What this means:</strong></p>
        <ul>
          ${role === 'editor' ? `
            <li>You can edit the survey content and questions</li>
            <li>You can preview the survey</li>
            <li>You can publish the survey</li>
          ` : `
            <li>You can preview the survey</li>
            <li>You can view survey responses</li>
            <li>You cannot edit or publish the survey</li>
          `}
        </ul>
      </div>
      
      <p>You can access the survey by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${surveyUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          View Survey
        </a>
      </div>
      
      <p>If you have any questions, please contact ${inviterName} directly.</p>
      
      <p>Thank you,<br>The Bioptrics Survey Team</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </div>
  `;
  
  return await sendEmail(to, subject, html);
};

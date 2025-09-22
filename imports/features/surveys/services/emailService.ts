import { Meteor } from 'meteor/meteor';
import nodemailer from 'nodemailer';
import { Email } from 'meteor/email';

// Create a transporter with Mailtrap SMTP credentials
export const createTransporter = () => {
  // Check if we have settings, otherwise use defaults for development
  const settings = Meteor.settings?.private?.mailtrap || {
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    user: process.env.MAILTRAP_USER || 'default_user',
    pass: process.env.MAILTRAP_PASS || 'default_pass'
  };

  // Using Mailtrap SMTP credentials
  return nodemailer.createTransport({
    host: settings.host || 'sandbox.smtp.mailtrap.io',
    port: settings.port || 2525,
    auth: {
      user: settings.user,
      pass: settings.pass
    }
  });
};

// Process template variables
export const processTemplate = (template: string, variables: Record<string, string>) => {
  let processedTemplate = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, value || '');
  });
  
  return processedTemplate;
};

// Send email function
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  variables: Record<string, string>
) => {
  try {
    const transporter = createTransporter();
    const processedHtml = processTemplate(html, variables);
    const processedSubject = processTemplate(subject, variables);
    
    const settings = Meteor.settings?.private?.mailtrap || {};
    const from = settings.from || 
      process.env.EMAIL_FROM || 
      '"Survey Team" <surveys@bioptrics.com>';
    
    console.log(`Sending email to ${to} with subject: ${processedSubject}`);
    
    // Prepare email options
    const mailOptions = {
      from,
      to,
      subject: processedSubject,
      html: processedHtml
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', result);
    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Meteor.Error('email-send-failed', `Failed to send email: ${error.message || 'Unknown error'}`);
  }
};

// Fallback to Meteor's Email package if nodemailer fails
export const sendEmailFallback = (
  to: string,
  subject: string,
  html: string,
  variables: Record<string, string>
) => {
  try {
    const processedHtml = processTemplate(html, variables);
    const processedSubject = processTemplate(subject, variables);
    
    const settings = Meteor.settings?.private?.mailtrap || {};
    const from = settings.from || 
      process.env.EMAIL_FROM || 
      '"Survey Team" <surveys@bioptrics.com>';
    
    Email.send({
      to,
      from,
      subject: processedSubject,
      html: processedHtml
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email with fallback method:', error);
    throw new Meteor.Error('email-send-failed', `Failed to send email: ${error.message || 'Unknown error'}`);
  }
};

import { Meteor } from 'meteor/meteor';
import nodemailer from 'nodemailer';
import { Email } from 'meteor/email';

// Create a transporter with SMTP credentials
export const createTransporter = () => {
  // First check environment variables, then settings file, then defaults
  console.log('Email settings from file:', JSON.stringify(Meteor.settings?.private?.email));
  
  const settings = {
    host: process.env.SMTP_EMAIL_HOST || Meteor.settings?.private?.email?.host || 'smtp.example.com',
    port: parseInt(process.env.SMTP_EMAIL_PORT || '') || Meteor.settings?.private?.email?.port || 587,
    user: process.env.SMTP_EMAIL_USER || Meteor.settings?.private?.email?.user || 'default_user',
    pass: process.env.SMTP_EMAIL_PASSWORD || Meteor.settings?.private?.email?.pass || 'default_pass'
  };
  
  console.log('Using email settings - Host:', settings.host, 'Port:', settings.port);

  // Create email transport configuration
  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
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
    
    // Get from address from environment variables first, then settings file, then default
    const from = process.env.SMTP_EMAIL_FROM || 
      Meteor.settings?.private?.email?.from || 
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
    
    // Get from address from environment variables first, then settings file, then default
    const from = process.env.SMTP_EMAIL_FROM || 
      Meteor.settings?.private?.email?.from || 
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

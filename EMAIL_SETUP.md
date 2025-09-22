# Email Sending Setup for Survey Invitations

This document explains how to set up and use the email sending functionality for survey invitations.

## Overview

The survey application now supports sending email invitations to participants. This is implemented using:

1. **Mailtrap** for testing emails in development
2. **Nodemailer** for sending emails
3. **Meteor's Email package** as a fallback

## Setup Instructions

### 1. Install Required Packages

The following packages are required:

```bash
meteor add email
meteor npm install --save nodemailer
```

### 2. Configure Mailtrap

1. Create a free account at [Mailtrap.io](https://mailtrap.io)
2. Get your SMTP credentials from your Mailtrap inbox (Integration > SMTP)
3. Create or update your settings file with the credentials:

```json
{
  "private": {
    "mailtrap": {
      "host": "sandbox.smtp.mailtrap.io",
      "port": 2525,
      "user": "YOUR_MAILTRAP_USERNAME",
      "pass": "YOUR_MAILTRAP_PASSWORD",
      "from": "Survey Team <your-email@example.com>"
    }
  }
}
```

### 3. Run the Application with Settings

```bash
meteor run --settings settings.mailtrap.json
```

## Using the Email Functionality

### Sending Invitations

1. Navigate to a survey
2. Click the "Share" button
3. Enter email addresses (one per line)
4. Toggle "Test Mode" if you want to send actual emails
5. Click "Send Invites"

### Test Mode

- When Test Mode is enabled (default), no actual emails are sent
- The system still creates invitation records in the database
- Disable Test Mode to send actual emails through Mailtrap

### Email Templates

1. Go to the "Email" tab in the Share modal
2. Customize the email subject and body
3. Use template variables:
   - `{{recipientName}}` - Recipient's name (extracted from email)
   - `{{surveyTitle}}` - Title of the survey
   - `{{surveyLink}}` - Link to access the survey (using the public URL format: `/public/[encoded-survey-id]`)
   - `{{senderName}}` - Name of the sender

## Monitoring Email Sending

### In Development

1. Check your Mailtrap inbox to see sent emails
2. Look at the console logs for email sending status
3. Check the EmailLogs collection in the database

### Troubleshooting

If emails are not being sent:

1. Verify Mailtrap credentials are correct
2. Check that Test Mode is disabled
3. Look for error messages in the console
4. Check the EmailLogs collection for failure records

### Rate Limiting

Mailtrap's free plan has rate limits on how many emails you can send per second. The application includes built-in rate limiting that adds a 2-second delay between emails when sending to multiple recipients. This helps avoid the "Too many emails per second" error.

If you're still encountering rate limit errors:

1. Send to fewer recipients at once
2. Increase the delay between emails in `surveyInvitationAPI.ts`
3. Consider upgrading your Mailtrap plan for higher limits

## Production Deployment

For production deployment, you'll need to:

1. Replace Mailtrap with a production email service (SendGrid, Amazon SES, etc.)
2. Update the settings file with production credentials
3. Deploy with the updated settings

```bash
meteor deploy --settings settings.production.json
```

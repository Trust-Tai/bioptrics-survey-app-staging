# Collaborator Import Reference

This document provides guidance on how to include collaborators in your survey import JSON files.

## Collaborator Format

When importing a survey, you can include collaborators in the JSON file using the following format:

```json
{
  "title": "Sample Survey with Collaborators",
  "description": "This is a sample survey that includes collaborators",
  "allowCollaboration": true,
  "collaborators": [
    {
      "email": "collaborator1@example.com",
      "name": "John Doe",
      "role": "editor"
    },
    {
      "email": "collaborator2@example.com",
      "name": "Jane Smith",
      "role": "viewer"
    }
  ],
  "sections": [
    // Survey sections here
  ],
  "questions": [
    // Survey questions here
  ]
}
```

## Collaborator Properties

Each collaborator object in the `collaborators` array should have the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `email` | String | Yes | The email address of the collaborator. If the user exists in the system, they will be added as a collaborator. If they don't exist and the importing user is an admin, a new user will be created. |
| `name` | String | No | The display name of the collaborator. If not provided, the system will use the user's profile name if they exist, or derive a name from their email address. |
| `role` | String | Yes | The role of the collaborator. Must be either `"editor"` or `"viewer"`. |

## Roles

- **Editor**: Can edit the survey content, questions, and settings
- **Viewer**: Can only view the survey but cannot make changes

## User Creation

When importing a survey with collaborators:

1. If the collaborator's email matches an existing user, that user will be added as a collaborator with the specified role.
2. If the collaborator's email doesn't match any existing user and the importing user is an admin, a new user will be created automatically:
   - The new user will receive an enrollment email to set their password
   - Their profile name will be derived from their email address
3. If the collaborator's email doesn't match any existing user and the importing user is not an admin, the collaborator will be skipped with a log message.

## Example

Here's a complete example of a minimal survey import with collaborators:

```json
{
  "title": "Feedback Survey",
  "description": "A simple feedback survey",
  "allowCollaboration": true,
  "collaborators": [
    {
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "editor"
    },
    {
      "email": "jane.smith@example.com",
      "name": "Jane Smith",
      "role": "viewer"
    }
  ],
  "sections": [
    {
      "id": "section1",
      "title": "Feedback Section"
    }
  ],
  "questions": [
    {
      "id": "q1",
      "sectionId": "section1",
      "text": "How would you rate our service?",
      "responseType": "rating",
      "required": true
    }
  ]
}
```

# Bioptrics Survey Application

## Project Structure

This project follows a modern, feature-based architecture for better organization and maintainability.

### Directory Structure

```
/new-gold-survey-development/
├── client/                      # Meteor client entry point
├── server/                      # Meteor server entry point
├── public/                      # Static assets
├── imports/
│   ├── features/                # Feature-based modules
│   │   ├── auth/                # Authentication feature
│   │   ├── surveys/             # Survey feature
│   │   ├── questions/           # Question feature
│   │   ├── organization/        # Organization feature
│   │   ├── users/               # User management feature
│   │   └── analytics/           # Analytics feature
│   ├── pages/                   # Page components
│   │   ├── admin/               # Admin pages
│   │   └── public/              # Public pages
│   ├── layouts/                 # Layout components
│   │   └── AdminLayout/         # Admin layout
│   └── shared/                  # Shared code
│       ├── components/          # Shared components
│       ├── hooks/               # Shared hooks
│       ├── utils/               # Utility functions
│       ├── contexts/            # Context providers
│       └── types/               # TypeScript type definitions
└── .meteor/                     # Meteor configuration
```

### Key Features

- **Multi-tenant architecture** supporting organizations with customizable elements
- **User roles** including Admin, Consultant, CEO, Department Head, and Anonymous Respondent
- **Customizable categories and tags** that can be assigned to questions or surveys
- **WPS Framework categories** for organizing questions
- **Survey Goals functionality** for defining objectives
- **Survey Themes** for grouping related questions
- **Organization settings** for customizing terminology and branding
- **Question bank** for reusing questions across surveys
- **Survey builder** with section management
- **Response collection and analytics**
- **Default settings configuration** for new surveys

### Import Structure

The new architecture uses barrel files (index.ts) to simplify imports. For example:

```typescript
// Import from a feature
import { SurveySections } from '/imports/features/surveys';

// Import from shared components
import { QuickActionsMenu } from '/imports/shared';

// Import a page component
import { AdminDashboard } from '/imports/pages';
```

## Development

### Running the Application

```bash
meteor run --settings settings.json
```

### Project Organization

Each feature contains:
- `api/` - Server-side code and data models
- `components/` - React components specific to the feature
- `hooks/` - Custom React hooks for the feature

Shared code that's used across features is in the `shared/` directory.

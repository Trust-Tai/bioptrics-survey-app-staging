# Migration Guide: Modern Project Structure

This guide explains the changes made to the project structure and provides instructions for continuing the migration process.

## Overview of Changes

The project has been restructured from a flat API/UI separation to a feature-based modular architecture. This approach:

1. Groups related code together by feature
2. Improves discoverability and maintainability
3. Creates clear boundaries between features
4. Simplifies imports with barrel files
5. Makes the codebase more scalable

## New Directory Structure

```
/new-gold-survey-development/
├── imports/
│   ├── app/                      # Main application entry point
│   ├── features/                 # Feature-based modules
│   │   ├── organization/         # Organization settings feature
│   │   │   ├── api/              # Server-side code
│   │   │   ├── components/       # React components
│   │   │   └── contexts/         # Context providers
│   │   ├── surveys/              # Survey feature
│   │   ├── questions/            # Question feature
│   │   ├── auth/                 # Authentication feature
│   │   ├── users/                # User management feature
│   │   └── analytics/            # Analytics feature
│   ├── pages/                    # Page components
│   │   ├── admin/                # Admin pages
│   │   └── public/               # Public pages
│   ├── layouts/                  # Layout components
│   │   └── AdminLayout/          # Admin layout
│   └── shared/                   # Shared code
│       ├── components/           # Shared components
│       ├── hooks/                # Shared hooks
│       ├── utils/                # Utility functions
│       ├── contexts/             # Context providers
│       └── types/                # TypeScript type definitions
└── client/                       # Meteor client entry point
```

## What Has Been Migrated

So far, the following components have been migrated to the new structure:

1. **Organization Feature**
   - OrganizationSettings API
   - OrganizationContext
   - OrgSetup component

2. **Surveys Feature**
   - Surveys API
   - SurveyResponses API
   - SurveyThemes API
   - SurveySections component
   - SurveyBuilder component
   - SurveyManagementDashboard component

3. **Questions Feature**
   - Questions API
   - QuestionOrganizer component
   - QuestionAssignment component
   - QuestionBank component

4. **Shared Components**
   - QuickActionsMenu

5. **Pages**
   - AdminDashboard
   - PublicSurveyPage

6. **Layouts**
   - AdminLayout

7. **App Entry Point**
   - App.tsx moved to imports/app/

## Continuing the Migration

To continue the migration process:

1. **Move API Files**:
   - Move remaining API files from `/imports/api/` to their respective feature directories
   - Update imports in the moved files to use the new paths

2. **Move UI Components**:
   - Move components from `/imports/ui/` to their respective feature directories
   - Group related components together in the same feature
   - Update imports to use the new paths

3. **Update Imports**:
   - Use barrel files (index.ts) to simplify imports
   - Example: `import { SurveyBuilder } from '/imports/features/surveys';`

4. **Create Feature-Specific Hooks**:
   - Move hooks to their respective feature directories
   - Create new hooks for feature-specific functionality

5. **Implement Proper Type Sharing**:
   - Move type definitions to their respective feature directories
   - Share common types through the shared/types directory

## Best Practices

1. **Feature Boundaries**:
   - Keep feature code self-contained
   - Minimize dependencies between features
   - Use shared components for code reuse

2. **Barrel Files**:
   - Use index.ts files to export public API of each module
   - Only export what should be used by other modules

3. **Component Organization**:
   - Group components by feature, not by type
   - Keep related components together

4. **Import Paths**:
   - Use absolute imports for clarity
   - Example: `import { OrganizationProvider } from '/imports/features/organization';`

## Testing the Migration

As you continue the migration:

1. Test the application frequently to ensure it still works
2. Fix import paths as you move files
3. Update any references to moved components
4. Ensure that Meteor publications and methods still work correctly

## Rollback Plan

If you encounter issues:

1. The original files are still in their original locations
2. You can revert to using the original paths in client/main.jsx
3. The new structure is additive, not destructive

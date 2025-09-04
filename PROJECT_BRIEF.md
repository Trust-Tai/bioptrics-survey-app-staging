# Trust-Tai Survey Platform - Developer Project Brief

## Project Overview

Trust-Tai Survey Platform is an enterprise-grade survey management system built with MeteorJS, React 18, and TypeScript. The platform specializes in workplace safety assessments through the Whole Person Safety (WPS) Builder system while maintaining comprehensive general survey capabilities.

## Technology Stack

### Core Framework
- **MeteorJS**: Full-stack JavaScript framework with real-time data synchronization
- **React 18**: Modern UI library with hooks and concurrent features
- **TypeScript**: Type-safe JavaScript with comprehensive interface definitions
- **MongoDB**: Document database with Meteor collections and reactive subscriptions

### UI & Styling
- **React Bootstrap**: Component library for consistent UI
- **Styled-components**: CSS-in-JS with theme support
- **CSS Custom Properties**: Dynamic theming system
- **React Router**: Client-side routing
- **React DnD**: Drag-and-drop functionality

### Additional Libraries
- **React Quill**: Rich text editor
- **Recharts & Chart.js**: Data visualization
- **React Icons**: Icon library
- **Meteor Methods**: Server-side API endpoints

## Project Structure

```
/
├── .meteor/                    # Meteor configuration
├── client/                     # Client-side assets and styles
├── imports/
│   ├── api/                   # Server-side API methods and publications
│   │   ├── wpsQuestionBank.js # 6,017 WPS safety questions
│   │   └── wpsSurveyTemplate.json
│   ├── contexts/              # React contexts (ThemeContext)
│   ├── features/              # Feature-based modules
│   │   ├── surveys/          # Survey management
│   │   ├── questions/        # Question management
│   │   ├── analytics/        # Analytics and reporting
│   │   ├── organization/     # Multi-tenancy
│   │   ├── auth/            # Authentication
│   │   ├── users/           # User management
│   │   └── survey-themes/   # Theming system
│   ├── layouts/             # Page layouts (AdminLayout, PublicLayout)
│   ├── pages/               # Route components
│   ├── ui/                  # UI components
│   │   ├── admin/          # Admin interface components
│   │   └── wps/            # WPS Builder components
│   ├── utils/              # Utility functions
│   └── shared/             # Common utilities
├── public/                 # Static assets
├── server/                 # Server entry point
└── tests/                  # Test files
```

## Core Features

### 1. Survey Management System

#### Enhanced Survey Builder (`imports/features/surveys/components/EnhancedSurveyBuilder.tsx`)
- **6,683 lines** of comprehensive survey creation functionality
- **7 Active Tabs**: Survey Basics, Questions, Appearance, Responses, Analyze Results, Collaboration, Settings
- **Multi-step Wizard**: Complete survey creation workflow
- **Section Management**: Create, edit, delete, and reorder survey sections
- **Drag-and-Drop**: Native HTML5 DnD for question/section organization
- **Real-time Preview**: Live survey preview with theme application
- **Save/Publish Workflow**: Manual save system with encrypted token generation

#### Survey Data Model
```typescript
interface SurveyDoc {
  title: string;
  description: string;
  selectedQuestions: Record<string, any>;
  sectionQuestions: Array<QuestionItem>;
  surveySections: Array<SectionItem>;
  selectedTheme?: string;
  collaborators?: Collaborator[];
  branchingLogic?: BranchingRules;
  defaultSettings: SurveySettings;
  status: 'active' | 'draft' | 'inactive';
  published: boolean;
  shareToken?: string;
}
```

### 2. Question Management System

#### Enhanced Question Builder (`imports/features/questions/components/EnhancedQuestionBuilder.tsx`)
- **Versioned Questions**: Complete version history with revert capability
- **Rich Question Types**: Text, multiple choice, rating scales, file uploads
- **Question Bank Integration**: Reusable question library
- **Advanced Features**: Branching logic, assessment scoring, custom fields
- **Import System**: Support for DOCX, CSV, Excel, JSON imports

#### Question Data Model
```typescript
interface QuestionDoc {
  currentVersion: number;
  versions: QuestionVersion[];
  createdAt: Date;
  createdBy: string;
  folderId?: string;
}

interface QuestionVersion {
  questionText: string;
  responseType: string;
  options?: string[] | ScaleOptions;
  surveyThemes?: string[];
  categoryTags?: string[];
  estimatedTimeSeconds?: number;
  customFields?: CustomField[];
}
```

### 3. Public Survey Interface

#### Token-Based Access (`imports/pages/ModernSurveyPublic.tsx`)
- **Encrypted Tokens**: AES-256-CBC encryption for secure survey access
- **Anonymous Responses**: Unique respondent ID generation
- **Progress Tracking**: Real-time progress persistence
- **Theme Integration**: Dynamic CSS custom properties

#### Survey Flow (`imports/features/surveys/components/ModernSurveyContent.tsx`)
- **Step Management**: Welcome → Sections → Questions → Thank You
- **Response Collection**: Comprehensive answer validation and storage
- **Device Tracking**: Browser, device type, and engagement analytics
- **Retake Support**: Replace or new response modes

### 4. WPS (Whole Person Safety) Builder System

#### WPS Builder Page (`imports/ui/admin/WpsBuilderPage.tsx`)
- **473 lines** of interactive safety assessment builder
- **6 Safety Zones**: Behavior, Workplace, Equity, Well-Being, Built Environment, Inclusion
- **Interactive Zone Filtering**: Dynamic badges showing selected indicator counts
- **Standards & Indicators Table**: Hierarchical display with tooltips and details
- **Question Selection**: Add/remove indicators with real-time tracking

#### WPS Question Bank (`imports/api/wpsQuestionBank.js`)
- **6,017 lines** of comprehensive safety assessment questions
- **Structured Data Model**:
```javascript
{
  "AUTHORITY CATEGORY": "System (Required)" | "Hybrid (Required)" | "System (Bank)" | "Hybrid (Bank)",
  "INDICATOR": "Diverse Representation",
  "INDICATOR DESCRIPTION": "Detailed description...",
  "INDICATOR RELEVANCE": "Why this matters...",
  "LEADER QUESTIONS": "Question for leaders...",
  "WORKFORCE QUESTIONS": "Question for workforce...",
  "SZN": "1-6", // Safety Zone Number
  "SAFETY ZONE": "Built Environment Safety",
  "STANDARD": "Inclusive Design and Accessibility",
  "WPSID": "WPS1"
}
```

#### WPS Components
- **BuildModal** (`imports/ui/wps/BuildModal.tsx`): Question preview and export interface
- **WpsBuilderModal** (`imports/ui/wps/WpsBuilderModal.tsx`): Onboarding modal with slides
- **IndicatorDetailsModal**: Detailed indicator information popup
- **WPS Export Utility** (`imports/utils/wpsExport.ts`): JSON export for survey creation

### 5. Enhanced Marketplace

#### Marketplace Component (`imports/ui/admin/Marketplace.tsx`)
- **1,085 lines** of comprehensive product management
- **Product CRUD Operations**: Create, read, update, delete products
- **Visual Product Cards**: Gradient backgrounds, image uploads, hover effects
- **Advanced Features**: Screenshots gallery, feature lists, ratings system
- **Purchase Flow**: Integration with account details page

#### Product Data Model
```typescript
interface Product {
  name: string;
  description: string;
  price: number;
  priceUnit: string; // '/month', '/year', '/quarter', ''
  rating: number;
  reviews: number;
  image: string;
  imageUrl?: string;
  bgColor: string;
  whatsIncluded?: string[];
  screenshots?: string[];
  tags?: string[];
  category?: string;
}
```

### 6. Analytics & Reporting

#### Real-Time Analytics (`imports/features/analytics/components/RealTimeAnalytics.tsx`)
- **Live Metrics**: Active users, completion rates, response times
- **Interactive Charts**: Line, bar, pie, and doughnut visualizations
- **Device Distribution**: Mobile, tablet, desktop analytics
- **Performance Tracking**: Question-level and section-level metrics

#### Survey Report PDF (`imports/ui/admin/SurveyReportPDF.tsx`)
- **756 lines** of comprehensive PDF report generation
- **Hierarchical Organization**: Parent tags → Child tags → Questions
- **Response Visualization**: Charts, percentages, color-coded responses
- **Professional Layout**: Logo, metadata, structured sections

### 7. Multi-Tenancy & Organization Management

#### Organization Context (`imports/contexts/OrganizationContext.tsx`)
- **Customizable Terminology**: Survey/Question/Category labels
- **Brand Customization**: Primary/secondary colors, logos
- **Default Settings**: Demographics, comments, anonymous responses
- **Question Categories & Tags**: Organization-specific taxonomies

#### User Roles & Permissions
- **Admin**: Full system access, user management
- **Consultant**: Survey creation and management
- **CEO/Management**: Analytics and reporting access
- **Department Head**: Department-specific surveys
- **Anonymous Respondent**: Survey completion only

### 8. Theming & Customization System

#### Survey Themes (`imports/features/survey-themes/`)
```typescript
interface SurveyThemeType {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  headerStyle: string;
  buttonStyle: string;
  bodyFont: string;
  customCSS?: string;
  assignableTo: string[];
}
```

## Data Architecture

### Reactive Data System
1. **Client-side**: React components use `useTracker` for reactive data binding
2. **Server-side**: Meteor methods and publications handle business logic
3. **Database**: MongoDB collections with automatic reactive updates
4. **Real-time**: Meteor's DDP protocol for live data synchronization

### Key Collections
- **Surveys**: Survey documents with metadata and settings
- **Questions**: Versioned question documents
- **SurveyResponses**: Response data with analytics metadata
- **Products**: Marketplace product catalog
- **Organizations**: Multi-tenant organization settings
- **Users**: User accounts with role-based permissions

### API Methods Structure
- **CRUD Operations**: Create, read, update, delete for all entities
- **Batch Operations**: Efficient bulk operations for questions/surveys
- **Analytics Methods**: Real-time metrics calculation
- **Import/Export**: Data transformation and migration utilities

## Security & Performance

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Role-based Access**: Granular permission system
- **Encrypted Survey Tokens**: AES-256-CBC for public access
- **Organization Isolation**: Multi-tenant data separation

### Performance Optimizations
- **Field Projections**: Selective data fetching in publications
- **Lazy Loading**: On-demand component and data loading
- **Caching**: localStorage for progress and metadata
- **Debounced Operations**: Auto-save and progress tracking

## Development Guidelines

### Code Organization
- **Feature-based Architecture**: Group related functionality together
- **TypeScript Interfaces**: Comprehensive type definitions for all data models
- **Reactive Patterns**: Use `useTracker` for Meteor data subscriptions
- **Component Composition**: Reusable components with clear props interfaces

### Styling Conventions
- **CSS Custom Properties**: Use for theming and dynamic styles
- **Bootstrap Classes**: Leverage existing Bootstrap utilities
- **Styled-components**: For complex component-specific styles
- **Responsive Design**: Mobile-first approach with breakpoints

### Testing Strategy
- **Unit Tests**: Test individual components and utilities
- **Integration Tests**: Test feature workflows
- **E2E Tests**: Test complete user journeys
- **Performance Tests**: Monitor bundle size and load times

## Development Environment Setup

### Prerequisites
- Node.js 14+ and npm
- Meteor CLI (`npm install -g meteor`)
- MongoDB (local or cloud instance)

### Installation
```bash
git clone [repository-url]
cd new-gold-survey-development
meteor npm install
meteor run
```

### Environment Variables
```bash
# settings.json
{
  "public": {
    "analyticsSettings": { ... },
    "organizationSettings": { ... }
  },
  "private": {
    "JWT_SECRET": "your-jwt-secret",
    "ENCRYPTION_KEY": "your-encryption-key"
  }
}
```

### Development Commands
```bash
meteor run --settings settings.json    # Start development server
meteor test                           # Run tests
meteor build ../output               # Build for production
meteor deploy [app-name]             # Deploy to Galaxy
```

## Key Files to Understand

### Core Survey Components
1. `imports/features/surveys/components/EnhancedSurveyBuilder.tsx` (6,683 lines)
2. `imports/features/questions/components/EnhancedQuestionBuilder.tsx` (3,229 lines)
3. `imports/features/surveys/components/ModernSurveyContent.tsx`
4. `imports/pages/ModernSurveyPublic.tsx`

### WPS Builder System
1. `imports/ui/admin/WpsBuilderPage.tsx` (473 lines)
2. `imports/api/wpsQuestionBank.js` (6,017 lines)
3. `imports/ui/wps/BuildModal.tsx` (451 lines)
4. `imports/utils/wpsExport.ts`

### Marketplace & Admin
1. `imports/ui/admin/Marketplace.tsx` (1,085 lines)
2. `imports/ui/admin/SurveyReportPDF.tsx` (756 lines)
3. `imports/layouts/AdminLayout/AdminLayout.tsx`

### API & Data Layer
1. `imports/features/surveys/api/surveyMethods.ts`
2. `imports/features/questions/api/questionMethods.ts`
3. `imports/api/products/products.ts`

## Current Development Status

### Recently Added Features
- WPS Builder system with 6,017 safety questions
- Enhanced marketplace with visual product management
- PDF report generation capabilities
- Advanced survey analytics and real-time metrics
- Multi-tenant organization management

### Known Technical Debt
- Large component files that could benefit from further modularization
- Some legacy UI components in `imports/ui/` that could be migrated to feature-based structure
- Opportunity to implement more comprehensive error boundaries
- Performance optimization opportunities in large data rendering

## Next Development Priorities

### Immediate Tasks
1. **Performance Optimization**: Implement virtual scrolling for large question lists
2. **Error Handling**: Add comprehensive error boundaries and user feedback
3. **Testing Coverage**: Increase test coverage for critical user flows
4. **Documentation**: API documentation for Meteor methods and publications

### Medium-term Goals
1. **Mobile Optimization**: Enhanced mobile survey experience
2. **Advanced Analytics**: Machine learning insights and predictive analytics
3. **Integration APIs**: Third-party integrations (Slack, Teams, etc.)
4. **Accessibility**: WCAG 2.1 AA compliance improvements

### Long-term Vision
1. **Microservices Architecture**: Gradual migration to microservices
2. **Real-time Collaboration**: Live collaborative survey building
3. **AI-Powered Features**: Intelligent question suggestions and analysis
4. **Enterprise SSO**: Advanced authentication integrations

## Support & Resources

### Documentation
- **Meteor Guide**: https://guide.meteor.com/
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Bootstrap Documentation**: https://getbootstrap.com/docs/

### Development Tools
- **Meteor DevTools**: Browser extension for Meteor debugging
- **React DevTools**: Browser extension for React debugging
- **MongoDB Compass**: GUI for MongoDB database management
- **VS Code Extensions**: Meteor, TypeScript, ES7+ React snippets

### Code Quality
- **ESLint**: Configured for TypeScript and React
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files

This project brief provides comprehensive information for a new developer to understand the Trust-Tai Survey Platform architecture, features, and development practices. The platform represents a sophisticated enterprise survey solution with specialized workplace safety assessment capabilities.

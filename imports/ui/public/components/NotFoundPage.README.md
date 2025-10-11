# NotFoundPage Component

This component provides a customizable 404 "Page Not Found" experience for the application.

## Features

- Clean, modern design with animations
- Customizable text, colors, and buttons
- Configurable through a central configuration file
- Easy to disable/enable without code changes
- Support for custom content injection

## How to Use

The 404 page is automatically displayed for any route that doesn't match a defined route in the application. No additional setup is required for basic functionality.

## How to Customize

### Basic Customization

To customize the 404 page, edit the `NotFoundConfig.ts` file:

```typescript
// imports/ui/public/components/NotFoundConfig.ts

// Update any values in the defaultConfig object
const defaultConfig: NotFoundConfig = {
  title: "Custom 404 Title",
  message: "Your custom message here",
  // ... other configuration options
};
```

### Advanced Customization

For more advanced customization, you can pass a config object directly to the NotFoundPage component:

```typescript
// In your route configuration
<Route 
  path="*" 
  element={
    <NotFoundPage 
      config={{
        title: "Custom 404 Title",
        message: "Your custom message here",
        primaryColor: "#FF5722",
        enableAnimation: false
      }} 
    />
  } 
/>
```

### Adding Custom Buttons

You can add custom buttons to the 404 page:

```typescript
<Route 
  path="*" 
  element={
    <NotFoundPage 
      customButtons={
        <Button to="/contact" config={defaultConfig}>
          <FaEnvelope /> Contact Support
        </Button>
      }
    />
  } 
/>
```

### Temporarily Disabling the 404 Page

If you need to temporarily disable the 404 page, you can:

1. Comment out the catch-all route in `App.tsx`:
   ```typescript
   {/* Temporarily disabled
   <Route path="*" element={<NotFoundPage />} />
   */}
   ```

2. Or redirect to another page instead:
   ```typescript
   <Route path="*" element={<Navigate to="/" replace />} />
   ```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `title` | string | The main heading of the 404 page |
| `message` | string | The descriptive text below the title |
| `backButtonText` | string | Text for the "Go Back" button |
| `homeButtonText` | string | Text for the "Home Page" button |
| `showBackButton` | boolean | Whether to show the back button |
| `showHomeButton` | boolean | Whether to show the home button |
| `homeRoute` | string | The route to navigate to when clicking the home button |
| `backgroundColor` | string | Background color of the page |
| `textColor` | string | Color for the text content |
| `primaryColor` | string | Primary color for buttons and icons |
| `secondaryColor` | string | Secondary color for hover states |
| `customHeaderContent` | string | Optional HTML content to display above the main content |
| `customFooterContent` | string | Optional HTML content to display below the main content |
| `enableAnimation` | boolean | Whether to enable entrance animations |
| `enableLogging` | boolean | Whether to log 404 page visits to the console |

# Feature Flags

This document explains how to use feature flags to control the visibility and behavior of features in the application.

## What are Feature Flags?

Feature flags (also known as feature toggles) are a software development technique that allows you to enable or disable features without deploying new code. This is useful for:

- Gradually rolling out features
- A/B testing
- Temporarily disabling problematic features
- Hiding features that are still in development

## How to Use Feature Flags

### Checking if a Feature is Enabled

```typescript
import FEATURE_FLAGS from '../../config/featureFlags';

// In your component
if (FEATURE_FLAGS.SOME_FEATURE) {
  // Feature is enabled, render the feature
} else {
  // Feature is disabled, render an alternative or nothing
}
```

### Using the Feature Flag Utilities

For more advanced usage, you can use the feature flag utilities:

```typescript
import { isFeatureEnabled } from '../../utils/featureFlagUtils';

// In your component
if (isFeatureEnabled('SOME_FEATURE')) {
  // Feature is enabled
}
```

### Toggling Features in Development

During development, you can toggle features using the browser console:

```javascript
// In the browser console
import('/imports/utils/featureFlagUtils').then(({ toggleFeatureFlag }) => {
  toggleFeatureFlag('SHOW_ALL_QUESTIONS', true);
  // Refresh the page to see the change
});
```

## Current Feature Flags

| Flag Name | Description | Default Value |
|-----------|-------------|---------------|
| `SHOW_ALL_QUESTIONS` | Controls whether the All Questions page is visible | `false` |

## Adding New Feature Flags

To add a new feature flag:

1. Add the flag to the `FEATURE_FLAGS` object in `imports/config/featureFlags.ts`
2. Document the flag in this file
3. Use the flag in your components

Example:

```typescript
// In featureFlags.ts
export const FEATURE_FLAGS = {
  // Existing flags...
  
  // New flag
  NEW_FEATURE: false,
};
```

## Best Practices

1. **Use descriptive names** - Flag names should clearly indicate what feature they control
2. **Document all flags** - Add a comment explaining what the flag does
3. **Clean up old flags** - Remove flags for features that are fully launched or abandoned
4. **Don't nest flags** - Avoid checking one flag inside another flag's condition
5. **Default to off** - New features should default to disabled until they're ready

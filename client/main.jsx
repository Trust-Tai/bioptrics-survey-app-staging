import React from 'react';
import './quill-styles.css';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';

// Import the regular App component
import App from '/imports/ui/App';

// Import dynamic import fix to ensure correct domain is used in production
import '/imports/startup/client/dynamicImportFix';

// Import Bootstrap CSS first for proper styling
import 'bootstrap/dist/css/bootstrap.min.css';

// Import color theme CSS for dynamic theming
import './color-theme.css';

// Error boundary component to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
            <summary>Error Details</summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <p>Component Stack: {this.state.errorInfo && this.state.errorInfo.componentStack}</p>
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px' }}>
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

Meteor.startup(() => {
  const root = createRoot(document.getElementById('react-target'));
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
});

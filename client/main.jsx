import React from 'react';
import './quill-styles.css';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import App from '/imports/ui/App';

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
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback component to display when routing fails
const FallbackComponent = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
    <h2>Bioptrics Survey Application</h2>
    <p>If you're seeing this page, the application is loading or encountered an issue.</p>
    <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
      <a href="/admin-login" style={{ color: '#552a47', fontWeight: 'bold', textDecoration: 'none' }}>
        Go to Admin Login
      </a>
    </div>
  </div>
);

Meteor.startup(() => {
  try {
    console.log('Starting Bioptrics Survey Application...');
    
    // Display loading indicator while React initializes
    const container = document.getElementById('react-target');
    if (!container) {
      console.error('Could not find react-target element in the DOM');
      document.body.innerHTML = '<div style="padding: 20px; font-family: Arial, sans-serif;"><h2>Error: Could not find react-target element</h2></div>';
      return;
    }
    
    // Show loading indicator before React mounts
    container.innerHTML = '<div style="text-align: center; padding: 40px;"><h3>Loading Bioptrics Survey Application...</h3></div>';
    
    // Short timeout to ensure the DOM is ready
    setTimeout(() => {
      try {
        const root = createRoot(container);
        root.render(
          <ErrorBoundary>
            <React.StrictMode>
              <App />
            </React.StrictMode>
          </ErrorBoundary>
        );
        console.log('React application rendered successfully');
      } catch (innerError) {
        console.error('Error rendering React application:', innerError);
        container.innerHTML = `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2>Error rendering React application</h2>
            <pre>${innerError.toString()}</pre>
            <div style="margin-top: 20px;">
              <button onclick="location.reload()" style="padding: 10px 15px; background: #552a47; color: white; border: none; cursor: pointer; border-radius: 4px;">
                Reload Application
              </button>
            </div>
          </div>
        `;
      }
    }, 100);
  } catch (error) {
    console.error('Error during application startup:', error);
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>Error during application startup</h2>
        <pre>${error.toString()}</pre>
        <div style="margin-top: 20px;">
          <button onclick="location.reload()" style="padding: 10px 15px; background: #552a47; color: white; border: none; cursor: pointer; border-radius: 4px;">
            Reload Application
          </button>
        </div>
      </div>
    `;
  }
});

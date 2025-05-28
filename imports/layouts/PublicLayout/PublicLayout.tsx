import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PublicLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

/**
 * PublicLayout component for public-facing pages
 * Provides consistent header and footer for public pages
 */
const PublicLayout: React.FC<PublicLayoutProps> = ({ 
  children, 
  title = 'New Gold Survey', 
  showHeader = true, 
  showFooter = true 
}) => {
  return (
    <div className="public-layout">
      {showHeader && (
        <header className="public-header">
          <div className="container">
            <div className="header-content">
              <div className="logo">
                <Link to="/">
                  <img src="/images/logo.png" alt="New Gold Logo" />
                </Link>
              </div>
              <h1>{title}</h1>
            </div>
          </div>
        </header>
      )}
      
      <main className="public-main">
        <div className="container">
          {children}
        </div>
      </main>
      
      {showFooter && (
        <footer className="public-footer">
          <div className="container">
            <div className="footer-content">
              <p>&copy; {new Date().getFullYear()} New Gold Inc. All rights reserved.</p>
              <div className="footer-links">
                <Link to="/terms">Terms of Use</Link>
                <Link to="/privacy">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PublicLayout;

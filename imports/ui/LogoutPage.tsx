import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

const LogoutPage: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Perform logout
    Meteor.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      
      // Clear any admin tokens or other auth data from localStorage
      localStorage.removeItem('admin_jwt');
      
      // Redirect to login page with success message
      navigate('/?logout=success');
    });
  }, [navigate]);

  // Show a loading message while logout is processing
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#f4ebf1'
    }}>
      <div style={{ 
        textAlign: 'center',
        padding: '2rem',
        borderRadius: '10px',
        background: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#8B7341', marginBottom: '1rem' }}>Logging Out</h2>
        <p>Please wait while we log you out...</p>
      </div>
    </div>
  );
};

export default LogoutPage;

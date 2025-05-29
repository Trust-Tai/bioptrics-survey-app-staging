import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthBg, AuthCard, AuthTitle, AuthInput, AuthButton, AuthError, AuthInputWrapper, AuthInputIcon, AuthInputAction } from './components/AuthStyles';
import { FaUser, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';

interface AdminLoginProps {
  onAdminAuth: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onAdminAuth }) => {
  const location = useLocation();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Check for logout success message in URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('logout') === 'success') {
      setSuccessMessage('You have been successfully logged out.');
      // Clear the URL parameter after a delay
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 500);
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  }, [location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await new Promise((resolve, reject) => {
        Meteor.loginWithPassword(emailOrUsername, password, (err) => {
          if (err) reject(err);
          else resolve(null);
        });
      });
      Meteor.call('admin.getToken', (err: any, res: any) => {
        if (err) {
          setError(err.reason || 'Not an admin user');
        } else {
          localStorage.setItem('admin_jwt', res.token);
          onAdminAuth();
        }
      });
    } catch (err: any) {
      setError(err.reason || 'Admin login failed');
    }
  };



  return (
    <AuthBg>
      {/* New logo art at bottom left */}
      <img src="/newlogo-art.png" alt="bioptrics art" style={{ position: 'absolute', left: 0, bottom: 0, height: '60%', zIndex: 1, pointerEvents: 'none' }} />
      {/* Powered by Bioptrics at bottom right */}
      <img src="/poweredbybioptrics.png" alt="Powered by Bioptrics" style={{ position: 'absolute', right: 20, bottom: 20, height: 40, zIndex: 1, pointerEvents: 'none' }} />
      <AuthCard onSubmit={handleLogin} style={{ maxWidth: 400, padding: '1.5rem 2.5rem 2rem 2.5rem', minWidth: 320, position: 'relative', zIndex: 3 }}>
        <AuthTitle style={{ fontSize: 24, marginBottom: 8, marginTop: 0, fontWeight: 400, letterSpacing: 0.1, color: '#222' }}>
          Bioptrics <span style={{ fontWeight: 'bold', color: '#7a3e68' }}>Survey Admin</span>
        </AuthTitle>
        <div style={{ textAlign: 'center', color: '#555555', fontSize: 15, marginBottom: 22, marginTop: 2 }}>
          Securely log in to access the admin dashboard, manage survey data, view insights, and control system settings.<br />
          Only authorized users are permitted.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {error && <AuthError>{error}</AuthError>}
          {successMessage && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '6px',
              backgroundColor: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb',
              marginBottom: '15px',
              width: '100%',
              textAlign: 'center',
              fontWeight: 500
            }}>
              {successMessage}
            </div>
          )}
          <div style={{ width: '100%', marginBottom: 15 }}>
            <label style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 13, color: '#222222', letterSpacing: 0.7, marginBottom: 4, display: 'block' }}>
              Username<span style={{ color: '#d92d20' }}>*</span>
            </label>
            <AuthInputWrapper>
              <AuthInput
                type="text"
                value={emailOrUsername}
                onChange={e => setEmailOrUsername(e.target.value)}
                placeholder="John Jacobs"
                required
                autoComplete="username"
                style={{ fontSize: 16, paddingLeft: '1rem', paddingRight: 36, background: '#fcf7ee', border: '1.5px solid #ede3d0' }}
              />
            </AuthInputWrapper>
          </div>
          <div style={{ width: '100%', marginBottom: 4 }}>
            <label style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 13, color: '#222222', letterSpacing: 0.7, marginBottom: 4, display: 'block' }}>
              Password<span style={{ color: '#d92d20' }}>*</span>
            </label>
            <AuthInputWrapper>
              <AuthInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="********"
                required
                autoComplete="current-password"
                style={{ fontSize: 16, paddingLeft: '1rem', paddingRight: 36, background: '#fcf7ee', border: '1.5px solid #ede3d0' }}
              />
              <AuthInputAction type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ right: 10, top: '52%' }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </AuthInputAction>
            </AuthInputWrapper>
            <div style={{ textAlign: 'right', marginTop: 2, marginBottom: -8 }}>
              <a href="#" style={{ fontSize: 13, color: '#7a6a4f', textDecoration: 'underline', opacity: 0.9 }}>Forgot password?</a>
            </div>
          </div>
          <AuthButton type="submit" style={{ marginTop: 22, fontSize: 17, fontWeight: 700, borderRadius: 24, background: 'linear-gradient(90deg, #552a47 0%, #552a47 100%)', boxShadow: '0 2px 8px #e5d6e0', height: 44, letterSpacing: 0.2, width: '100%', border: 'none' }}>LOG IN</AuthButton>
        </div>
      </AuthCard>
    </AuthBg>
  );
};

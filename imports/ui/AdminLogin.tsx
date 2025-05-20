import React, { useState } from 'react';
import { AuthBg, AuthCard, AuthTitle, AuthInput, AuthButton, AuthError, AuthInputWrapper, AuthInputIcon, AuthInputAction } from './components/AuthStyles';
import { FaUser, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';

interface AdminLoginProps {
  onAdminAuth: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onAdminAuth }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    Meteor.call('admin.login', emailOrUsername, password, (err: any, res: any) => {
      if (err) {
        setError(err.reason || 'Admin login failed');
      } else {
        localStorage.setItem('admin_jwt', res.token);
        onAdminAuth();
      }
    });
  };


  return (
    <AuthBg>
      {/* Triangle background shapes (placeholder, can be improved with SVG/CSS) */}
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: 300, zIndex: 0 }}>
        {/* Example triangles, you can replace with SVGs or images for more accuracy */}
        <div style={{ width: 0, height: 0, borderLeft: '120px solid transparent', borderBottom: '120px solid #ede3d0', position: 'absolute', left: 40, top: 90, opacity: 0.6 }} />
        <div style={{ width: 0, height: 0, borderLeft: '80px solid transparent', borderBottom: '80px solid #ede3d0', position: 'absolute', left: 60, top: 240, opacity: 0.4 }} />
        <div style={{ width: 0, height: 0, borderLeft: '60px solid transparent', borderBottom: '60px solid #ede3d0', position: 'absolute', left: 0, top: 350, opacity: 0.25 }} />
      </div>
      {/* New logo art at bottom left */}
      <img src="/newlogo-art.png" alt="new gold art" style={{ position: 'absolute', left: 0, bottom: 0, height: 180, zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
        {/* Logo placeholder - replace src with your actual logo path */}
        <img src="/newgold-logo.png" alt="new gold logo" style={{ height: 48, marginBottom: 32 }} />
      </div>
      <AuthCard onSubmit={handleLogin} style={{ maxWidth: 400, padding: '2.5rem 2.5rem 2rem 2.5rem', minWidth: 320, position: 'relative', zIndex: 3 }}>
        <AuthTitle style={{ fontSize: 24, marginBottom: 8, marginTop: 0, fontWeight: 400, letterSpacing: 0.1, color: '#222' }}>
          New Gold <span style={{ fontWeight: 'bold', color: '#D4AF37' }}>Survey Admin</span>
        </AuthTitle>
        <div style={{ textAlign: 'center', color: '#555555', fontSize: 15, marginBottom: 22, marginTop: 2 }}>
          Securely log in to access the admin dashboard, manage survey data, view insights, and control system settings.<br />
          Only authorized users are permitted.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {error && <AuthError>{error}</AuthError>}
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
          <AuthButton type="submit" style={{ marginTop: 22, fontSize: 17, fontWeight: 700, borderRadius: 24, background: 'linear-gradient(90deg, #8B7341 0%, #8B7341 100%)', boxShadow: '0 2px 8px #e5d6e0', height: 44, letterSpacing: 0.2, width: '100%', border: 'none' }}>LOG IN</AuthButton>
        </div>
      </AuthCard>
    </AuthBg>
  );
};

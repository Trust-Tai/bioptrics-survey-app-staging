import React, { useState } from 'react';
import { AuthBg, AuthCard, AuthTitle, AuthInput, AuthButton, AuthError, AuthInputWrapper, AuthInputIcon, AuthInputAction } from './components/AuthStyles';
import { FaUser, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';

interface AdminLoginProps {
  onAdminAuth: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onAdminAuth }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Only password for admin login
    Meteor.call('admin.login', password, (err: any, res: any) => {
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
      <AuthCard onSubmit={handleLogin} style={{ maxWidth: 340, padding: '2.2rem 2rem', minWidth: 260 }}>
        <AuthTitle style={{ fontSize: 22, marginBottom: 18, fontWeight: 700, letterSpacing: 0.1 }}>Admin Login</AuthTitle>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {error && <AuthError>{error}</AuthError>}
          <div style={{ width: '100%' }}>
            <AuthInputWrapper>
              <AuthInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
                style={{ fontSize: 16, paddingLeft: '1rem', paddingRight: 36, height: 44, background: '#faf9fb', border: '1.5px solid #e5d6e0' }}
              />
              <AuthInputAction type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ right: 10, top: '52%' }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </AuthInputAction>
            </AuthInputWrapper>
          </div>
          <AuthButton type="submit" style={{ marginTop: 18, fontSize: 17, fontWeight: 700, borderRadius: 8, boxShadow: '0 2px 8px #e5d6e0', height: 44, letterSpacing: 0.2, width: '100%' }}>Login</AuthButton>
        </div>
      </AuthCard>
    </AuthBg>
  );
};

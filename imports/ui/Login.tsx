import React, { useState } from 'react';
import { AuthBg, AuthCard, AuthTitle, AuthInput, AuthButton, AuthError, AuthRow, AuthInputWrapper, AuthInputIcon, AuthInputAction } from './components/AuthStyles';
import { FaUser, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';

interface LoginProps {
  onAuth: () => void;
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onAuth, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    Meteor.call('auth.login', email, password, (err: any, res: any) => {
      if (err) {
        setError(err.reason || 'Login failed');
      } else {
        localStorage.setItem('jwt', res.token);
        onAuth();
      }
    });
  };

  return (
    <AuthBg>
      <AuthCard style={{ width: '520px', maxWidth: '98vw' }} onSubmit={handleLogin}>
        <AuthTitle>Login</AuthTitle>
        {error && <AuthError>{error}</AuthError>}
        <AuthInputWrapper>
          <AuthInputIcon><FaUser /></AuthInputIcon>
          <AuthInput
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="username"
          />
        </AuthInputWrapper>
        <AuthInputWrapper>
          <AuthInputIcon><FaKey /></AuthInputIcon>
          <AuthInput
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
          />
          <AuthInputAction type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </AuthInputAction>
        </AuthInputWrapper>
        <AuthButton type="submit">Login</AuthButton>
        <AuthRow>
          <span>Don't have an account?</span>
          <AuthButton type="button" variant="link" onClick={onSwitchToRegister}>Create an account</AuthButton>
        </AuthRow>
      </AuthCard>
    </AuthBg>
  );
};

import React, { useState } from 'react';
import { AuthBg, AuthCard, AuthTitle, AuthInput, AuthButton, AuthError, AuthRow, AuthInputWrapper, AuthInputIcon, AuthInputAction } from './components/AuthStyles';
import { FaExternalLinkAlt, FaUser, FaKey, FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle, FaMinusCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface RegisterProps {
  onAuth: () => void;
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onAuth, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  // Password strength scoring
  function passwordStrength(pw: string): 'weak' | 'medium' | 'strong' {
    if (!pw || pw.length < 8) return 'weak';
    let score = 0;
    if (/[a-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    // Penalize common, repeated, or sequential
    if (/^(.)\1+$/.test(pw) || /0123|1234|2345|3456|4567|5678|6789|7890|abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz|password|qwerty|letmein|welcome|admin|user|test|abc123|111111|123456|000000/i.test(pw)) return 'weak';
    if (score >= 4) return 'strong';
    if (score === 3) return 'medium';
    return 'weak';
  }

  // Password strength check
  function isStrongPassword(pw: string): boolean {
    return passwordStrength(pw) === 'strong';
  }

  const handleCheckEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCheckingEmail(true);
    Meteor.call('auth.checkEmail', email, (err: any, res: any) => {
      setCheckingEmail(false);
      console.log('[Register] checkEmail response:', { err, res, email });
      if (err) {
        setError(err.reason || 'Could not check email');
      } else if (res.exists) {
        setEmailExists(true);
        setError('This email is already registered.');
      } else {
        setEmailChecked(true);
        setEmailExists(false);
      }
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!isStrongPassword(password)) {
      setError('Password is not strong enough');
      return;
    }
    Meteor.call('auth.register', email, password, agreeMarketing, (err: any, res: any) => {
      if (err) {
        setError(err.reason || 'Registration failed');
      } else {
        localStorage.setItem('jwt', res.token);
        onAuth();
      }
    });
  };

  const handleBack = () => {
    setEmailChecked(false);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <AuthBg>
      <AuthCard onSubmit={emailChecked ? handleRegister : handleCheckEmail} style={{position:'relative'}}>
        {/* Back link at top left */}
        {emailChecked && !emailExists && (
          <div style={{position:'absolute',top:24,left:24}}>
            <AuthButton type="button" variant="link" onClick={handleBack} style={{fontSize:'1.05rem',padding:'0.25rem 0.75rem'}}>
              ← Back
            </AuthButton>
          </div>
        )}
        <AuthTitle style={{marginTop: emailChecked && !emailExists ? '2rem' : undefined}}>Create an account</AuthTitle>
        {error && (
          error === 'This email is already registered.' ? (
            <AuthError>
              This email is already registered.{' '}
              <span>
                <AuthButton type="button" variant="link" style={{padding:0,fontSize:'1em'}} onClick={onSwitchToLogin}>
                  Please login
                </AuthButton>
              </span>
            </AuthError>
          ) : (
            <AuthError>{error}</AuthError>
          )
        )}
        {!emailChecked && (
          <>
            <AuthInputWrapper>
              <AuthInputIcon><FaUser /></AuthInputIcon>
              <AuthInput
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={checkingEmail}
                autoComplete="username"
              />
            </AuthInputWrapper>
            <div style={{marginBottom: '0.5rem'}}>
              <label style={{display:'block',marginBottom:'0.5rem'}}>
                <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} required />
                {' '}You agree to the{' '}
                <Link to="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#552a47', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}>
                  Terms of Use <FaExternalLinkAlt style={{ fontSize: '0.85em', marginLeft: 2 }} />
                </Link>{' '}and{' '}
                <Link to="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#552a47', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}>
                  Privacy Notice <FaExternalLinkAlt style={{ fontSize: '0.85em', marginLeft: 2 }} />
                </Link>{' '}
                <span style={{color:'red'}}>*</span>
              </label>
              <label style={{display:'block'}}>
                <input type="checkbox" checked={agreeMarketing} onChange={e => setAgreeMarketing(e.target.checked)} />
                {' '}You agree to receive product news and special promotions via email. You can opt-out of these emails in your My Account page anytime.
              </label>
            </div>
            <div style={{ height: '1.5rem' }} />
            <AuthButton type="submit" disabled={!agreeTerms || !email}>Next</AuthButton>
          </>
        )}
        {emailChecked && !emailExists && (
          <>
            <div style={{fontSize:'1.03rem',color:'#552a47',marginBottom:'1.25rem',textAlign:'center',fontWeight:600}}>
              Setting password for: <span style={{fontWeight:700}}>{email}</span>
            </div>
            <AuthInputWrapper>
              <AuthInputIcon><FaKey /></AuthInputIcon>
              <AuthInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="new-password"
              />
              <AuthInputAction type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </AuthInputAction>
            </AuthInputWrapper>
            <div style={{fontSize:'0.97rem',color:'#6e5a67',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
              Enter at least 8 characters. Don’t use common words, names, or sequential or repeated characters.
              {password && (
                passwordStrength(password) === 'strong' ? (
                  <span style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
                    <FaCheckCircle style={{color:'#27ae60'}} />
                    <span style={{color:'#27ae60'}}>Strong</span>
                  </span>
                ) : passwordStrength(password) === 'medium' ? (
                  <span style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
                    <FaMinusCircle style={{color:'#f6a700'}} />
                    <span style={{color:'#f6a700'}}>Medium</span>
                  </span>
                ) : (
                  <span style={{display:'flex',alignItems:'center',gap:'0.35rem'}}>
                    <FaExclamationCircle style={{color:'#e74c3c'}} />
                    <span style={{color:'#e74c3c'}}>Weak</span>
                  </span>
                )
              )}
            </div>
            <AuthInputWrapper>
              <AuthInputIcon><FaKey /></AuthInputIcon>
              <AuthInput
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
                autoComplete="new-password"
              />
              <AuthInputAction type="button" tabIndex={-1} onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </AuthInputAction>
            </AuthInputWrapper>
            <AuthButton
              type="submit"
              style={{width:'100%',marginTop:'1.5rem',alignSelf:'center'}} 
              disabled={
                !password ||
                !confirmPassword ||
                password !== confirmPassword ||
                !isStrongPassword(password)
              }
            >
              Create an account
            </AuthButton>
          </>
        )}
        <AuthRow>
          <span>Already have an account?</span>
          <AuthButton type="button" variant="link" onClick={onSwitchToLogin}>Login</AuthButton>
        </AuthRow>
      </AuthCard>
    </AuthBg>
  );
};

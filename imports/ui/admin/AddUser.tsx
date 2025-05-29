import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FaUserShield, FaEye, FaEyeSlash, FaCheck, FaTimes, FaRandom, FaCopy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';

// Styled components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  color: #333;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 600px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
`;

const PasswordStrengthMeter = styled.div`
  margin-top: 8px;
`;

const StrengthBar = styled.div<{ strength: number }>`
  height: 5px;
  background: ${({ strength }) => {
    if (strength === 0) return '#ddd';
    if (strength < 2) return '#f44336';
    if (strength < 3) return '#ff9800';
    if (strength < 4) return '#2196f3';
    return '#4caf50';
  }};
  width: ${({ strength }) => (strength * 25)}%;
  transition: all 0.3s ease;
  border-radius: 5px;
  margin-bottom: 8px;
`;

const StrengthLabel = styled.div<{ strength: number }>`
  font-size: 12px;
  color: ${({ strength }) => {
    if (strength === 0) return '#666';
    if (strength < 2) return '#f44336';
    if (strength < 3) return '#ff9800';
    if (strength < 4) return '#2196f3';
    return '#4caf50';
  }};
  margin-bottom: 8px;
`;

const PasswordRequirements = styled.div`
  margin-top: 4px;
  font-size: 12px;
`;

const RequirementItem = styled.div<{ met: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ met }) => met ? '#4caf50' : '#666'};
  margin-bottom: 4px;
`;

const RequirementIcon = styled.span<{ met: boolean }>`
  color: ${({ met }) => met ? '#4caf50' : '#f44336'};
  display: flex;
  align-items: center;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  box-sizing: border-box;
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #552a47;
  }
`;

const PasswordActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f5f7;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #e5e5e7;
  }
  
  &:active {
    background: #d5d5d7;
  }
`;

const GeneratedPassword = styled.div`
  background: #f5f5f7;
  border-radius: 4px;
  padding: 8px 12px;
  font-family: monospace;
  font-size: 14px;
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PasswordText = styled.span`
  word-break: break-all;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin-left: 8px;
  
  &:hover {
    color: #552a47;
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Button = styled.button`
  background: #552a47;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  width: fit-content;
  
  &:hover {
    background: #7a3e68;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
`;

const CancelButton = styled.button`
  background: #f5f5f7;
  color: #333;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #e5e5e7;
  }
`;

const FormSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
`;

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    organization: '',
    isAdmin: false
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    checkPasswordStrength(formData.password);
  }, [formData.password]);
  
  // Reset copy success message after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);
  
  // Auto-dismiss alerts after a timeout
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(
        () => setAlert(null), 
        alert.type === 'success' ? 3000 : 4000
      );
      return () => clearTimeout(timer);
    }
  }, [alert]);
  
  function showSuccess(msg: string) {
    setAlert({ type: 'success', message: msg });
  }
  
  function showError(msg: string) {
    setAlert({ type: 'error', message: msg });
  }

  const checkPasswordStrength = (password: string) => {
    // Check requirements
    const reqs = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    setPasswordRequirements(reqs);
    
    // Calculate strength score (0-4)
    let strength = 0;
    if (reqs.length) strength++;
    if (reqs.uppercase && reqs.lowercase) strength++;
    if (reqs.number) strength++;
    if (reqs.special) strength++;
    
    // Additional bonus for longer passwords
    if (password.length >= 12 && strength > 2) strength = 4;
    
    setPasswordStrength(password ? strength : 0);
  };

  const getStrengthLabel = (strength: number): string => {
    if (strength === 0) return 'No password';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
  };
  
  const generateStrongPassword = () => {
    // Define character sets
    const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding similar looking characters
    const lowercaseChars = 'abcdefghijkmnopqrstuvwxyz';
    const numberChars = '23456789'; // Excluding 0 and 1 which look similar to O and l
    const specialChars = '!@#$%^&*-_=+?';
    
    // Generate a random length between 12 and 16
    const length = Math.floor(Math.random() * 5) + 12;
    
    // Ensure at least one character from each set
    let password = '';
    password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    // Fill the rest with random characters from all sets
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setGeneratedPassword(password);
    setShowGeneratedPassword(true);
    setShowPassword(true);
    
    // Update form data
    setFormData({
      ...formData,
      password: password,
      confirmPassword: password
    });
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword)
      .then(() => {
        setCopySuccess(true);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      showError('Email and password are required');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return false;
    }
    
    // Check password strength
    if (passwordStrength < 2) {
      showError('Password is too weak. Please create a stronger password.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setAlert(null);
    
    Meteor.call(
      'users.create',
      {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        organization: formData.organization,
        isAdmin: formData.isAdmin
      },
      (error: Error, result: string) => {
        setLoading(false);
        
        if (error) {
          console.error('Error creating user:', error);
          showError(error.message || 'Failed to create user. Please try again.');
        } else {
          showSuccess('User created successfully!');
          setTimeout(() => {
            // Redirect to the users list page after showing success message
            navigate('/admin/users/all');
          }, 1500);
        }
      }
    );
  };

  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <PageTitle>Add New User</PageTitle>
        </PageHeader>
        
        {/* Alert message */}
        {alert && (
          <div style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: alert.type === 'success' ? '#2ecc40' : '#e74c3c',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            zIndex: 2000,
            boxShadow: '0 2px 12px #552a4733',
          }}>
            {alert.message}
          </div>
        )}
        
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Account Information</SectionTitle>
            <FormGroup>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="user@example.com"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="password">Password *</Label>
              <PasswordInputWrapper>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter password"
                />
                <PasswordToggleButton 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggleButton>
              </PasswordInputWrapper>
              
              <PasswordActionButtons>
                <ActionButton type="button" onClick={generateStrongPassword}>
                  <FaRandom size={12} /> Generate Strong Password
                </ActionButton>
              </PasswordActionButtons>
              
              {showGeneratedPassword && (
                <GeneratedPassword>
                  <PasswordText>{generatedPassword}</PasswordText>
                  <CopyButton onClick={copyToClipboard} title="Copy to clipboard">
                    <FaCopy size={14} />
                    {copySuccess && <span style={{ marginLeft: '4px', fontSize: '12px' }}>Copied!</span>}
                  </CopyButton>
                </GeneratedPassword>
              )}
              
              <PasswordStrengthMeter>
                <StrengthBar strength={passwordStrength} />
                <StrengthLabel strength={passwordStrength}>
                  {getStrengthLabel(passwordStrength)}
                </StrengthLabel>
                
                <PasswordRequirements>
                  <RequirementItem met={passwordRequirements.length}>
                    <RequirementIcon met={passwordRequirements.length}>
                      {passwordRequirements.length ? <FaCheck size={12} /> : <FaTimes size={12} />}
                    </RequirementIcon>
                    At least 8 characters
                  </RequirementItem>
                  <RequirementItem met={passwordRequirements.uppercase && passwordRequirements.lowercase}>
                    <RequirementIcon met={passwordRequirements.uppercase && passwordRequirements.lowercase}>
                      {passwordRequirements.uppercase && passwordRequirements.lowercase ? <FaCheck size={12} /> : <FaTimes size={12} />}
                    </RequirementIcon>
                    Uppercase and lowercase letters
                  </RequirementItem>
                  <RequirementItem met={passwordRequirements.number}>
                    <RequirementIcon met={passwordRequirements.number}>
                      {passwordRequirements.number ? <FaCheck size={12} /> : <FaTimes size={12} />}
                    </RequirementIcon>
                    At least one number
                  </RequirementItem>
                  <RequirementItem met={passwordRequirements.special}>
                    <RequirementIcon met={passwordRequirements.special}>
                      {passwordRequirements.special ? <FaCheck size={12} /> : <FaTimes size={12} />}
                    </RequirementIcon>
                    At least one special character
                  </RequirementItem>
                </PasswordRequirements>
              </PasswordStrengthMeter>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <PasswordInputWrapper>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm password"
                />
                <PasswordToggleButton 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </PasswordToggleButton>
              </PasswordInputWrapper>
            </FormGroup>
          </FormSection>
          
          <FormSection>
            <SectionTitle>User Details</SectionTitle>
            <FormGroup>
              <Label htmlFor="name">Full Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="executive">Executive</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="organization">Organization</Label>
              <Input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="Enter organization name"
              />
            </FormGroup>
            
            <FormGroup>
              <Checkbox>
                <input
                  type="checkbox"
                  id="isAdmin"
                  name="isAdmin"
                  checked={formData.isAdmin}
                  onChange={handleInputChange}
                />
                <Label htmlFor="isAdmin" style={{ margin: 0 }}>
                  Admin Access <FaUserShield style={{ verticalAlign: 'middle', marginLeft: '5px' }} />
                </Label>
              </Checkbox>
            </FormGroup>
          </FormSection>
          
          <FormActions>
            <CancelButton type="button" onClick={() => navigate('/admin/users/all')}>
              Cancel
            </CancelButton>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </FormActions>
        </Form>
      </Container>
    </AdminLayout>
  );
};

export default AddUser;

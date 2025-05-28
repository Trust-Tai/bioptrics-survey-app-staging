import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FaUserShield, FaEye, FaEyeSlash, FaCheck, FaTimes, FaRandom, FaCopy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Import from new feature-based structure
import { AdminLayout } from '../../../../layouts';

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
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: #333;
    text-decoration: underline;
  }
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  cursor: pointer;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  
  input {
    cursor: pointer;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  grid-column: 1 / -1;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return '#552a47';
      case 'secondary': return '#f5f5f5';
      case 'danger': return '#f8f8f8';
      default: return '#f5f5f5';
    }
  }};
  
  color: ${props => props.variant === 'primary' ? '#fff' : props.variant === 'danger' ? '#e53935' : '#333'};
  border: 1px solid ${props => props.variant === 'primary' ? '#552a47' : props.variant === 'danger' ? '#ffcdd2' : '#ddd'};
  
  &:hover {
    background-color: ${props => {
      switch (props.variant) {
        case 'primary': return '#3e1f34';
        case 'secondary': return '#e9e9e9';
        case 'danger': return '#ffebee';
        default: return '#e9e9e9';
      }
    }};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e53935;
  font-size: 14px;
  margin-top: 8px;
`;

const SuccessMessage = styled.div`
  color: #43a047;
  font-size: 14px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PasswordStrengthMeter = styled.div`
  margin-top: 8px;
`;

const PasswordStrengthBar = styled.div`
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  margin-bottom: 4px;
  overflow: hidden;
`;

const PasswordStrengthIndicator = styled.div<{ strength: number }>`
  height: 100%;
  width: ${props => props.strength * 25}%;
  background-color: ${props => {
    if (props.strength <= 1) return '#e53935';
    if (props.strength === 2) return '#ffb74d';
    if (props.strength === 3) return '#ffd54f';
    return '#66bb6a';
  }};
  transition: width 0.3s ease;
`;

const PasswordStrengthText = styled.div<{ strength: number }>`
  font-size: 12px;
  color: ${props => {
    if (props.strength <= 1) return '#e53935';
    if (props.strength === 2) return '#f57c00';
    if (props.strength === 3) return '#ffa000';
    return '#43a047';
  }};
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
  grid-column: 1 / -1;
`;

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('user');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Available permissions based on role
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  
  // Available departments and job titles
  const departments = [
    'Executive',
    'Human Resources',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
    'Information Technology',
    'Research & Development',
    'Customer Support',
    'Legal'
  ];
  
  const jobTitles = {
    Executive: ['CEO', 'CFO', 'CTO', 'COO', 'President', 'Vice President'],
    'Human Resources': ['HR Director', 'HR Manager', 'Recruiter', 'HR Specialist'],
    Finance: ['Finance Manager', 'Accountant', 'Financial Analyst', 'Payroll Specialist'],
    Marketing: ['Marketing Director', 'Marketing Manager', 'Content Specialist', 'SEO Specialist'],
    Sales: ['Sales Director', 'Sales Manager', 'Account Executive', 'Sales Representative'],
    Operations: ['Operations Manager', 'Project Manager', 'Business Analyst', 'Process Improvement Specialist'],
    'Information Technology': ['IT Director', 'IT Manager', 'Software Developer', 'System Administrator', 'Network Engineer'],
    'Research & Development': ['R&D Director', 'Product Manager', 'Research Scientist', 'Product Developer'],
    'Customer Support': ['Support Manager', 'Customer Service Representative', 'Technical Support Specialist'],
    Legal: ['Legal Counsel', 'Compliance Officer', 'Legal Assistant']
  };
  
  // Update available permissions when role changes
  useEffect(() => {
    switch (role) {
      case 'admin':
        setAvailablePermissions([
          'manage_users',
          'manage_surveys',
          'view_analytics',
          'export_data',
          'manage_settings',
          'manage_templates',
          'manage_categories'
        ]);
        break;
      case 'manager':
        setAvailablePermissions([
          'view_team_responses',
          'create_surveys',
          'edit_surveys',
          'view_analytics',
          'export_data'
        ]);
        break;
      case 'analyst':
        setAvailablePermissions([
          'view_analytics',
          'export_data',
          'view_responses'
        ]);
        break;
      case 'user':
      default:
        setAvailablePermissions([
          'take_surveys',
          'view_own_responses'
        ]);
        break;
    }
    
    // Reset permissions when role changes
    setPermissions([]);
  }, [role]);
  
  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);
  
  // Generate a random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let newPassword = '';
    
    // Ensure at least one uppercase, one lowercase, one number, and one special char
    newPassword += chars.charAt(Math.floor(Math.random() * 26));
    newPassword += chars.charAt(Math.floor(Math.random() * 26) + 26);
    newPassword += chars.charAt(Math.floor(Math.random() * 10) + 52);
    newPassword += chars.charAt(Math.floor(Math.random() * 12) + 62);
    
    // Add more random characters to reach desired length
    for (let i = 0; i < 8; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Shuffle the password
    newPassword = newPassword.split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(newPassword);
    setShowPassword(true);
  };
  
  // Copy password to clipboard
  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    alert('Password copied to clipboard');
  };
  
  // Toggle permission selection
  const togglePermission = (permission: string) => {
    if (permissions.includes(permission)) {
      setPermissions(permissions.filter(p => p !== permission));
    } else {
      setPermissions([...permissions, permission]);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password || !firstName || !lastName || !role || !department) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (passwordStrength < 3) {
      setError('Please use a stronger password');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    // Create user object
    const newUser = {
      email,
      password,
      profile: {
        firstName,
        lastName,
        department,
        jobTitle,
        role
      },
      permissions
    };
    
    // Call Meteor method to create user
    Meteor.call('users.create', newUser, (error: Error | null) => {
      setIsSubmitting(false);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('User created successfully');
        
        // Reset form after success
        setTimeout(() => {
          navigate('/admin/users');
        }, 2000);
      }
    });
  };
  
  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <PageTitle>Add New User</PageTitle>
          <BackButton onClick={() => navigate('/admin/users')}>
            &larr; Back to Users
          </BackButton>
        </PageHeader>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && (
          <SuccessMessage>
            <FaCheck /> {success}
          </SuccessMessage>
        )}
        
        <Form onSubmit={handleSubmit}>
          <SectionTitle>Basic Information</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password *</Label>
            <InputGroup>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <InputIcon onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </InputIcon>
            </InputGroup>
            
            <PasswordStrengthMeter>
              <PasswordStrengthBar>
                <PasswordStrengthIndicator strength={passwordStrength} />
              </PasswordStrengthBar>
              <PasswordStrengthText strength={passwordStrength}>
                {passwordStrength === 0 && 'Enter a password'}
                {passwordStrength === 1 && 'Weak password'}
                {passwordStrength === 2 && 'Fair password'}
                {passwordStrength === 3 && 'Good password'}
                {passwordStrength === 4 && 'Strong password'}
              </PasswordStrengthText>
            </PasswordStrengthMeter>
            
            <ButtonGroup style={{ margin: '8px 0 0', justifyContent: 'flex-start' }}>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={generatePassword}
                style={{ padding: '6px 12px' }}
              >
                <FaRandom /> Generate
              </Button>
              
              <Button 
                type="button" 
                variant="secondary" 
                onClick={copyPassword}
                style={{ padding: '6px 12px' }}
                disabled={!password}
              >
                <FaCopy /> Copy
              </Button>
            </ButtonGroup>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Enter first name"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Enter last name"
              required
            />
          </FormGroup>
          
          <SectionTitle>Role & Department</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="role">User Role *</Label>
            <Select
              id="role"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              <option value="user">Regular User</option>
              <option value="manager">Manager</option>
              <option value="analyst">Analyst</option>
              <option value="admin">Administrator</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="department">Department *</Label>
            <Select
              id="department"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Select
              id="jobTitle"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              disabled={!department}
            >
              <option value="">Select Job Title</option>
              {department && (jobTitles as any)[department]?.map((title: string) => (
                <option key={title} value={title}>{title}</option>
              ))}
            </Select>
          </FormGroup>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <Label>Permissions</Label>
            <CheckboxGroup>
              {availablePermissions.map(permission => (
                <CheckboxLabel key={permission}>
                  <input
                    type="checkbox"
                    checked={permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                  />
                  {permission.replace(/_/g, ' ')}
                </CheckboxLabel>
              ))}
            </CheckboxGroup>
          </div>
          
          <ButtonGroup>
            <Button 
              type="button" 
              onClick={() => navigate('/admin/users')}
            >
              <FaTimes /> Cancel
            </Button>
            
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
            >
              <FaUserShield /> Create User
            </Button>
          </ButtonGroup>
        </Form>
      </Container>
    </AdminLayout>
  );
};

export default AddUser;

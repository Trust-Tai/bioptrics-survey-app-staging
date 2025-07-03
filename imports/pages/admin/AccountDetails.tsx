import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const Container = styled.div<{ theme?: any }>`
  background: ${({ theme }) => theme?.colors?.background || '#ffffff'};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 20px;
  margin-bottom: 16px;
  max-width: 600px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const PageTitle = styled.h1<{ theme?: any }>`
  font-size: 22px;
  color: ${({ theme }) => theme?.colors?.text || '#212529'};
  margin: 0 0 8px 0;
  font-weight: 700;
`;

const PageSubtitle = styled.p<{ theme?: any }>`
  font-size: 14px;
  color: ${({ theme }) => theme?.colors?.secondary || '#6c757d'};
  margin: 0;
  max-width: 500px;
  margin: 0 auto;
`;

const SelectedPlanCard = styled.div<{ theme?: any }>`
  background: ${({ theme }) => `${theme?.colors?.primary || '#007bff'}15`};
  border: 2px solid ${({ theme }) => theme?.colors?.primary || '#007bff'};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: center;
`;

const PlanTitle = styled.h3<{ theme?: any }>`
  font-size: 16px;
  color: ${({ theme }) => theme?.colors?.primary || '#007bff'};
  margin: 0 0 6px 0;
  font-weight: 600;
`;

const PlanPrice = styled.div<{ theme?: any }>`
  font-size: 20px;
  color: ${({ theme }) => theme?.colors?.text || '#212529'};
  font-weight: 700;
  margin-bottom: 6px;
`;

const PlanBilling = styled.div<{ theme?: any }>`
  font-size: 12px;
  color: ${({ theme }) => theme?.colors?.secondary || '#6c757d'};
`;

const FormContainer = styled.div`
  margin-bottom: 20px;
`;

const ContinueButton = styled.button<{ theme?: any }>`
  background: linear-gradient(135deg, ${({ theme }) => theme?.colors?.primary || '#007bff'}, ${({ theme }) => theme?.colors?.secondary || '#6c757d'});
  color: ${({ theme }) => (theme?.colors?.background === '#000000' ? theme?.colors?.text : '#ffffff') || '#ffffff'};
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  width: 100%;
  max-width: 250px;
  margin: 0 auto;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px ${({ theme }) => theme?.colors?.primary || '#007bff'}4D;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
`;

interface AccountData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

interface UserEmail {
  address: string;
  verified?: boolean;
}

interface MeteorUser {
  _id: string;
  profile?: UserProfile;
  emails?: UserEmail[];
  createdAt?: Date;
}

const AccountDetails: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [formData, setFormData] = useState<AccountData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load selected plan from localStorage
    const planData = localStorage.getItem('selectedPlan');
    if (planData) {
      try {
        setSelectedPlan(JSON.parse(planData));
      } catch (error) {
        console.error('Error parsing selected plan:', error);
      }
    }

    // Load user data
    const user = Meteor.user() as MeteorUser | null;
    if (user) {
      const userData = {
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        email: user.emails?.[0]?.address || '',
        company: user.profile?.company || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        country: user.profile?.country || '',
        postalCode: user.profile?.postalCode || '',
      };
      setFormData(userData);
      
      // Check if user has basic required info
      const hasBasicInfo = !!(userData.firstName && userData.lastName && userData.email);
      setSaved(hasBasicInfo);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false); // Mark as unsaved when user makes changes
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    Meteor.call('users.updateProfile', formData, (error: any) => {
      setLoading(false);
      if (error) {
        setMessage('Error updating account details: ' + error.reason);
        setSaved(false);
      } else {
        setMessage('Account details saved successfully!');
        setSaved(true);
        setTimeout(() => setMessage(''), 3000);
      }
    });
  };

  const handleContinueToBilling = () => {
    if (!saved) {
      alert('Please save your account details before continuing to billing.');
      return;
    }
    
    // Navigate to billing page
    navigate('/admin/profile/billing?tab=plan');
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email;

  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <PageTitle>Account Details</PageTitle>
          <PageSubtitle>
            Please provide your account information to continue with your subscription.
          </PageSubtitle>
        </PageHeader>

        {selectedPlan && (
          <SelectedPlanCard>
            <PlanTitle>Selected Plan: {selectedPlan.name}</PlanTitle>
            <PlanPrice>{selectedPlan.price}</PlanPrice>
            <PlanBilling>{selectedPlan.billing}</PlanBilling>
          </SelectedPlanCard>
        )}

        <FormContainer>
          {saved && (
            <SuccessMessage>
              <FaCheckCircle />
              Account details are saved and ready for billing.
            </SuccessMessage>
          )}
          
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.text, fontWeight: 500 }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${colors.accent}`,
                    borderRadius: '4px',
                    background: colors.background,
                    color: colors.text,
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.text, fontWeight: 500 }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${colors.accent}`,
                    borderRadius: '4px',
                    background: colors.background,
                    color: colors.text,
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: colors.text, fontWeight: 500 }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.accent}`,
                  borderRadius: '4px',
                  background: `${colors.accent}20`,
                  color: colors.secondary,
                  fontSize: '13px',
                }}
              />
              <small style={{ color: colors.secondary, fontSize: '11px' }}>
                Email cannot be changed here. Contact support if needed.
              </small>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: colors.text, fontWeight: 500 }}>
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.accent}`,
                  borderRadius: '4px',
                  background: colors.background,
                  color: colors.text,
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: colors.text, fontWeight: 500 }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.accent}`,
                  borderRadius: '4px',
                  background: colors.background,
                  color: colors.text,
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: colors.text, fontWeight: 500 }}>
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${colors.accent}`,
                  borderRadius: '4px',
                  background: colors.background,
                  color: colors.text,
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.text, fontWeight: 500 }}>
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${colors.accent}`,
                    borderRadius: '4px',
                    background: colors.background,
                    color: colors.text,
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.text, fontWeight: 500 }}>
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${colors.accent}`,
                    borderRadius: '4px',
                    background: colors.background,
                    color: colors.text,
                    fontSize: '13px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, color: colors.text, fontWeight: 500 }}>
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${colors.accent}`,
                    borderRadius: '4px',
                    background: colors.background,
                    color: colors.text,
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
              <button
                type="submit"
                disabled={loading || !isFormValid}
                style={{
                  background: colors.primary,
                  color: colors.background === '#000000' ? colors.text : '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: (loading || !isFormValid) ? 'not-allowed' : 'pointer',
                  opacity: (loading || !isFormValid) ? 0.7 : 1,
                }}
              >
                {loading ? 'Saving...' : 'Save Account Details'}
              </button>
            </div>

            {message && (
              <div style={{
                marginBottom: 16,
                padding: 10,
                borderRadius: 4,
                background: message.includes('Error') ? '#f8d7da' : '#d4edda',
                color: message.includes('Error') ? '#721c24' : '#155724',
                border: message.includes('Error') ? '1px solid #f5c6cb' : '1px solid #c3e6cb',
                fontSize: 13,
                textAlign: 'center',
              }}>
                {message}
              </div>
            )}
          </form>
        </FormContainer>

        <ContinueButton 
          onClick={handleContinueToBilling}
          disabled={!saved || !isFormValid}
        >
          Continue to Billing Page
          <FaArrowRight size={16} />
        </ContinueButton>
      </Container>
    </AdminLayout>
  );
};

export default AccountDetails;
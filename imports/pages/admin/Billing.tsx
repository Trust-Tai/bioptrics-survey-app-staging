import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocation } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';

// Define types for user profile and subscription
interface BillingUserProfile {
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
}

interface Subscription {
  planName: string;
  planPrice: string;
  billing: string;
  status: string;
  nextBillingDate?: Date;
  features?: string[];
}

// Simple account details components to replace missing imports
const AccountDetailsForm: React.FC = () => (
  <div style={{ padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
    <p style={{ color: '#6c757d', margin: 0 }}>
      Account details form would be implemented here. For now, please use the Account Details page.
    </p>
  </div>
);

const AccountDetailsDisplay: React.FC = () => (
  <div style={{ padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
    <p style={{ color: '#6c757d', margin: 0 }}>
      Account details display would be implemented here. For now, please use the Account Details page.
    </p>
  </div>
);

// Simple Stripe checkout component
const StripeCheckout: React.FC<{
  planData: any;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}> = ({ planData, onPaymentSuccess, onPaymentError }) => (
  <div style={{ textAlign: 'center' }}>
    <h3>Checkout</h3>
    <p>Plan: {planData.name}</p>
    <p>Price: {planData.price}</p>
    <button 
      onClick={() => onPaymentSuccess()}
      style={{
        background: '#007bff',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: 8,
        cursor: 'pointer',
        marginRight: 8
      }}
    >
      Complete Payment (Demo)
    </button>
    <button 
      onClick={() => onPaymentError('Payment failed (demo)')}
      style={{
        background: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: 8,
        cursor: 'pointer'
      }}
    >
      Simulate Error
    </button>
  </div>
);

const menuItems = [
  { key: 'subscription', label: 'Subscription' },
  { key: 'account', label: 'Account Details' },
  { key: 'plan', label: 'Plan and Billing Info' },
  { key: 'settings', label: 'Account Settings' },
];

const Billing: React.FC = () => {
  const location = useLocation();
  const [active, setActive] = useState('account');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');
  const { colors } = useTheme();

  // Fetch user subscription data (mock implementation since UserSubscriptions doesn't exist)
  const { subscription, loading, userProfile } = useTracker(() => {
    // Mock subscription data - replace with actual subscription logic when available
    const user = Meteor.user();
    const profile = user?.profile;

    return {
      subscription: null as Subscription | null, // No subscription data available yet
      loading: false,
      userProfile: {
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        email: user?.emails?.[0]?.address || '',
        company: profile?.company || ''
      } as BillingUserProfile
    };
  }, []);

  useEffect(() => {
    // Check URL parameters for tab
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && menuItems.some(item => item.key === tab)) {
      setActive(tab);
    }

    // Load selected plan data from localStorage
    const planData = localStorage.getItem('selectedPlan');
    if (planData) {
      try {
        const parsedPlan = JSON.parse(planData);
        setSelectedPlan(parsedPlan);
      } catch (error) {
        console.error('Error parsing selected plan data:', error);
      }
    }
  }, [location.search]);

  const handlePaymentSuccess = () => {
    setPaymentStatus('success');
    setPaymentMessage('Payment successful! Your subscription is now active.');
    setShowStripeCheckout(false);
    // Clear selected plan from localStorage
    localStorage.removeItem('selectedPlan');
    setSelectedPlan(null);
    
    // Force refresh of subscription data
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('error');
    setPaymentMessage(error);
    setShowStripeCheckout(false);
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 32 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, marginBottom: 8 }}>
            Billing and Subscription
          </h1>
          <p style={{ color: colors.secondary, fontSize: 16 }}>
            Manage your account details, billing information, and subscription settings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 32 }}>
          {/* Sidebar */}
          <div style={{ 
            width: 200, 
            background: colors.background, 
            borderRadius: 12, 
            padding: 16, 
            border: `1px solid ${colors.accent}33`, 
            height: 'fit-content' 
          }}>
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.key === 'subscription') {
                    // Navigate to the subscription page
                    window.location.href = '/admin/profile/subscription';
                  } else {
                    setActive(item.key);
                  }
                }}
                style={{
                  width: '100%',
                  background: active === item.key ? colors.primary : 'transparent',
                  color: active === item.key ? (colors.background === '#000000' ? colors.text : '#fff') : colors.text,
                  border: 'none',
                  borderLeft: active === item.key ? `4px solid ${colors.accent}` : '4px solid transparent',
                  padding: '12px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginBottom: 2,
                  transition: 'background 0.15s, border-left 0.15s, color 0.15s',
                  borderRadius: 0,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div style={{ 
            flex: 1, 
            background: colors.background, 
            borderRadius: 12, 
            padding: 32, 
            border: `1px solid ${colors.accent}33`, 
            minHeight: 500 
          }}>
            {active === 'account' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontWeight: 700, fontSize: 22, margin: 0, color: colors.primary }}>
                    Account Details
                  </h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{
                      background: isEditing ? colors.accent : colors.primary,
                      color: isEditing ? colors.text : (colors.background === '#000000' ? colors.text : '#fff'),
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isEditing ? 'Cancel' : 'Edit Details'}
                  </button>
                </div>
                
                {isEditing ? <AccountDetailsForm /> : <AccountDetailsDisplay />}
              </div>
            )}
            
            {active === 'plan' && (
              <div>
                {/* User Name Header */}
                {userProfile.firstName && userProfile.lastName && (
                  <div style={{ 
                    marginBottom: 16, 
                    padding: 12, 
                    background: `${colors.primary}08`, 
                    borderRadius: 6, 
                    border: `1px solid ${colors.primary}20` 
                  }}>
                    <div style={{ 
                      fontSize: 18, 
                      fontWeight: 600, 
                      color: colors.primary,
                      textAlign: 'left'
                    }}>
                      Name: {userProfile.firstName} {userProfile.lastName}
                      {userProfile.company && (
                        <span style={{ 
                          fontSize: 14, 
                          fontWeight: 400, 
                          color: colors.secondary, 
                          marginLeft: 8 
                        }}>
                          • {userProfile.company}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: colors.primary }}>
                  Plan and Billing Info
                </h2>
                
                {selectedPlan && (
                  <div style={{ 
                    background: `${colors.primary}15`, 
                    padding: 20, 
                    borderRadius: 8, 
                    border: `2px solid ${colors.primary}`, 
                    marginBottom: 24 
                  }}>
                    <h3 style={{ color: colors.primary, fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                      🎉 Selected Plan Ready for Checkout
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: colors.text, marginBottom: 4 }}>
                          {selectedPlan.name}
                        </div>
                        <div style={{ color: colors.secondary, fontSize: 16, marginBottom: 8 }}>
                          {selectedPlan.price}/year • {selectedPlan.billing}
                        </div>
                        <div style={{ color: colors.secondary, fontSize: 14 }}>
                          Currency: {selectedPlan.currency}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button 
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                            color: colors.background === '#000000' ? colors.text : '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 24px',
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 4px 12px ${colors.primary}33`,
                          }}
                          onClick={() => {
                            setShowStripeCheckout(true);
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 6px 20px ${colors.primary}4D`;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}33`;
                          }}
                        >
                          Click to Checkout
                        </button>
                      </div>
                    </div>
                    
                    {selectedPlan.features && (
                      <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${colors.primary}33` }}>
                        <h4 style={{ color: colors.primary, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                          Features Included in {selectedPlan.name}
                        </h4>
                        <div style={{ 
                          background: colors.background, 
                          padding: 16, 
                          borderRadius: 6, 
                          border: `1px solid ${colors.accent}33`,
                          maxHeight: 200,
                          overflowY: 'auto'
                        }}>
                          {selectedPlan.features.slice(0, 8).map((feature: string, index: number) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 8, 
                              marginBottom: 8,
                              color: colors.text,
                              fontSize: 14
                            }}>
                              <span style={{ color: colors.primary }}>✓</span>
                              {feature}
                            </div>
                          ))}
                          {selectedPlan.features.length > 8 && (
                            <div style={{ 
                              color: colors.secondary, 
                              fontSize: 12, 
                              fontStyle: 'italic',
                              marginTop: 8
                            }}>
                              And {selectedPlan.features.length - 8} more features...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div style={{ background: `${colors.accent}10`, padding: 24, borderRadius: 8, border: `1px solid ${colors.accent}33` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
                    <div>
                      <h3 style={{ color: colors.primary, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                        Current Plan
                      </h3>
                      <div style={{ background: colors.background, padding: 16, borderRadius: 6, border: `1px solid ${colors.accent}33` }}>
                        {subscription ? (
                          <>
                            <div style={{ fontSize: 18, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                              {subscription.planName}
                            </div>
                            <div style={{ color: colors.secondary, fontSize: 14 }}>
                              {subscription.planPrice} • {subscription.billing}
                            </div>
                            <div style={{ 
                              display: 'inline-block',
                              background: subscription.status === 'active' ? '#d4edda' : '#f8d7da',
                              color: subscription.status === 'active' ? '#155724' : '#721c24',
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 600,
                              marginTop: 8,
                              textTransform: 'uppercase',
                            }}>
                              {subscription.status}
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: 18, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                              No Active Plan
                            </div>
                            <div style={{ color: colors.secondary, fontSize: 14 }}>
                              Choose a subscription plan to get started
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 style={{ color: colors.primary, fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                        Next Billing Date
                      </h3>
                      <div style={{ background: colors.background, padding: 16, borderRadius: 6, border: `1px solid ${colors.accent}33` }}>
                        {subscription && subscription.nextBillingDate ? (
                          <>
                            <div style={{ fontSize: 18, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                              {new Date(subscription.nextBillingDate).toLocaleDateString()}
                            </div>
                            <div style={{ color: colors.secondary, fontSize: 14 }}>
                              Auto-renewal enabled
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: 18, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                              N/A
                            </div>
                            <div style={{ color: colors.secondary, fontSize: 14 }}>
                              No active subscription
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!subscription && !selectedPlan && (
                    <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                      <button 
                        style={{
                          background: colors.primary,
                          color: colors.background === '#000000' ? colors.text : '#fff',
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 16px',
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onClick={() => window.location.href = '/admin/profile/subscription'}
                      >
                        Choose Plan
                      </button>
                      <button style={{
                        background: 'transparent',
                        color: colors.primary,
                        border: `1px solid ${colors.primary}`,
                        borderRadius: 6,
                        padding: '8px 16px',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}>
                        View Invoices
                      </button>
                    </div>
                  )}

                  {subscription && subscription.features && subscription.features.length > 0 && (
                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${colors.accent}33` }}>
                      <h4 style={{ color: colors.primary, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                        Your Plan Features
                      </h4>
                      <div style={{ 
                        background: colors.background, 
                        padding: 16, 
                        borderRadius: 6, 
                        border: `1px solid ${colors.accent}33`,
                        maxHeight: 200,
                        overflowY: 'auto'
                      }}>
                        {subscription.features.slice(0, 6).map((feature: string, index: number) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 8, 
                            marginBottom: 8,
                            color: colors.text,
                            fontSize: 14
                          }}>
                            <span style={{ color: colors.primary }}>✓</span>
                            {feature}
                          </div>
                        ))}
                        {subscription.features.length > 6 && (
                          <div style={{ 
                            color: colors.secondary, 
                            fontSize: 12, 
                            fontStyle: 'italic',
                            marginTop: 8
                          }}>
                            And {subscription.features.length - 6} more features...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {active === 'settings' && (
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: colors.primary }}>
                  Account Settings
                </h2>
                
                <div style={{ display: 'grid', gap: 24 }}>
                  <div style={{ background: `${colors.accent}10`, padding: 24, borderRadius: 8, border: `1px solid ${colors.accent}33` }}>
                    <h3 style={{ color: colors.primary, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                      Billing Preferences
                    </h3>
                    
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked />
                        <span style={{ color: colors.text, fontSize: 14 }}>
                          Send billing notifications to my email
                        </span>
                      </label>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked />
                        <span style={{ color: colors.text, fontSize: 14 }}>
                          Auto-renew subscription
                        </span>
                      </label>
                    </div>
                    
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" />
                        <span style={{ color: colors.text, fontSize: 14 }}>
                          Send usage reports monthly
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div style={{ background: colors.background, padding: 24, borderRadius: 8, border: `1px solid ${colors.accent}33` }}>
                    <h3 style={{ color: colors.primary, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                      Payment Methods
                    </h3>
                    
                    <div style={{ background: `${colors.accent}10`, padding: 16, borderRadius: 6, marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                            •••• •••• •••• 4242
                          </div>
                          <div style={{ color: colors.secondary, fontSize: 14 }}>
                            Expires 12/2027 • Primary
                          </div>
                        </div>
                        <button style={{
                          background: 'transparent',
                          color: colors.primary,
                          border: `1px solid ${colors.primary}`,
                          borderRadius: 4,
                          padding: '4px 12px',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}>
                          Edit
                        </button>
                      </div>
                    </div>
                    
                    <button style={{
                      background: colors.primary,
                      color: colors.background === '#000000' ? colors.text : '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}>
                      Add Payment Method
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stripe Checkout Modal */}
        {showStripeCheckout && selectedPlan && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              background: colors.background,
              borderRadius: 16,
              padding: 32,
              maxWidth: 500,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
            }}>
              <button
                onClick={() => setShowStripeCheckout(false)}
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'transparent',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: colors.text,
                }}
              >
                ×
              </button>
              
              <StripeCheckout 
                planData={selectedPlan}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </div>
          </div>
        )}

        {/* Payment Status Messages */}
        {(paymentStatus === 'success' || paymentStatus === 'error') && (
          <div style={{ 
            position: 'fixed', 
            bottom: 32, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            width: 'calc(100% - 64px)', 
            maxWidth: 400, 
            zIndex: 1000 
          }}>
            {paymentStatus === 'success' && (
              <div style={{ 
                background: '#d4edda', 
                color: '#155724', 
                padding: 16, 
                borderRadius: 8, 
                border: '1px solid #c3e6cb',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}>
                <span style={{ fontSize: 24 }}>✅</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    Payment Successful!
                  </div>
                  <div style={{ fontSize: 14 }}>
                    Your subscription is now active.
                  </div>
                </div>
                <button
                  onClick={() => setPaymentStatus('idle')}
                  style={{
                    marginLeft: 'auto',
                    background: 'transparent',
                    border: 'none',
                    fontSize: 18,
                    cursor: 'pointer',
                    color: '#155724',
                  }}
                >
                  ×
                </button>
              </div>
            )}
            
            {paymentStatus === 'error' && (
              <div style={{ 
                background: '#f8d7da', 
                color: '#721c24', 
                padding: 16, 
                borderRadius: 8, 
                border: '1px solid #f5c6cb',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}>
                <span style={{ fontSize: 24 }}>❌</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    Payment Failed
                  </div>
                  <div style={{ fontSize: 14 }}>
                    {paymentMessage}
                  </div>
                </div>
                <button
                  onClick={() => setPaymentStatus('idle')}
                  style={{
                    marginLeft: 'auto',
                    background: 'transparent',
                    border: 'none',
                    fontSize: 18,
                    cursor: 'pointer',
                    color: '#721c24',
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Billing;


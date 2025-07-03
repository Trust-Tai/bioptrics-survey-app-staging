import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import styled from 'styled-components';
import { FaCheck, FaArrowRight } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

const Container = styled.div<{ theme?: any }>`
  background: ${({ theme }) => theme?.colors?.background || '#ffffff'};
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 16px;
  margin-bottom: 16px;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1<{ theme?: any }>`
  font-size: 24px;
  color: ${({ theme }) => theme?.colors?.text || '#212529'};
  margin: 0 0 8px 0;
  font-weight: 700;
`;

const PageSubtitle = styled.p<{ theme?: any }>`
  font-size: 14px;
  color: ${({ theme }) => theme?.colors?.secondary || '#6c757d'};
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
`;

const CurrencySection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
`;

const CurrencyWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CurrencyLabel = styled.label<{ theme?: any }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme?.colors?.text || '#212529'};
`;

const CurrencySelect = styled.select<{ theme?: any }>`
  padding: 12px 16px;
  border: 2px solid ${({ theme }) => theme?.colors?.accent || '#e9ecef'};
  border-radius: 8px;
  font-size: 16px;
  background: ${({ theme }) => theme?.colors?.background || '#ffffff'};
  color: ${({ theme }) => theme?.colors?.text || '#212529'};
  min-width: 200px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme?.colors?.primary || '#007bff'};
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 16px;
`;

const ProductCard = styled.div<{ theme?: any }>`
  background: ${({ theme }) => theme?.colors?.background || '#ffffff'};
  border: 2px solid ${({ theme }) => theme?.colors?.accent || '#e9ecef'};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  height: fit-content;
  max-height: 600px;
  overflow: hidden;
  
  &:hover {
    border-color: ${({ theme }) => theme?.colors?.primary || '#007bff'};
    box-shadow: 0 4px 20px ${({ theme }) => theme?.colors?.primary || '#007bff'}33;
    transform: translateY(-2px);
  }
`;

const ProductBadge = styled.div<{ theme?: any }>`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, ${({ theme }) => theme?.colors?.primary || '#007bff'}, ${({ theme }) => theme?.colors?.secondary || '#6c757d'});
  color: ${({ theme }) => (theme?.colors?.background === '#000000' ? theme?.colors?.text : '#ffffff') || '#ffffff'};
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductTitle = styled.h3<{ theme?: any }>`
  font-size: 18px;
  color: ${({ theme }) => theme?.colors?.text || '#212529'};
  margin: 0 0 12px 0;
  font-weight: 700;
`;

const ProductPrice = styled.div`
  margin: 16px 0;
`;

const PriceAmount = styled.div<{ theme?: any }>`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme?.colors?.primary || '#007bff'};
  margin-bottom: 4px;
`;

const PricePeriod = styled.div<{ theme?: any }>`
  font-size: 14px;
  color: ${({ theme }) => theme?.colors?.secondary || '#6c757d'};
  margin-bottom: 4px;
`;

const PriceNote = styled.div<{ theme?: any }>`
  font-size: 14px;
  color: ${({ theme }) => theme?.colors?.accent || '#e9ecef'};
  font-style: italic;
`;

const ProductDescription = styled.p<{ theme?: any }>`
  font-size: 14px;
  color: ${({ theme }) => theme?.colors?.secondary || '#6c757d'};
  line-height: 1.4;
  margin: 0 0 16px 0;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  text-align: left;
  max-height: 200px;
  overflow-y: auto;
`;

const FeatureItem = styled.li<{ theme?: any }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 13px;
  color: ${({ theme }) => theme?.colors?.text || '#212529'};
`;

const FeatureIcon = styled.div<{ theme?: any }>`
  color: ${({ theme }) => theme?.colors?.primary || '#007bff'};
  flex-shrink: 0;
`;

const SubscribeButton = styled.button<{ theme?: any }>`
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
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px ${({ theme }) => theme?.colors?.primary || '#007bff'}4D;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const currencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'GBP', name: 'British Pounds', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' }
];

const exchangeRates = {
  USD: 1,
  CAD: 1.35,
  GBP: 0.79,
  EUR: 0.92
};

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const getCurrentCurrency = () => {
    return currencies.find(c => c.code === selectedCurrency) || currencies[0];
  };

  const formatPrice = (basePrice: number) => {
    const currency = getCurrentCurrency();
    const convertedPrice = Math.round(basePrice * exchangeRates[selectedCurrency as keyof typeof exchangeRates]);
    return `${currency.symbol}${convertedPrice.toLocaleString()}`;
  };

  const handleSubscribe = (productType: string) => {
    // Handle Contact Us differently for the course product
    if (productType === 'Survey + Bioptrics Course') {
      // Open contact form or redirect to contact page
      window.open('mailto:contact@bioptrics.com?subject=Survey + Bioptrics Course Inquiry&body=I am interested in learning more about the Survey + Bioptrics Course package. Please contact me with pricing and details.', '_blank');
      return;
    }

    // Get current plan details
    const planName = productType;
    const basePrice = productType === 'WPS Only' ? 1000 : 2399;
    const price = formatPrice(basePrice);
    const currency = getCurrentCurrency();
    
    // Create plan data object
    const planData = {
      name: planName,
      price: price,
      currency: currency.code,
      billing: 'Monthly billing',
      features: productType === 'WPS Only' ? wpsFeatures : enterpriseFeatures
    };
    
    // Store plan data in localStorage for the account details and billing pages
    localStorage.setItem('selectedPlan', JSON.stringify(planData));
    
    // Navigate to account details page first to collect customer information
    navigate('/admin/profile/account');
  };

  const wpsFeatures = [
    'Complete Whole-Person Safety framework',
    'Pre-built safety assessment surveys',
    'Real-time safety analytics dashboard',
    'Employee safety risk profiling',
    'Incident prediction modeling',
    'Safety culture measurement tools',
    'Regulatory compliance tracking',
    'Mobile safety app access',
    'Basic customer support'
  ];

  const enterpriseFeatures = [
    'Everything in WPS Only plan',
    'Custom survey builder and editor',
    'Company-specific question libraries',
    'Advanced branching and logic',
    'White-label survey deployment',
    'Custom branding and themes',
    'Advanced analytics and reporting',
    'API access for integrations',
    'Multi-department management',
    'Priority customer support',
    'Dedicated account manager',
    'Custom training sessions'
  ];

  const courseFeatures = [
    'Complete survey platform access',
    'Comprehensive Bioptrics methodology training',
    'Interactive online course modules',
    'Live instructor-led sessions',
    'Certification upon completion',
    'Access to exclusive research materials',
    'Community forum for practitioners',
    'Ongoing mentorship opportunities',
    'Case study analysis workshops',
    'Advanced analytics interpretation',
    'Custom implementation guidance',
    'Lifetime access to course updates'
  ];

  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <PageTitle>Choose Your Subscription Plan</PageTitle>
          <PageSubtitle>
            Select the perfect plan for your organization's safety and survey needs.
            All plans include our core analytics and reporting features.
          </PageSubtitle>
        </PageHeader>

        <CurrencySection>
          <CurrencyWrapper>
            <CurrencyLabel htmlFor="currency-select">Currency:</CurrencyLabel>
            <CurrencySelect
              id="currency-select"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} ({currency.name})
                </option>
              ))}
            </CurrencySelect>
          </CurrencyWrapper>
        </CurrencySection>

        <ProductsGrid>
          {/* WPS Only Plan */}
          <ProductCard>
            <ProductTitle>Whole-Person Safety (WPS) Only</ProductTitle>
            <ProductPrice>
              <PriceAmount>{formatPrice(1000)}</PriceAmount>
              <PricePeriod>per month</PricePeriod>
            </ProductPrice>
            <ProductDescription>
              Comprehensive safety assessment platform with our proven WPS framework. 
              Perfect for organizations focused on employee safety and risk management.
            </ProductDescription>
            <FeaturesList>
              {wpsFeatures.map((feature, index) => (
                <FeatureItem key={index}>
                  <FeatureIcon>
                    <FaCheck size={16} />
                  </FeatureIcon>
                  {feature}
                </FeatureItem>
              ))}
            </FeaturesList>
            <SubscribeButton onClick={() => handleSubscribe('WPS Only')}>
              Subscribe to WPS Only
              <FaArrowRight size={16} />
            </SubscribeButton>
          </ProductCard>

          {/* Enterprise Edition */}
          <ProductCard>
            <ProductBadge>Most Popular</ProductBadge>
            <ProductTitle>Enterprise Edition</ProductTitle>
            <ProductPrice>
              <PriceAmount>{formatPrice(2399)}</PriceAmount>
              <PricePeriod>per month</PricePeriod>
            </ProductPrice>
            <ProductDescription>
              Complete survey platform with WPS framework plus custom survey creation capabilities. 
              Build company-specific surveys tailored to your unique organizational needs.
            </ProductDescription>
            <FeaturesList>
              {enterpriseFeatures.map((feature, index) => (
                <FeatureItem key={index}>
                  <FeatureIcon>
                    <FaCheck size={16} />
                  </FeatureIcon>
                  {feature}
                </FeatureItem>
              ))}
            </FeaturesList>
            <SubscribeButton onClick={() => handleSubscribe('Enterprise Edition')}>
              Subscribe to Enterprise
              <FaArrowRight size={16} />
            </SubscribeButton>
          </ProductCard>

          {/* Survey + Bioptrics Course */}
          <ProductCard>
            <ProductTitle>Survey + Bioptrics Course</ProductTitle>
            <ProductPrice>
              <PriceAmount>Custom Pricing</PriceAmount>
            </ProductPrice>
            <ProductDescription>
              Engage in our comprehensive course combining survey methodology with Bioptrics' innovative approaches. 
              Ideal for professionals seeking in-depth knowledge and practical skills.
            </ProductDescription>
            <FeaturesList>
              {courseFeatures.map((feature, index) => (
                <FeatureItem key={index}>
                  <FeatureIcon>
                    <FaCheck size={16} />
                  </FeatureIcon>
                  {feature}
                </FeatureItem>
              ))}
            </FeaturesList>
            <SubscribeButton onClick={() => handleSubscribe('Survey + Bioptrics Course')}>
              Contact Us
              <FaArrowRight size={16} />
            </SubscribeButton>
          </ProductCard>
        </ProductsGrid>
      </Container>
    </AdminLayout>
  );
};

export default Subscription;
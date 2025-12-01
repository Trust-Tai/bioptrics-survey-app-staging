import React, { useState } from 'react';
import styled from 'styled-components';
import { FileText, Edit, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { useDynamicColors } from './home/theme/useDynamicColors';

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div<{ bgColor: string }>`
  min-height: 100vh;
  background: ${props => props.bgColor};
`;

const Header = styled.div<{ primaryColor: string }>`
  background: linear-gradient(135deg, ${props => props.primaryColor} 0%, ${props => props.primaryColor}dd 100%);
  border-radius: 16px;
  padding: 32px 24px;
  margin: 24px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const HeaderText = styled.div`
  color: white;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: white;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;
`;

const SectionIconWrapper = styled.div<{ color: string }>`
  color: ${props => props.color};
  margin-top: 2px;
`;

const SectionHeaderText = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h2<{ color: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.color};
  margin: 0 0 4px 0;
`;

const SectionSubtitle = styled.p<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label<{ color: string }>`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.color};
  margin-bottom: 8px;
`;

const Input = styled.input<{ borderColor: string; focusBorderColor: string }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.focusBorderColor};
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const Select = styled.select<{ borderColor: string; focusBorderColor: string }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.focusBorderColor};
  }
`;

const Textarea = styled.textarea<{ borderColor: string; focusBorderColor: string }>`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  font-size: 15px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.focusBorderColor};
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileButton = styled.label<{ textColor: string; borderColor: string; hoverBgColor: string; hoverBorderColor: string }>`
  display: inline-block;
  padding: 10px 20px;
  background: white;
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.textColor};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.hoverBgColor};
    border-color: ${props => props.hoverBorderColor};
  }
`;

const Checkbox = styled.input`
  margin-right: 8px;
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const CheckboxLabel = styled.label<{ color: string }>`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${props => props.color};
  cursor: pointer;
  user-select: none;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

const PrimaryButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const SecondaryButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

// Footer buttons with different styling
const FooterButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding: 24px 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const FooterSecondaryButton = styled.button<{ borderColor: string; textColor: string; hoverBgColor: string }>`
  background: white;
  color: ${props => props.textColor};
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.hoverBgColor};
  }
`;

const FooterPrimaryButton = styled.button<{ bgColor: string; hoverBgColor: string }>`
  background: ${props => props.bgColor};
  color: white;
  border: 1px solid ${props => props.bgColor};
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.hoverBgColor};
    border-color: ${props => props.hoverBgColor};
  }
`;

const MultiSelectContainer = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  min-height: 120px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: white;
`;

const DepartmentOption = styled.label<{ color: string }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.color};
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  input {
    margin-right: 8px;
    cursor: pointer;
  }
`;

// ============ MAIN COMPONENT ============
const PolicyCreate: React.FC = () => {
  const navigate = useNavigate();
  const colors = useDynamicColors();
  
  // State for target audience selection
  const [targetAudience, setTargetAudience] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  
  // Sample departments list (this would typically come from an API)
  const departments = [
    'Human Resources',
    'Information Technology',
    'Finance & Accounting',
    'Marketing & Sales',
    'Operations',
    'Legal & Compliance',
    'Research & Development',
    'Customer Service',
    'Quality Assurance',
    'Administration'
  ];

  const handleCancel = () => {
    navigate('/admin/policy-review');
  };

  const handleSaveDraft = () => {
    console.log('Save as draft clicked');
    console.log('Target Audience:', targetAudience);
    console.log('Selected Departments:', selectedDepartments);
  };

  const handlePublish = () => {
    console.log('Publish policy clicked');
    console.log('Target Audience:', targetAudience);
    console.log('Selected Departments:', selectedDepartments);
  };
  
  const handleTargetAudienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetAudience(e.target.value);
    // Reset selected departments when changing audience type
    if (e.target.value !== 'dept') {
      setSelectedDepartments([]);
    }
  };
  
  const handleDepartmentChange = (departmentName: string) => {
    setSelectedDepartments(prev => {
      if (prev.includes(departmentName)) {
        return prev.filter(dept => dept !== departmentName);
      } else {
        return [...prev, departmentName];
      }
    });
  };

  return (
    <AdminLayout>
      <PageContainer bgColor={colors.white}>
        {/* Header */}
        <Header primaryColor={colors.blue}>
          <HeaderContent>
            <HeaderText>
              <Title>Create New Policy</Title>
              <Subtitle>Define policy details and distribution settings</Subtitle>
            </HeaderText>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Section 1: Policy Information */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper color={colors.blue}>
                <FileText size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle color={colors.textDark}>Policy Information</SectionTitle>
                <SectionSubtitle color={colors.textMedium}>Basic details about the policy</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <FormGroup>
              <Label color={colors.textDark}>Policy Title *</Label>
              <Input 
                placeholder="e.g., Code of Conduct 2024" 
                borderColor={colors.borderGray}
                focusBorderColor={colors.blue}
              />
            </FormGroup>

            <FormGroup>
              <Label color={colors.textDark}>Policy Category *</Label>
              <Select
                borderColor={colors.borderGray}
                focusBorderColor={colors.blue}
              >
                <option value="">Select category...</option>
                <option value="conduct">Code of Conduct</option>
                <option value="privacy">Data Privacy</option>
                <option value="safety">Safety & Security</option>
                <option value="hr">HR Policies</option>
                <option value="it">IT Policies</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label color={colors.textDark}>Effective Date *</Label>
              <Input 
                type="date" 
                borderColor={colors.borderGray}
                focusBorderColor={colors.blue}
              />
            </FormGroup>

            <FormGroup>
              <Label color={colors.textDark}>Expiry Date</Label>
              <Input 
                type="date" 
                borderColor={colors.borderGray}
                focusBorderColor={colors.blue}
              />
            </FormGroup>

            <FormGroup>
              <Label color={colors.textDark}>Policy Description *</Label>
              <Textarea 
                placeholder="Brief description of the policy..." 
                rows={4} 
                borderColor={colors.borderGray}
                focusBorderColor={colors.blue}
              />
            </FormGroup>
          </Section>

          {/* Section 2: Policy Content */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper color={colors.blue}>
                <Edit size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle color={colors.textDark}>Policy Content</SectionTitle>
                <SectionSubtitle color={colors.textMedium}>Upload document or write policy content</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <FormGroup>
              <Label color={colors.textDark}>Upload Document</Label>
              <FileButton 
                htmlFor="policy-file"
                textColor={colors.textDark}
                borderColor={colors.borderGray}
                hoverBgColor={colors.grayLight}
                hoverBorderColor={colors.blue}
              >
                📎 Choose File (PDF, DOC, DOCX)
              </FileButton>
              <FileInput id="policy-file" type="file" accept=".pdf,.doc,.docx" />
            </FormGroup>

            <FormGroup>
              <Label color={colors.textDark}>Or Write Policy Content</Label>
              <Textarea 
                placeholder="Write your policy content here..." 
                rows={10} 
                borderColor={colors.borderGray}
                focusBorderColor={colors.blue}
              />
            </FormGroup>
          </Section>

          {/* Section 3: Distribution & Acknowledgment */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper color={colors.blue}>
                <Users size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle color={colors.textDark}>Distribution & Acknowledgment</SectionTitle>
                <SectionSubtitle color={colors.textMedium}>Define who needs to review and acknowledge</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <FormGroup>
              <Label color={colors.textDark}>Target Audience *</Label>
              <Select
                value={targetAudience}
                onChange={handleTargetAudienceChange}
                borderColor={colors.borderGray}
                focusBorderColor={colors.blue}
              >
                <option value="">Select audience...</option>
                <option value="all">All Employees</option>
                <option value="dept">Specific Departments</option>
                <option value="role">Specific Roles</option>
                <option value="custom">Custom Group</option>
              </Select>
            </FormGroup>

            {/* Conditional Department Selection */}
            {targetAudience === 'dept' && (
              <FormGroup>
                <Label color={colors.textDark}>Select Departments *</Label>
                <MultiSelectContainer>
                  {departments.map((department) => (
                    <DepartmentOption key={department} color={colors.textDark}>
                      <input
                        type="checkbox"
                        checked={selectedDepartments.includes(department)}
                        onChange={() => handleDepartmentChange(department)}
                      />
                      {department}
                    </DepartmentOption>
                  ))}
                </MultiSelectContainer>
                {selectedDepartments.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '14px', color: colors.textMedium }}>
                    Selected: {selectedDepartments.join(', ')}
                  </div>
                )}
              </FormGroup>
            )}

            <FormGroup>
              <Label color={colors.textDark}>Acknowledgment Deadline</Label>
              <Input 
                type="date" 
                borderColor={colors.borderGray}
                focusBorderColor={colors.blue}
              />
            </FormGroup>

            <FormGroup>
              <CheckboxLabel color={colors.textDark}>
                <Checkbox type="checkbox" defaultChecked />
                Require acknowledgment from recipients
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel color={colors.textDark}>
                <Checkbox type="checkbox" defaultChecked />
                Send email notification to recipients
              </CheckboxLabel>
            </FormGroup>
          </Section>

          {/* Footer Buttons */}
          <FooterButtonGroup>
            <FooterSecondaryButton 
              onClick={handleCancel}
              borderColor={colors.borderGray}
              textColor={colors.textDark}
              hoverBgColor={colors.grayLight}
            >
              Cancel
            </FooterSecondaryButton>
            <FooterSecondaryButton 
              onClick={handleSaveDraft}
              borderColor={colors.blue}
              textColor={colors.blue}
              hoverBgColor={`${colors.blue}10`}
            >
              Save as Draft
            </FooterSecondaryButton>
            <FooterPrimaryButton 
              onClick={handlePublish}
              bgColor={colors.blue}
              hoverBgColor={`${colors.blue}dd`}
            >
              Publish Policy
            </FooterPrimaryButton>
          </FooterButtonGroup>
        </ContentWrapper>
      </PageContainer>
    </AdminLayout>
  );
};

export default PolicyCreate;

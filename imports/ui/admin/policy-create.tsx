import React, { useState } from 'react';
import styled from 'styled-components';
import { FileText, Edit, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { colors } from './home/theme/colors';

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${colors.white};
`;

const Header = styled.div`
  background: linear-gradient(135deg, #325b9b 0%, #4a7bc8 100%);
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

const SectionIconWrapper = styled.div`
  color: #325b9b;
  margin-top: 2px;
`;

const SectionHeaderText = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${colors.textDark};
  margin: 0 0 4px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: ${colors.textMedium};
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.textDark};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${colors.borderGray};
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #325b9b;
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${colors.borderGray};
  border-radius: 8px;
  font-size: 15px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #325b9b;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${colors.borderGray};
  border-radius: 8px;
  font-size: 15px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #325b9b;
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileButton = styled.label`
  display: inline-block;
  padding: 10px 20px;
  background: white;
  border: 1px solid ${colors.borderGray};
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: ${colors.textDark};
  transition: all 0.2s;
  
  &:hover {
    background: ${colors.grayLight};
    border-color: #325b9b;
  }
`;

const AttachedFile = styled.div`
  margin-top: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const AttachedFileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const AttachedFileName = styled.span`
  font-size: 14px;
  color: ${colors.textDark};
  font-weight: 500;
`;

const AttachedFileSize = styled.span`
  font-size: 13px;
  color: ${colors.textMedium};
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #fee;
  }
`;

const Checkbox = styled.input`
  margin-right: 8px;
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${colors.textDark};
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

// ============ MAIN COMPONENT ============
const PolicyCreate: React.FC = () => {
  const navigate = useNavigate();
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const handleCancel = () => {
    navigate('/admin/policy-review');
  };

  const handleSaveDraft = () => {
    console.log('Save as draft clicked');
    // alert('Policy saved as draft!');
  };

  const handlePublish = () => {
    console.log('Publish policy clicked');
    // alert('Policy published successfully!');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    // Reset the file input
    const fileInput = document.getElementById('policy-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <AdminLayout>
      <PageContainer>
        {/* Header */}
        <Header>
          <HeaderContent>
            <HeaderText>
              <Title>Create New Policy</Title>
              <Subtitle>Define policy details and distribution settings</Subtitle>
            </HeaderText>
            <ButtonGroup>
              <SecondaryButton onClick={handleCancel}>
                Cancel
              </SecondaryButton>
              <SecondaryButton onClick={handleSaveDraft}>
                Save as Draft
              </SecondaryButton>
              <PrimaryButton onClick={handlePublish}>
                Publish Policy
              </PrimaryButton>
            </ButtonGroup>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Section 1: Policy Information */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper>
                <FileText size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle>Policy Information</SectionTitle>
                <SectionSubtitle>Basic details about the policy</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <FormGroup>
              <Label>Policy Title *</Label>
              <Input placeholder="e.g., Code of Conduct 2024" />
            </FormGroup>

            <FormGroup>
              <Label>Policy Category *</Label>
              <Select>
                <option value="">Select category...</option>
                <option value="conduct">Code of Conduct</option>
                <option value="privacy">Data Privacy</option>
                <option value="safety">Safety & Security</option>
                <option value="hr">HR Policies</option>
                <option value="it">IT Policies</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Effective Date *</Label>
              <Input type="date" />
            </FormGroup>

            <FormGroup>
              <Label>Expiry Date</Label>
              <Input type="date" />
            </FormGroup>

            <FormGroup>
              <Label>Policy Description *</Label>
              <Textarea placeholder="Brief description of the policy..." rows={4} />
            </FormGroup>
          </Section>

          {/* Section 2: Policy Content */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper>
                <Edit size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle>Policy Content</SectionTitle>
                <SectionSubtitle>Upload document or write policy content</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <FormGroup>
              <Label>Upload Document</Label>
              <FileButton htmlFor="policy-file">
                📎 Choose File (PDF, DOC, DOCX)
              </FileButton>
              <FileInput id="policy-file" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
              {attachedFile && (
                <AttachedFile>
                  <AttachedFileInfo>
                    <span>📄</span>
                    <div>
                      <AttachedFileName>{attachedFile.name}</AttachedFileName>
                      <AttachedFileSize> ({formatFileSize(attachedFile.size)})</AttachedFileSize>
                    </div>
                  </AttachedFileInfo>
                  <RemoveFileButton onClick={handleRemoveFile}>Remove</RemoveFileButton>
                </AttachedFile>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Or Write Policy Content</Label>
              <Textarea placeholder="Write your policy content here..." rows={10} />
            </FormGroup>
          </Section>

          {/* Section 3: Distribution & Acknowledgment */}
          <Section>
            <SectionHeader>
              <SectionIconWrapper>
                <Users size={24} />
              </SectionIconWrapper>
              <SectionHeaderText>
                <SectionTitle>Distribution & Acknowledgment</SectionTitle>
                <SectionSubtitle>Define who needs to review and acknowledge</SectionSubtitle>
              </SectionHeaderText>
            </SectionHeader>

            <FormGroup>
              <Label>Target Audience *</Label>
              <Select>
                <option value="">Select audience...</option>
                <option value="all">All Employees</option>
                <option value="dept">Specific Departments</option>
                <option value="role">Specific Roles</option>
                <option value="custom">Custom Group</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Acknowledgment Deadline</Label>
              <Input type="date" />
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <Checkbox type="checkbox" defaultChecked />
                Require acknowledgment from recipients
              </CheckboxLabel>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <Checkbox type="checkbox" defaultChecked />
                Send email notification to recipients
              </CheckboxLabel>
            </FormGroup>
          </Section>
        </ContentWrapper>
      </PageContainer>
    </AdminLayout>
  );
};

export default PolicyCreate;

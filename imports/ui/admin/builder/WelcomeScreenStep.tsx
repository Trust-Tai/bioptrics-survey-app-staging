import React from 'react';
import styled from 'styled-components';
import { FiImage, FiUpload, FiX } from 'react-icons/fi';

interface WelcomeScreenStepProps {
  title: string;
  description: string;
  logoImage: string | null;
  welcomeImage: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onLogoChange: (value: string | null) => void;
  onWelcomeImageChange: (value: string | null) => void;
}

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1c1c1c;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
    box-shadow: 0 0 0 1px #b7a36a;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
    box-shadow: 0 0 0 1px #b7a36a;
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageUploadContainer = styled.div`
  border: 2px dashed #e2e8f0;
  border-radius: 4px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
  
  &:hover {
    border-color: #b7a36a;
    background-color: #f8f9fa;
  }
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #e53e3e;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const IconContainer = styled.div`
  font-size: 36px;
  color: #718096;
  margin-bottom: 8px;
`;

const UploadText = styled.div`
  font-size: 14px;
  color: #4a5568;
  margin-bottom: 4px;
`;

const UploadSubtext = styled.div`
  font-size: 12px;
  color: #718096;
`;

const HiddenInput = styled.input`
  display: none;
`;

const HelperText = styled.div`
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
`;

const WelcomeScreenStep: React.FC<WelcomeScreenStepProps> = ({
  title,
  description,
  logoImage,
  welcomeImage,
  onTitleChange,
  onDescriptionChange,
  onLogoChange,
  onWelcomeImageChange
}) => {
  // Logo image file input ref
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  
  // Welcome image file input ref
  const welcomeImageInputRef = React.useRef<HTMLInputElement>(null);
  
  // Handle logo image upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle welcome image upload
  const handleWelcomeImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onWelcomeImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div>
      <FormGroup>
        <Label htmlFor="survey-title">Survey Title*</Label>
        <Input
          id="survey-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter survey title"
          required
        />
        <HelperText>A clear, concise title for your survey</HelperText>
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="survey-description">Survey Description*</Label>
        <Textarea
          id="survey-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter survey description"
          required
        />
        <HelperText>Explain the purpose of your survey and what feedback you're looking for</HelperText>
      </FormGroup>
      
      <TwoColumnGrid>
        <FormGroup>
          <Label>Company Logo (optional)</Label>
          {logoImage ? (
            <ImagePreviewContainer>
              <ImagePreview src={logoImage} alt="Company Logo" />
              <RemoveButton onClick={() => onLogoChange(null)}>
                <FiX />
              </RemoveButton>
            </ImagePreviewContainer>
          ) : (
            <ImageUploadContainer onClick={() => logoInputRef.current?.click()}>
              <IconContainer>
                <FiImage />
              </IconContainer>
              <UploadText>Upload Logo</UploadText>
              <UploadSubtext>PNG, JPG, or SVG (max 2MB)</UploadSubtext>
            </ImageUploadContainer>
          )}
          <HiddenInput
            type="file"
            ref={logoInputRef}
            accept="image/*"
            onChange={handleLogoUpload}
          />
          <HelperText>Your company logo will appear at the top of the survey</HelperText>
        </FormGroup>
        
        <FormGroup>
          <Label>Welcome Image (optional)</Label>
          {welcomeImage ? (
            <ImagePreviewContainer>
              <ImagePreview src={welcomeImage} alt="Welcome Image" />
              <RemoveButton onClick={() => onWelcomeImageChange(null)}>
                <FiX />
              </RemoveButton>
            </ImagePreviewContainer>
          ) : (
            <ImageUploadContainer onClick={() => welcomeImageInputRef.current?.click()}>
              <IconContainer>
                <FiUpload />
              </IconContainer>
              <UploadText>Upload Welcome Image</UploadText>
              <UploadSubtext>PNG, JPG, or SVG (max 5MB)</UploadSubtext>
            </ImageUploadContainer>
          )}
          <HiddenInput
            type="file"
            ref={welcomeImageInputRef}
            accept="image/*"
            onChange={handleWelcomeImageUpload}
          />
          <HelperText>A feature image to make your survey more engaging</HelperText>
        </FormGroup>
      </TwoColumnGrid>
    </div>
  );
};

export default WelcomeScreenStep;

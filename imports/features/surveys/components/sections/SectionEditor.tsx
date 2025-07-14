import React, { useState, useEffect } from 'react';
import { FiX, FiTrash2, FiImage, FiInfo, FiAlertCircle, FiHelpCircle } from 'react-icons/fi';
import { SurveySectionItem } from '../../types';
import styled from 'styled-components';

// Styled components for the redesigned modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eaeaea;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 12px 12px 0 0;
  z-index: 1;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #552a47;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background: #f0f0f0;
    color: #552a47;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FormLabel = styled.label`
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    color: #552a47;
  }
`;

const FormInput = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #552a47;
    box-shadow: 0 0 0 2px rgba(85, 42, 71, 0.1);
  }
`;

const FormTextarea = styled.textarea`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #552a47;
    box-shadow: 0 0 0 2px rgba(85, 42, 71, 0.1);
  }
`;

const ColorPickerContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ColorPreview = styled.label<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${props => props.color};
  border: 1px solid #ddd;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  cursor: pointer;
  position: relative;
  overflow: hidden;
`;

const ColorInput = styled.input`
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  cursor: pointer;
  opacity: 0;
`;

const ColorText = styled.input`
  width: 120px;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  font-family: monospace;
`;

const CheckboxGroup = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  
  input {
    width: 18px;
    height: 18px;
    accent-color: #552a47;
  }
`;

const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
`;

const TooltipIcon = styled.div`
  color: #666;
  cursor: help;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TooltipText = styled.div`
  visibility: hidden;
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px 12px;
  width: 220px;
  font-size: 12px;
  line-height: 1.4;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  white-space: normal;
  
  &:after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
  
  ${TooltipContainer}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

const ImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ImageUploadInput = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9f9f9;
  
`;

const ImagePreviewContainer = styled.div`
position: relative;
margin-top: 8px;
border-radius: 8px;
overflow: hidden;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ImagePreview = styled.img`
width: 100%;
max-height: 200px;
object-fit: contain;
background: #f0f0f0;
display: block;
`;

const DeleteImageButton = styled.button`
position: absolute;
top: 8px;
right: 8px;
background: rgba(255, 255, 255, 0.9);
border: none;
border-radius: 50%;
width: 32px;
height: 32px;
display: flex;
align-items: center;
justify-content: center;
cursor: pointer;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
transition: all 0.2s;

&:hover {
background: white;
transform: scale(1.1);
}

svg {
color: #d9534f;
}
`;

const HelpText = styled.div`
display: flex;
align-items: center;
gap: 6px;
font-size: 12px;
color: #666;
margin-top: 6px;
`;

const ModalFooter = styled.div`
display: flex;
justify-content: flex-end;
gap: 12px;
padding: 16px 24px 24px;
border-top: 1px solid #eaeaea;
background: #f9f9f9;
border-radius: 0 0 12px 12px;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #eaeaea;
  background: #f9f9f9;
  border-radius: 0 0 12px 12px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  background: ${props => props.primary ? '#552a47' : 'white'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: 1px solid ${props => props.primary ? '#552a47' : '#ddd'};
  
  &:hover {
    background: ${props => props.primary ? '#6a3559' : '#f5f5f5'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface SectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  section?: SurveySectionItem;
  onSave: (section: SurveySectionItem) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  isOpen,
  onClose,
  section,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<SurveySectionItem> & { image?: string }>({
    name: '',
    description: '',
    isActive: true,
    isRequired: false,
    color: '#552a47',
    priority: 0,
    image: undefined,
  });
  
  // Reset form data when the modal opens with a new section
  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name || '',
        description: section.description || '',
        isActive: section.isActive ?? true,
        isRequired: section.isRequired ?? false,
        color: section.color || '#552a47',
        priority: section.priority || 0,
        instructions: section.instructions || '',
        image: section.image || undefined,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        isActive: true,
        isRequired: false,
        color: '#552a47',
        priority: 0,
        instructions: '',
        image: undefined,
      });
    }
  }, [section, isOpen]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, image: reader.result as string }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle image deletion
  const handleDeleteImage = () => {
    setFormData(prev => ({ ...prev, image: undefined }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) return;
    
    const sectionData: SurveySectionItem = {
      id: section?.id || `section_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: formData.name || '',
      description: formData.description || '',
      isActive: formData.isActive ?? true,
      isRequired: formData.isRequired ?? false,
      color: formData.color || '#552a47',
      priority: formData.priority ?? 0,
      instructions: formData.instructions || '',
      image: formData.image,
    };
    
    onSave(sectionData);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            {section ? 'Edit Section' : 'Create New Section'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX size={20} />
          </CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
          <FormGroup>
            <FormLabel>
              Section Name*
            </FormLabel>
            <FormInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter section name"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>
              Description
            </FormLabel>
            <FormTextarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter section description"
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>
              Instructions for Respondents
            </FormLabel>
            <FormTextarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              placeholder="Enter instructions for survey respondents"
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>
              <FiImage size={16} />
              Section Image
            </FormLabel>
            <ImageUploadContainer>
              {!formData.image ? (
                <ImageUploadInput htmlFor="image-upload">
                  <FiImage />
                  <span>Click to upload an image</span>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>or drag and drop</span>
                  <input
                    id="image-upload"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                    style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', overflow: 'hidden' }}
                  />
                </ImageUploadInput>
              ) : (
                <ImagePreviewContainer>
                  <ImagePreview 
                    src={formData.image} 
                    alt="Section background" 
                  />
                  <DeleteImageButton
                    type="button"
                    onClick={handleDeleteImage}
                    aria-label="Delete image"
                  >
                    <FiTrash2 size={16} />
                  </DeleteImageButton>
                </ImagePreviewContainer>
              )}
              <HelpText>
                <FiInfo size={14} />
                Recommended size: 800x600px. The image will be used as the section background.
              </HelpText>
            </ImageUploadContainer>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>
              Section Color
            </FormLabel>
            <ColorPickerContainer>
              <ColorPreview color={formData.color}>
                <ColorInput
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </ColorPreview>
              <ColorText
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
              />
            </ColorPickerContainer>
          </FormGroup>
          
          <FormGroup>
            <CheckboxGroup>
              <CheckboxLabel htmlFor="isActive">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active
                <TooltipContainer>
                  <TooltipIcon>
                    <FiHelpCircle size={14} />
                  </TooltipIcon>
                  <TooltipText>
                    When active, this section will be visible to survey respondents. Inactive sections are hidden from the survey.
                  </TooltipText>
                </TooltipContainer>
              </CheckboxLabel>
              
              <CheckboxLabel htmlFor="isRequired">
                <input
                  type="checkbox"
                  id="isRequired"
                  name="isRequired"
                  checked={formData.isRequired}
                  onChange={handleInputChange}
                />
                Required
                <TooltipContainer>
                  <TooltipIcon>
                    <FiHelpCircle size={14} />
                  </TooltipIcon>
                  <TooltipText>
                    When required, respondents must complete all questions in this section before proceeding to the next section.
                  </TooltipText>
                </TooltipContainer>
              </CheckboxLabel>
            </CheckboxGroup>
          </FormGroup>
          
          {/* Display Order field - hidden but still functional */}
          <div style={{ display: 'none' }}>
            <FormGroup>
              <FormLabel>
                Display Order
                <TooltipContainer>
                  <TooltipIcon>
                    <FiHelpCircle size={14} />
                  </TooltipIcon>
                  <TooltipText>
                    Controls the order in which sections appear in the survey. Sections with lower numbers appear first. If two sections have the same number, they will be ordered by creation date.
                  </TooltipText>
                </TooltipContainer>
              </FormLabel>
              <FormInput
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                min="0"
                style={{ width: '100px' }}
              />
            </FormGroup>
          </div>
          </ModalBody>
          
          <ModalFooter>
            <Button 
              type="button"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              primary
            >
              Save Section
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SectionEditor;

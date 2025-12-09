import styled from 'styled-components';

export const PanelContainer = styled.div`
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const PanelHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const PanelTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const TitleText = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

export const CloseButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

export const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

export const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

export const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.$active ? '#6366f1' : '#6b7280'};
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#6366f1' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    color: ${props => props.$active ? '#6366f1' : '#374151'};
    background: ${props => props.$active ? 'white' : '#f3f4f6'};
  }
`;

export const TabContent = styled.div`
  padding: 20px;
`;

export const SettingGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
  transition: all 0.2s;
  
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s;
  
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  outline: none;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

export const ColorInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 4px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 3px;
  }
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

export const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #374151;
  cursor: pointer;
`;

export const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 16px 0;
`;

export const HelpText = styled.p`
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #6b7280;
`;

export const FileListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
`;

export const FileItemCard = styled.div`
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

export const FileItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const FileItemTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

export const DeleteFileButton = styled.button`
  padding: 4px;
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #fee2e2;
  }
`;

export const AddFileButton = styled.button`
  width: 100%;
  padding: 10px;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    border-color: #9ca3af;
    background: #f9fafb;
    color: #374151;
  }
`;

export const SmallInput = styled(Input)`
  font-size: 13px;
  padding: 6px 10px;
`;

export const SectionDivider = styled.div`
  margin: 24px 0 16px 0;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

export const SectionTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

export const RangeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const RangeInput = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  appearance: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #6366f1;
    cursor: pointer;
  }
`;

export const RangeValue = styled.span`
  font-size: 13px;
  color: #6b7280;
  min-width: 40px;
  text-align: right;
`;

export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
`;

export const RadioInput = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

export const ItemTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`;

export const ItemTab = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid ${props => props.$active ? '#6366f1' : '#e5e7eb'};
  background: ${props => props.$active ? '#eef2ff' : 'white'};
  color: ${props => props.$active ? '#6366f1' : '#6b7280'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #6366f1;
    color: #6366f1;
  }
`;

export const DeleteItemButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
  
  &:hover {
    background: #fee2e2;
    border-color: #fca5a5;
  }
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dcfce7;
    border-color: #86efac;
  }
`;

// Image upload related styled components
export const ImageUploadContainer = styled.div`
  margin-bottom: 12px;
`;

export const ChangeImageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
    border-color: #d1d5db;
  }
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
`;

// Mini Rich Text Editor styled components
export const EditorContainer = styled.div`
  border: 1px solid #d1d5db;
  border-radius: 6px;
  overflow: hidden;
`;

export const EditorToolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

export const ToolbarButton = styled.button<{ $active?: boolean }>`
  padding: 6px 8px;
  background: ${props => props.$active ? '#e0e7ff' : 'transparent'};
  border: none;
  border-radius: 4px;
  color: ${props => props.$active ? '#4f46e5' : '#374151'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${props => props.$active ? '#e0e7ff' : '#e5e7eb'};
  }
`;

export const EditorContent = styled.div`
  min-height: 100px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  outline: none;

  &:empty:before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
  }

  p {
    margin: 0 0 8px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }

  ul, ol {
    margin: 0 0 8px 0;
    padding-left: 20px;
  }

  a {
    color: #6366f1;
    text-decoration: underline;
  }
`;

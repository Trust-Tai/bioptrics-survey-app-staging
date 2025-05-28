import React, { useState } from 'react';
import styled from 'styled-components';
import { FiInfo, FiEdit2, FiSave, FiEye, FiX } from 'react-icons/fi';

// Styled components
const Container = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin: 0 0 16px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
`;

const Button = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary ? '#552a47' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#552a47'};
  border: ${props => props.primary ? 'none' : '1px solid #552a47'};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? '#693658' : 'rgba(85, 42, 71, 0.1)'};
  }
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const PreviewContainer = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  border: 1px solid #eee;
`;

const PreviewTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
`;

const PreviewInstructions = styled.div`
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  white-space: pre-wrap;
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 1px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  flex: 1;
  background: ${props => props.active ? '#552a47' : '#fff'};
  color: ${props => props.active ? '#fff' : '#333'};
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    background: ${props => props.active ? '#552a47' : '#f5f5f5'};
  }
`;

const FormatToolbar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const FormatButton = styled.button`
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background: #e5e5e5;
  }
`;

const ColorPicker = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const ColorOption = styled.div<{ color: string; selected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${props => props.color};
  cursor: pointer;
  border: 2px solid ${props => props.selected ? '#333' : 'transparent'};
  
  &:hover {
    transform: scale(1.1);
  }
`;

interface SectionInstructionsEditorProps {
  sectionId: string;
  sectionName: string;
  initialInstructions: string;
  initialTimeLimit?: number;
  onSave: (instructions: string, timeLimit?: number) => void;
  onCancel: () => void;
}

const SectionInstructionsEditor: React.FC<SectionInstructionsEditorProps> = ({
  sectionId,
  sectionName,
  initialInstructions,
  initialTimeLimit,
  onSave,
  onCancel
}) => {
  const [instructions, setInstructions] = useState(initialInstructions || '');
  const [timeLimit, setTimeLimit] = useState<number | undefined>(initialTimeLimit);
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  
  const handleSave = () => {
    onSave(instructions, timeLimit);
  };
  
  const insertFormatting = (tag: string) => {
    // Get cursor position
    const textarea = document.getElementById('instructions-textarea') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = instructions.substring(start, end);
    
    let newText = '';
    
    switch (tag) {
      case 'bold':
        newText = `**${selectedText}**`;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        break;
      case 'heading':
        newText = `### ${selectedText}`;
        break;
      case 'list':
        newText = `- ${selectedText}`;
        break;
      case 'link':
        newText = `[${selectedText}](url)`;
        break;
      default:
        newText = selectedText;
    }
    
    const newInstructions = 
      instructions.substring(0, start) + 
      newText + 
      instructions.substring(end);
    
    setInstructions(newInstructions);
    
    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + newText.length,
        start + newText.length
      );
    }, 0);
  };
  
  // Simple markdown to HTML conversion for preview
  const renderMarkdown = (text: string) => {
    let html = text;
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Headings
    html = html.replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>');
    html = html.replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>');
    html = html.replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>');
    
    // Lists
    html = html.replace(/- (.*?)(\n|$)/g, '<li>$1</li>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    
    // Paragraphs
    html = html.split('\n\n').map(p => `<p>${p}</p>`).join('');
    
    return html;
  };
  
  return (
    <Container>
      <Title>Section Instructions</Title>
      
      <InfoText>
        Create clear instructions for respondents about how to complete this section.
        These instructions will appear at the beginning of the section.
      </InfoText>
      
      <ToggleGroup>
        <ToggleButton 
          active={view === 'edit'} 
          onClick={() => setView('edit')}
        >
          <FiEdit2 size={16} />
          Edit
        </ToggleButton>
        <ToggleButton 
          active={view === 'preview'} 
          onClick={() => setView('preview')}
        >
          <FiEye size={16} />
          Preview
        </ToggleButton>
      </ToggleGroup>
      
      {view === 'edit' ? (
        <>
          <FormGroup>
            <Label>Instructions</Label>
            <FormatToolbar>
              <FormatButton onClick={() => insertFormatting('bold')}>Bold</FormatButton>
              <FormatButton onClick={() => insertFormatting('italic')}>Italic</FormatButton>
              <FormatButton onClick={() => insertFormatting('heading')}>Heading</FormatButton>
              <FormatButton onClick={() => insertFormatting('list')}>List Item</FormatButton>
              <FormatButton onClick={() => insertFormatting('link')}>Link</FormatButton>
            </FormatToolbar>
            <TextArea
              id="instructions-textarea"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter instructions for this section. You can use markdown formatting."
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Time Limit (minutes, optional)</Label>
            <Input
              type="number"
              min="0"
              value={timeLimit || ''}
              onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Leave blank for no time limit"
            />
          </FormGroup>
          
          <InfoText>
            <strong>Note:</strong> If you set a time limit, respondents will be notified of the time remaining
            and the section will automatically advance when the time expires.
          </InfoText>
        </>
      ) : (
        <PreviewContainer>
          <PreviewTitle>{sectionName}</PreviewTitle>
          
          {timeLimit && (
            <div style={{ 
              marginBottom: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              fontSize: '14px',
              color: '#666'
            }}>
              <FiInfo size={16} />
              Time limit: {timeLimit} minutes
            </div>
          )}
          
          <PreviewInstructions dangerouslySetInnerHTML={{ __html: renderMarkdown(instructions) }} />
        </PreviewContainer>
      )}
      
      <ButtonGroup>
        <Button onClick={onCancel}>
          <FiX size={16} />
          Cancel
        </Button>
        <Button primary onClick={handleSave}>
          <FiSave size={16} />
          Save Instructions
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default SectionInstructionsEditor;

import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import type { RichTextBlock as RichTextBlockType } from '../../types/contentBlocks';

interface RichTextBlockProps {
  block: RichTextBlockType;
  isEditing: boolean;
  onUpdate: (settings: Partial<RichTextBlockType['settings']>) => void;
}

const RichTextContainer = styled.div<{ settings: RichTextBlockType['settings'] }>`
  min-height: 100px;
  padding: ${props => props.settings.padding || '16px'};
  font-size: ${props => props.settings.fontSize || '16px'};
  text-align: ${props => props.settings.textAlign || 'left'};
  color: ${props => props.settings.textColor || '#374151'};
  background-color: ${props => props.settings.backgroundColor || 'transparent'};
  border-radius: 4px;
  line-height: 1.6;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  
  &[contenteditable="true"] {
    outline: none;
    border: 2px dashed #cbd5e1;
    cursor: text;
    user-select: text;
    -webkit-user-select: text;
    
    &:focus {
      border-color: #6366f1;
      background-color: #fafafa;
    }
  }
  
  p {
    margin: 0 0 1em 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 0.5em 0;
    font-weight: 600;
    line-height: 1.3;
  }
  
  h1 { font-size: 2em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  
  ul, ol {
    margin: 0 0 1em 0;
    padding-left: 2em;
  }
  
  li {
    margin: 0.25em 0;
  }
  
  strong, b {
    font-weight: 600;
  }
  
  em, i {
    font-style: italic;
  }
  
  a {
    color: #6366f1;
    text-decoration: underline;
    
    &:hover {
      color: #4f46e5;
    }
  }
  
  blockquote {
    margin: 1em 0;
    padding-left: 1em;
    border-left: 4px solid #cbd5e1;
    color: #6b7280;
    font-style: italic;
  }
  
  code {
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }
`;

const EditorToolbar = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px 4px 0 0;
  flex-wrap: wrap;
`;

const ToolbarButton = styled.button<{ active?: boolean }>`
  padding: 6px 10px;
  background: ${props => props.active ? '#6366f1' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#4f46e5' : '#f3f4f6'};
    border-color: #cbd5e1;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

export const RichTextBlock: React.FC<RichTextBlockProps> = ({ block, isEditing, onUpdate }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && block.settings.content) {
      editorRef.current.innerHTML = block.settings.content;
    }
  }, [block.id]); // Only update when block ID changes (new block)

  const handleBlur = () => {
    if (editorRef.current) {
      onUpdate({ content: editorRef.current.innerHTML });
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Apply heading/paragraph style to selected text only (inline)
  const applyTextStyle = (tag: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editorRef.current?.focus();
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    // If no text selected, don't do anything
    if (!selectedText) {
      editorRef.current?.focus();
      return;
    }

    // Define styles for each tag (using absolute px values to prevent compounding)
    const styles: Record<string, { fontSize: string; fontWeight: string }> = {
      h1: { fontSize: '32px', fontWeight: '600' },
      h2: { fontSize: '24px', fontWeight: '600' },
      h3: { fontSize: '20px', fontWeight: '600' },
      p: { fontSize: '16px', fontWeight: '400' },
    };

    const style = styles[tag] || styles.p;

    // Get the selected content and extract plain text (removes nested spans)
    const plainText = selectedText;

    // Create a span with the heading style
    const span = document.createElement('span');
    span.style.fontSize = style.fontSize;
    span.style.fontWeight = style.fontWeight;
    span.textContent = plainText; // Use plain text to avoid nesting

    // Replace selection with styled span
    range.deleteContents();
    range.insertNode(span);

    // Clear selection and focus
    selection.removeAllRanges();
    editorRef.current?.focus();

    // Trigger update
    if (editorRef.current) {
      onUpdate({ content: editorRef.current.innerHTML });
    }
  };

  return (
    <div>
      {isEditing && (
        <EditorToolbar>
          <ToolbarButton onClick={() => execCommand('bold')} title="Bold">
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('italic')} title="Italic">
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('underline')} title="Underline">
            <u>U</u>
          </ToolbarButton>
          
          <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />
          
          <ToolbarButton onClick={() => applyTextStyle('h1')} title="Heading 1">
            H1
          </ToolbarButton>
          <ToolbarButton onClick={() => applyTextStyle('h2')} title="Heading 2">
            H2
          </ToolbarButton>
          <ToolbarButton onClick={() => applyTextStyle('h3')} title="Heading 3">
            H3
          </ToolbarButton>
          <ToolbarButton onClick={() => applyTextStyle('p')} title="Paragraph">
            P
          </ToolbarButton>
          
          <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />
          
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
            • List
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
            1. List
          </ToolbarButton>
          
          <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />
          
          <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
            ⬅
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
            ↔
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
            ➡
          </ToolbarButton>
          
          <div style={{ width: '1px', background: '#e5e7eb', margin: '0 4px' }} />
          
          <ToolbarButton 
            onClick={() => {
              const url = prompt('Enter link URL:');
              if (url) execCommand('createLink', url);
            }} 
            title="Insert Link"
          >
            🔗
          </ToolbarButton>
          
          <ToolbarButton onClick={() => execCommand('removeFormat')} title="Clear Formatting">
            Clear
          </ToolbarButton>
        </EditorToolbar>
      )}
      
      <RichTextContainer
        ref={editorRef}
        contentEditable={isEditing}
        onBlur={handleBlur}
        settings={block.settings}
        suppressContentEditableWarning
        onDragStart={(e) => e.stopPropagation()}
        draggable={false}
      />
    </div>
  );
};

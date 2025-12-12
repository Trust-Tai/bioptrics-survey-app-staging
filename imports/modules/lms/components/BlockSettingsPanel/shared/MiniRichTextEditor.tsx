import React from 'react';
import styled from 'styled-components';

const EditorContainer = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 2px;
  padding: 6px 8px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  flex-wrap: wrap;
`;

const ToolbarButton = styled.button`
  padding: 4px 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }
`;

const ToolbarDivider = styled.div`
  width: 1px;
  background: #e5e7eb;
  margin: 0 4px;
`;

const HeadingDropdown = styled.select`
  padding: 4px 6px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;

  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  &:focus {
    outline: none;
    border-color: #6366f1;
  }
`;

const EditorContent = styled.div`
  min-height: 100px;
  padding: 10px;
  font-size: 13px;
  line-height: 1.5;
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

  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 8px 0;
    font-weight: 600;
    &:last-child {
      margin-bottom: 0;
    }
  }

  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  h3 { font-size: 18px; }
  h4 { font-size: 16px; }
  h5 { font-size: 14px; }
  h6 { font-size: 12px; }

  ul, ol {
    margin: 0 0 8px 0;
    padding-left: 20px;
  }

  a {
    color: #6366f1;
    text-decoration: underline;
  }
`;

interface MiniRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const MiniRichTextEditor: React.FC<MiniRichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Enter content...' 
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || '';
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  const handleBlur = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
  };

  // Apply inline font-size to selected text only
  const applyInlineStyle = (fontSize: string, fontWeight: string = 'normal') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      // No text selected, do nothing
      editorRef.current?.focus();
      return;
    }

    // Create a span with the style
    const span = document.createElement('span');
    span.style.fontSize = fontSize;
    span.style.fontWeight = fontWeight;
    
    // Wrap selected content
    try {
      range.surroundContents(span);
    } catch (e) {
      // If selection spans multiple elements, extract and wrap
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
    
    // Clear selection and update
    selection.removeAllRanges();
    editorRef.current?.focus();
    
    // Trigger change
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const format = e.target.value;
    if (!format) return;

    // Font sizes for different formats
    const formats: { [key: string]: { size: string; weight: string } } = {
      'p': { size: '14px', weight: 'normal' },
      'h1': { size: '28px', weight: '600' },
      'h2': { size: '24px', weight: '600' },
      'h3': { size: '20px', weight: '600' },
      'h4': { size: '18px', weight: '600' },
      'h5': { size: '16px', weight: '600' },
      'h6': { size: '14px', weight: '600' },
    };

    const style = formats[format];
    if (style) {
      applyInlineStyle(style.size, style.weight);
    }

    // Reset dropdown
    e.target.value = '';
  };

  return (
    <EditorContainer>
      <Toolbar>
        <ToolbarButton
          type="button"
          onClick={() => execCommand('bold')}
          style={{ fontWeight: 'bold' }}
          title="Bold"
        >
          B
        </ToolbarButton>
        <ToolbarButton
          type="button"
          onClick={() => execCommand('italic')}
          style={{ fontStyle: 'italic' }}
          title="Italic"
        >
          I
        </ToolbarButton>
        <ToolbarButton
          type="button"
          onClick={() => execCommand('underline')}
          style={{ textDecoration: 'underline' }}
          title="Underline"
        >
          U
        </ToolbarButton>
        <ToolbarDivider />
        <HeadingDropdown
          onChange={handleFormatChange}
          defaultValue=""
          title="Text Format"
        >
          <option value="" disabled>Format</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </HeadingDropdown>
        <ToolbarDivider />
        <ToolbarButton
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        >
          • List
        </ToolbarButton>
        <ToolbarButton
          type="button"
          onClick={() => {
            const url = prompt('Enter link URL:');
            if (url) execCommand('createLink', url);
          }}
          title="Insert Link"
        >
          🔗
        </ToolbarButton>
      </Toolbar>
      <EditorContent
        ref={editorRef}
        contentEditable
        onBlur={handleBlur}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </EditorContainer>
  );
};

export default MiniRichTextEditor;

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

  const formatBlock = (tag: string) => {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
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
        <ToolbarButton
          type="button"
          onClick={() => formatBlock('h3')}
          title="Heading"
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          type="button"
          onClick={() => formatBlock('p')}
          title="Paragraph"
        >
          P
        </ToolbarButton>
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

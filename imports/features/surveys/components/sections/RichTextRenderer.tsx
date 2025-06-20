import React from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

/**
 * RichTextRenderer component
 * A specialized component for rendering HTML content in survey questions
 * Handles both HTML tags and literal text representations of tags
 */
const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className }) => {
  // Process the content to handle both HTML tags and text representations
  const processContent = (rawContent: string): string => {
    if (!rawContent) return '';
    
    // First, handle cases where HTML tags are represented as text
    let processed = rawContent;
    
    // Replace literal text representations of HTML tags
    if (processed.includes('&lt;') || processed.includes('&gt;')) {
      processed = processed.replace(/&lt;/g, '<');
      processed = processed.replace(/&gt;/g, '>');
      processed = processed.replace(/&amp;/g, '&');
    }
    
    return processed;
  };

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
      style={{
        fontSize: '15px',
        fontWeight: 500,
        color: '#333',
        marginBottom: '4px',
        lineHeight: 1.4
      }}
    />
  );
};

export default RichTextRenderer;

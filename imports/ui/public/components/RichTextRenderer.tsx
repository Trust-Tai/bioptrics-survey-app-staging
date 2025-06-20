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
    
    // Handle cases where the tags are shown literally without HTML entities
    if (processed.includes('<p>') || processed.includes('<b>')) {
      // The content already has proper HTML tags, no need for further processing
      return processed;
    }
    
    // If we have text that looks like HTML tags but isn't properly formatted
    // This handles cases where the text is like "<p>text</p>" but displayed literally
    processed = processed.replace(/&lt;p&gt;/g, '<p>');
    processed = processed.replace(/&lt;\/p&gt;/g, '</p>');
    processed = processed.replace(/&lt;br&gt;/g, '<br>');
    processed = processed.replace(/&lt;b&gt;/g, '<b>');
    processed = processed.replace(/&lt;\/b&gt;/g, '</b>');
    
    return processed;
  };

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};

export default RichTextRenderer;

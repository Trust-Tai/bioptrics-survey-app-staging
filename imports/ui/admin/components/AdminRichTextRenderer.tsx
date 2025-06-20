import React from 'react';
import DOMPurify from 'dompurify';

interface AdminRichTextRendererProps {
  content: string;
  className?: string;
  truncate?: number;
}

/**
 * AdminRichTextRenderer component
 * A specialized component for rendering HTML content in admin interfaces
 * Handles both HTML tags and literal text representations of tags
 * Optionally truncates content to a specified length
 */
const AdminRichTextRenderer: React.FC<AdminRichTextRendererProps> = ({ 
  content, 
  className,
  truncate 
}) => {
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
    
    // Sanitize the HTML to prevent XSS attacks
    processed = DOMPurify.sanitize(processed);
    
    // If truncation is requested
    if (truncate && processed.length > truncate) {
      // Create a temporary div to get text content for accurate truncation
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = processed;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      if (textContent.length <= truncate) {
        return processed;
      }
      
      // Simple truncation for text content
      return textContent.substring(0, truncate) + '...';
    }
    
    return processed;
  };

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};

export default AdminRichTextRenderer;

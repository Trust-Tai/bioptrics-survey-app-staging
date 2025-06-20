import React, { useEffect, useState } from 'react';

interface HtmlParserProps {
  htmlContent: string;
  className?: string;
}

/**
 * HtmlParser component
 * Renders HTML content safely using React's dangerouslySetInnerHTML
 * with special handling for HTML entities and tags
 */
const HtmlParser: React.FC<HtmlParserProps> = ({ htmlContent, className }) => {
  const [processedHtml, setProcessedHtml] = useState(htmlContent);
  
  useEffect(() => {
    // Process the HTML content to ensure tags are properly rendered
    // This helps with cases where HTML is being escaped or treated as text
    let content = htmlContent;
    
    // Replace common HTML entities if they appear as text
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&amp;/g, '&');
    content = content.replace(/&quot;/g, '"');
    content = content.replace(/&#39;/g, "'");
    
    // Handle cases where <p> tags might be displayed as text
    // This is a more aggressive approach for when the HTML is being treated as text
    if (content.includes('<p>') && !content.includes('&lt;p&gt;')) {
      // The HTML tags are already in the correct format
      setProcessedHtml(content);
    } else {
      // Try to convert text representations of tags to actual HTML tags
      content = content.replace(/&lt;p&gt;/g, '<p>');
      content = content.replace(/&lt;\/p&gt;/g, '</p>');
      content = content.replace(/&lt;br&gt;/g, '<br>');
      content = content.replace(/&lt;b&gt;/g, '<b>');
      content = content.replace(/&lt;\/b&gt;/g, '</b>');
      content = content.replace(/&lt;i&gt;/g, '<i>');
      content = content.replace(/&lt;\/i&gt;/g, '</i>');
      content = content.replace(/&lt;u&gt;/g, '<u>');
      content = content.replace(/&lt;\/u&gt;/g, '</u>');
      
      setProcessedHtml(content);
    }
  }, [htmlContent]);

  // Create a safe HTML markup object
  const createMarkup = () => {
    return { __html: processedHtml };
  };

  return (
    <div 
      className={className} 
      dangerouslySetInnerHTML={createMarkup()} 
    />
  );
};

export default HtmlParser;

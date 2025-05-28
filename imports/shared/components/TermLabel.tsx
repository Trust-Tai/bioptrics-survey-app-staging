import React from 'react';
import { useOrganization } from '/imports/features/organization/contexts/OrganizationContext';

interface TermLabelProps {
  term: keyof ReturnType<typeof useOrganization>['settings']['terminology'];
  capitalize?: boolean;
  plural?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A component that displays customized terminology based on organization settings
 * Example usage: <TermLabel term="surveyLabel" plural />
 */
const TermLabel: React.FC<TermLabelProps> = ({ 
  term, 
  capitalize = false, 
  plural = false,
  className,
  style
}) => {
  const { getTerminology } = useOrganization();
  
  let label = getTerminology(term);
  
  // Add plural form if requested
  if (plural) {
    // Simple pluralization logic - can be enhanced for irregular plurals
    label = label.endsWith('s') ? `${label}es` : `${label}s`;
  }
  
  // Capitalize if requested
  if (capitalize) {
    label = label.charAt(0).toUpperCase() + label.slice(1);
  }
  
  return (
    <span className={className} style={style}>
      {label}
    </span>
  );
};

export default TermLabel;

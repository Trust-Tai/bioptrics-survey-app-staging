import React, { useState } from 'react';
import styled from 'styled-components';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';

/**
 * Interface for the filter state used in the analytics dashboard
 */
export interface FilterState {
  sites: string[];
  departments: string[];
  roles: string[];
  surveys: string[];
}

/**
 * Props for the AnalyticsFilterBar component
 */
export interface AnalyticsFilterBarProps {
  sites: string[];
  departments: string[];
  roles: string[];
  surveys: string[];
  selectedFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const FilterContainer = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  color: #1c1c1c;
  font-weight: 600;
  
  @media (max-width: 768px) {
    cursor: pointer;
  }
  
  svg {
    color: #666;
  }
`;

const FilterContent = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-wrap: wrap;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const FilterLabel = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
  padding-right: 10px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  
  &:hover {
    color: #333;
  }
  
  input {
    cursor: pointer;
  }
`;

const ApplyButton = styled.button`
  background: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 16px;
  transition: background 0.2s;
  
  &:hover {
    background: #6a3459;
  }
`;

/**
 * AnalyticsFilterBar component for filtering analytics data
 * Provides filter options for sites, departments, roles, and surveys
 */
const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({ 
  sites, 
  departments, 
  roles, 
  surveys, 
  selectedFilters, 
  onFilterChange 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [tempFilters, setTempFilters] = useState<FilterState>(selectedFilters);
  
  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };
  
  const handleFilterChange = (category: keyof FilterState, value: string) => {
    const currentFilters = [...tempFilters[category]];
    
    if (currentFilters.includes(value)) {
      // Remove the value if it's already selected
      const updatedFilters = currentFilters.filter(item => item !== value);
      setTempFilters({
        ...tempFilters,
        [category]: updatedFilters
      });
    } else {
      // Add the value if it's not already selected
      setTempFilters({
        ...tempFilters,
        [category]: [...currentFilters, value]
      });
    }
  };
  
  const applyFilters = () => {
    onFilterChange(tempFilters);
  };
  
  return (
    <FilterContainer>
      <FilterHeader onClick={() => toggleFilter()}>
        <FiFilter />
        <div>Filters</div>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </FilterHeader>
      
      <FilterContent isOpen={isOpen}>
        <FilterGroup>
          <FilterLabel>Sites</FilterLabel>
          <FilterOptions>
            {sites.map(site => (
              <FilterOption key={site}>
                <input 
                  type="checkbox" 
                  checked={tempFilters.sites.includes(site)}
                  onChange={() => handleFilterChange('sites', site)}
                />
                {site}
              </FilterOption>
            ))}
          </FilterOptions>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Departments</FilterLabel>
          <FilterOptions>
            {departments.map(department => (
              <FilterOption key={department}>
                <input 
                  type="checkbox" 
                  checked={tempFilters.departments.includes(department)}
                  onChange={() => handleFilterChange('departments', department)}
                />
                {department}
              </FilterOption>
            ))}
          </FilterOptions>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Roles</FilterLabel>
          <FilterOptions>
            {roles.map(role => (
              <FilterOption key={role}>
                <input 
                  type="checkbox" 
                  checked={tempFilters.roles.includes(role)}
                  onChange={() => handleFilterChange('roles', role)}
                />
                {role}
              </FilterOption>
            ))}
          </FilterOptions>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Surveys</FilterLabel>
          <FilterOptions>
            {surveys.map(survey => (
              <FilterOption key={survey}>
                <input 
                  type="checkbox" 
                  checked={tempFilters.surveys.includes(survey)}
                  onChange={() => handleFilterChange('surveys', survey)}
                />
                {survey}
              </FilterOption>
            ))}
          </FilterOptions>
        </FilterGroup>
        
        <ApplyButton onClick={applyFilters}>
          Apply Filters
        </ApplyButton>
      </FilterContent>
    </FilterContainer>
  );
};

export default AnalyticsFilterBar;

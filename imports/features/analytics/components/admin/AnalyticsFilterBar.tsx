import React, { useState } from 'react';
import styled from 'styled-components';
import { FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface FilterState {
  sites: string[];
  departments: string[];
  roles: string[];
  surveys: string[];
}

interface AnalyticsFilterBarProps {
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
  gap: 16px;
  
  @media (min-width: 769px) {
    display: flex !important;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 220px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #666;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
    box-shadow: 0 0 0 1px #552a47;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  background: ${props => props.primary ? '#552a47' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#666'};
  border: ${props => props.primary ? 'none' : '1px solid #e2e8f0'};
  
  &:hover {
    background: ${props => props.primary ? '#693658' : '#f7fafc'};
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

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
  
  // For mobile view toggle
  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };
  
  // Update temp filters
  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    let newValues: string[];
    
    if (value === 'all' || value === 'latest') {
      newValues = [value];
    } else {
      // If "all" is selected and user selects another option, remove "all"
      const currentValues = tempFilters[filterType];
      
      if (currentValues.includes('all') || currentValues.includes('latest')) {
        newValues = [value];
      } else if (currentValues.includes(value)) {
        // If already selected, remove it
        newValues = currentValues.filter(v => v !== value);
        // If empty, add "all" back
        if (newValues.length === 0) {
          newValues = filterType === 'surveys' ? ['latest'] : ['all'];
        }
      } else {
        // Add to selection
        newValues = [...currentValues, value];
      }
    }
    
    setTempFilters({
      ...tempFilters,
      [filterType]: newValues
    });
  };
  
  // Apply filters
  const applyFilters = () => {
    onFilterChange(tempFilters);
  };
  
  // Reset filters
  const resetFilters = () => {
    const defaultFilters = {
      sites: ['all'],
      departments: ['all'],
      roles: ['all'],
      surveys: ['latest']
    };
    setTempFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  return (
    <FilterContainer>
      <FilterHeader onClick={toggleFilters}>
        <FiFilter />
        <span>Filter Analytics</span>
        {/* Only show toggle icon on mobile */}
        <div style={{ marginLeft: 'auto', display: 'none', '@media (max-width: 768px)': { display: 'block' } }}>
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </FilterHeader>
      
      <FilterContent isOpen={isOpen}>
        {/* Site Filter */}
        <FilterGroup>
          <FilterLabel>Site</FilterLabel>
          <StyledSelect 
            value={tempFilters.sites[0]} 
            onChange={(e) => handleFilterChange('sites', e.target.value)}
          >
            {sites.map(site => (
              <option key={site} value={site}>{site}</option>
            ))}
          </StyledSelect>
        </FilterGroup>
        
        {/* Department Filter */}
        <FilterGroup>
          <FilterLabel>Department</FilterLabel>
          <StyledSelect 
            value={tempFilters.departments[0]} 
            onChange={(e) => handleFilterChange('departments', e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </StyledSelect>
        </FilterGroup>
        
        {/* Role Filter */}
        <FilterGroup>
          <FilterLabel>Role Level</FilterLabel>
          <StyledSelect 
            value={tempFilters.roles[0]} 
            onChange={(e) => handleFilterChange('roles', e.target.value)}
          >
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </StyledSelect>
        </FilterGroup>
        
        {/* Survey Filter */}
        <FilterGroup>
          <FilterLabel>Survey Round</FilterLabel>
          <StyledSelect 
            value={tempFilters.surveys[0]} 
            onChange={(e) => handleFilterChange('surveys', e.target.value)}
          >
            {surveys.map(survey => (
              <option key={survey} value={survey}>{survey}</option>
            ))}
          </StyledSelect>
        </FilterGroup>
        
        <ButtonContainer>
          <Button primary onClick={applyFilters}>Apply Filters</Button>
          <Button onClick={resetFilters}>Reset</Button>
        </ButtonContainer>
      </FilterContent>
    </FilterContainer>
  );
};

export default AnalyticsFilterBar;

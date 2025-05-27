import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { OrganizationSettingsCollection, OrganizationSettings } from '/imports/api/organizationSettings';

// Default organization settings
const defaultSettings: OrganizationSettings = {
  name: 'New Gold',
  primaryColor: '#b0802b',
  secondaryColor: '#402C00',
  terminology: {
    surveyLabel: 'Survey',
    questionLabel: 'Question',
    categoryLabel: 'Category',
    tagLabel: 'Tag',
    participantLabel: 'Participant',
    departmentLabel: 'Department',
    siteLabel: 'Site'
  },
  defaultSettings: {
    enableDemographics: true,
    requireComments: false,
    anonymousResponses: true,
    allowMultipleSubmissions: false
  },
  contactEmail: 'support@newgold.com',
  updatedAt: new Date(),
  updatedBy: 'system'
};

// Context interface
interface OrganizationContextType {
  settings: OrganizationSettings;
  isLoading: boolean;
  // Helper functions to get terminology
  getTerminology: (key: keyof OrganizationSettings['terminology']) => string;
  // Helper function to get colors
  getPrimaryColor: () => string;
  getSecondaryColor: () => string;
}

// Create the context
const OrganizationContext = createContext<OrganizationContextType>({
  settings: defaultSettings,
  isLoading: true,
  getTerminology: () => '',
  getPrimaryColor: () => '#b0802b',
  getSecondaryColor: () => '#402C00'
});

// Provider component
export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get organization settings from database
  const { settings, isLoading } = useTracker(() => {
    const sub = Meteor.subscribe('organizationSettings');
    const settings = OrganizationSettingsCollection.findOne() || defaultSettings;
    return {
      settings,
      isLoading: !sub.ready()
    };
  }, []);

  // Helper function to get terminology
  const getTerminology = (key: keyof OrganizationSettings['terminology']): string => {
    return settings?.terminology?.[key] || defaultSettings.terminology[key];
  };

  // Helper functions to get colors
  const getPrimaryColor = (): string => {
    return settings?.primaryColor || defaultSettings.primaryColor;
  };

  const getSecondaryColor = (): string => {
    return settings?.secondaryColor || defaultSettings.secondaryColor;
  };

  return (
    <OrganizationContext.Provider 
      value={{ 
        settings, 
        isLoading, 
        getTerminology, 
        getPrimaryColor, 
        getSecondaryColor 
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

// Custom hook to use the organization context
export const useOrganization = () => useContext(OrganizationContext);

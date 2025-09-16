import { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { SurveyThemes } from '../../../features/survey-themes/api/surveyThemes';
import { WPSCategories } from '../../../features/wps-framework/api/wpsCategories';

// Types
export interface Theme {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  headingFont?: string;
  bodyFont?: string;
  buttonStyle?: string;
  questionStyle?: string;
  templateType?: string;
  headerStyle?: string;
  isActive?: boolean;
  priority?: number;
  keywords?: string[];
  assignableTo?: string[];
  wpsCategoryId?: string;
}

export interface NewThemeData {
  name: string;
  description: string;
  color: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
  buttonStyle: string;
  questionStyle: string;
  templateType: string;
  headerStyle: string;
  isActive: boolean;
  priority: number;
  keywords: string[];
  assignableTo: string[];
  wpsCategoryId: string;
}

// Hook for managing theme operations
export const useThemeManagement = () => {
  // State for theme selection and preview
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [themeSearchQuery, setThemeSearchQuery] = useState<string>('');
  const [currentThemePage, setCurrentThemePage] = useState<number>(1);
  const themesPerPage = 10;

  // State for theme creation modal
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [newThemeName, setNewThemeName] = useState<string>('');
  const [newThemeColor, setNewThemeColor] = useState<string>('#552a47');
  const [newThemeSecondaryColor, setNewThemeSecondaryColor] = useState<string>('#8e44ad');
  const [newThemeAccentColor, setNewThemeAccentColor] = useState<string>('#9b59b6');
  const [newThemeDescription, setNewThemeDescription] = useState<string>('');
  const [newThemeWpsCategoryId, setNewThemeWpsCategoryId] = useState<string>('');
  const [newThemeAssignableTo, setNewThemeAssignableTo] = useState<string[]>(['questions', 'surveys']);
  const [newThemeKeywords, setNewThemeKeywords] = useState<string[]>([]);
  const [newThemePriority, setNewThemePriority] = useState<number>(0);
  const [newThemeIsActive, setNewThemeIsActive] = useState<boolean>(true);
  const [newThemeButtonStyle, setNewThemeButtonStyle] = useState<string>('rounded');
  const [newThemeQuestionStyle, setNewThemeQuestionStyle] = useState<string>('card');
  const [newThemeTemplateType, setNewThemeTemplateType] = useState<string>('Custom');
  const [newThemeHeadingFont, setNewThemeHeadingFont] = useState<string>('Inter');
  const [newThemeBodyFont, setNewThemeBodyFont] = useState<string>('Inter');
  const [newThemeHeaderStyle, setNewThemeHeaderStyle] = useState<string>('Solid');

  // Reference for theme preview modal
  const themePreviewContentRef = useRef<HTMLDivElement>(null);

  // Load themes and categories
  const { surveyThemes, wpsCategories, isLoading } = useTracker(() => {
    const themesSub = Meteor.subscribe('surveyThemes.all');
    const categoriesSub = Meteor.subscribe('wpsCategories.all');
    
    const isLoading = !themesSub.ready() || !categoriesSub.ready();
    
    const surveyThemes = SurveyThemes.find({}, { sort: { name: 1 } }).fetch();
    const wpsCategories = WPSCategories.find({}, { sort: { name: 1 } }).fetch();
    
    return {
      surveyThemes,
      wpsCategories,
      isLoading
    };
  }, []);

  // Theme filtering and pagination
  const getFilteredAndPaginatedThemes = () => {
    // Filter themes based on search query
    const filteredThemes = surveyThemes.filter((theme: Theme) => {
      if (!themeSearchQuery) return true;
      
      const searchLower = themeSearchQuery.toLowerCase();
      return (
        (theme.name && theme.name.toLowerCase().includes(searchLower)) ||
        (theme.description && theme.description.toLowerCase().includes(searchLower))
      );
    });

    // Calculate pagination
    const indexOfLastTheme = currentThemePage * themesPerPage;
    const indexOfFirstTheme = indexOfLastTheme - themesPerPage;
    const paginatedThemes = filteredThemes.slice(indexOfFirstTheme, indexOfLastTheme);
    
    return {
      filteredThemes,
      paginatedThemes,
      totalPages: Math.ceil(filteredThemes.length / themesPerPage)
    };
  };

  // Handle theme page change
  const handleThemePageChange = (pageNumber: number) => {
    setCurrentThemePage(pageNumber);
  };

  // Theme preview functions
  const handlePreview = (theme: Theme) => {
    setPreviewTheme(theme);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewTheme(null);
  };

  // Handle click outside theme preview
  useEffect(() => {
    function handleClickOutsideThemePreview(event: MouseEvent) {
      if (
        showPreview && 
        themePreviewContentRef.current && 
        !themePreviewContentRef.current.contains(event.target as Node)
      ) {
        closePreview();
      }
    }

    if (showPreview) {
      document.addEventListener('mousedown', handleClickOutsideThemePreview);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideThemePreview);
    };
  }, [showPreview]);

  // Create new theme
  const handleCreateTheme = async () => {
    if (!newThemeName.trim()) {
      alert('Please enter a theme name');
      return;
    }

    const themeData: NewThemeData = {
      name: newThemeName,
      description: newThemeDescription,
      color: newThemeColor,
      secondaryColor: newThemeSecondaryColor,
      accentColor: newThemeAccentColor,
      backgroundColor: '#ffffff',
      textColor: '#2c3e50',
      headingFont: newThemeHeadingFont,
      bodyFont: newThemeBodyFont,
      buttonStyle: newThemeButtonStyle,
      questionStyle: newThemeQuestionStyle,
      templateType: newThemeTemplateType,
      headerStyle: newThemeHeaderStyle,
      isActive: newThemeIsActive,
      priority: newThemePriority,
      keywords: newThemeKeywords,
      assignableTo: newThemeAssignableTo,
      wpsCategoryId: newThemeWpsCategoryId
    };

    try {
      await Meteor.callAsync('surveyThemes.create', themeData);
      
      // Reset form
      setNewThemeName('');
      setNewThemeDescription('');
      setNewThemeColor('#552a47');
      setNewThemeSecondaryColor('#8e44ad');
      setNewThemeAccentColor('#9b59b6');
      setNewThemeWpsCategoryId('');
      setNewThemeKeywords([]);
      setNewThemePriority(0);
      setNewThemeIsActive(true);
      setNewThemeButtonStyle('rounded');
      setNewThemeQuestionStyle('card');
      setNewThemeTemplateType('Custom');
      setNewThemeHeadingFont('Inter');
      setNewThemeBodyFont('Inter');
      setNewThemeHeaderStyle('Solid');
      
      // Close modal
      setShowThemeModal(false);
      
      console.log('Theme created successfully');
    } catch (error) {
      console.error('Error creating theme:', error);
      alert('Error creating theme. Please try again.');
    }
  };

  // Reset theme form
  const resetThemeForm = () => {
    setNewThemeName('');
    setNewThemeDescription('');
    setNewThemeColor('#552a47');
    setNewThemeSecondaryColor('#8e44ad');
    setNewThemeAccentColor('#9b59b6');
    setNewThemeWpsCategoryId('');
    setNewThemeKeywords([]);
    setNewThemePriority(0);
    setNewThemeIsActive(true);
    setNewThemeButtonStyle('rounded');
    setNewThemeQuestionStyle('card');
    setNewThemeTemplateType('Custom');
    setNewThemeHeadingFont('Inter');
    setNewThemeBodyFont('Inter');
    setNewThemeHeaderStyle('Solid');
  };

  return {
    // State
    selectedTheme,
    setSelectedTheme,
    previewTheme,
    setPreviewTheme,
    showPreview,
    setShowPreview,
    themeSearchQuery,
    setThemeSearchQuery,
    currentThemePage,
    setCurrentThemePage,
    themesPerPage,
    showThemeModal,
    setShowThemeModal,
    newThemeName,
    setNewThemeName,
    newThemeColor,
    setNewThemeColor,
    newThemeSecondaryColor,
    setNewThemeSecondaryColor,
    newThemeAccentColor,
    setNewThemeAccentColor,
    newThemeDescription,
    setNewThemeDescription,
    newThemeWpsCategoryId,
    setNewThemeWpsCategoryId,
    newThemeAssignableTo,
    setNewThemeAssignableTo,
    newThemeKeywords,
    setNewThemeKeywords,
    newThemePriority,
    setNewThemePriority,
    newThemeIsActive,
    setNewThemeIsActive,
    newThemeButtonStyle,
    setNewThemeButtonStyle,
    newThemeQuestionStyle,
    setNewThemeQuestionStyle,
    newThemeTemplateType,
    setNewThemeTemplateType,
    newThemeHeadingFont,
    setNewThemeHeadingFont,
    newThemeBodyFont,
    setNewThemeBodyFont,
    newThemeHeaderStyle,
    setNewThemeHeaderStyle,

    // Data
    surveyThemes,
    wpsCategories,
    isLoading,

    // Functions
    getFilteredAndPaginatedThemes,
    handleThemePageChange,
    handlePreview,
    closePreview,
    handleCreateTheme,
    resetThemeForm,
    themePreviewContentRef,
  };
};




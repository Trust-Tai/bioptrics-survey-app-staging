import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import ReactQuill from 'react-quill';
import '../../../../../ui/styles/quill-styles';
import CreatableSelect from 'react-select/creatable';
import { FiPlus } from 'react-icons/fi';
import { Meteor } from 'meteor/meteor';

// Styled components
const Panel = styled.div`
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  font-size: 14px;
  color: #495057;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 60px;
  resize: vertical;
  font-size: 14px;
`;

const QuillContainer = styled.div`
  .ql-container {
    min-height: 120px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }
  .ql-toolbar {
    border-radius: 4px 4px 0 0;
    border: 1px solid #e2e8f0;
    background: #fff;
  }
`;

const SelectContainer = styled.div`
  position: relative;
  .react-select__menu {
    z-index: 9999;
    width: 100%;
    background-color: #ffffff;
  }
  .react-select__menu-list {
    width: 100%;
    background-color: #ffffff;
  }
  .react-select__option {
    font-family: monospace;
    white-space: pre;
    background-color: #ffffff;
    &:hover {
      background-color: #f0f0f0;
    }
  }
  .react-select__multi-value {
    margin: 0 3px 3px 0;
    padding: 2px 6px;
  }
  .react-select__control {
    padding: 8px 8px 3px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
  }
`;

const ExpectationCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
`;

const ExpectationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background: #c82333;
  }
`;

const FileUploadContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadButton = styled.label`
  background-color: #552a47;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  margin: 0;
  &:hover {
    background-color: #441d38;
  }
`;

const RemoveImageButton = styled.button`
  background-color: #dc3545;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  &:hover {
    background-color: #c82333;
  }
`;

const ImagePreview = styled.div`
  padding: 6px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #ffffff;
  display: inline-block;
  margin-top: 6px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: #f5f5f5;
  border: 1px dashed #ccc;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  gap: 6px;
  width: 100%;
  &:hover {
    background: #f0f0f0;
    border-color: #999;
    color: #552a47;
  }
`;

const FormActions = styled.div`
  margin-top: 20px;
`;

const SaveButton = styled.button`
  background: #552a47;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background: #441d38;
  }
`;

const SmallText = styled.small`
  color: #666;
  font-size: 12px;
  margin-top: 5px;
  display: block;
`;

// Custom Option component for CreatableSelect
const CustomOption = ({ innerProps, label, data }: any) => (
  <div {...innerProps} style={{ padding: '8px 12px', cursor: 'pointer' }}>
    <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{label}</span>
  </div>
);

// Props interface
interface BasicSurveyWelcomeSectionProps {
  survey: any;
  setSurvey: (survey: any) => void;
  availableTags: any[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  surveyId: string | undefined;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (has: boolean) => void;
  setActiveStep: (step: string) => void;
  triggerAutoSave: () => void;
  setAlert: (alert: { type: 'success' | 'error'; message: string } | null) => void;
  silentSave: (isAutoSave: boolean) => Promise<boolean>;
}

// Component
const BasicSurveyWelcomeSection: React.FC<BasicSurveyWelcomeSectionProps> = ({
  survey,
  setSurvey,
  availableTags,
  selectedTags,
  setSelectedTags,
  surveyId,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  setActiveStep,
  triggerAutoSave,
  setAlert,
  silentSave,
}) => {
  const [saving, setSaving] = useState(false);

  // Memoized select options for tags
  const selectOptions = availableTags.map(tag => ({
    value: tag._id,
    label: tag.name,
  }));

  // Handle file upload for expectation image
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newExpectations = [...(survey?.expectations || [])];
          newExpectations[index] = {
            ...newExpectations[index],
            image: event.target?.result as string,
          };
          setSurvey({ ...survey, expectations: newExpectations });
          setHasUnsavedChanges(true);
          triggerAutoSave();
        };
        reader.readAsDataURL(file);
      }
    },
    [survey, setSurvey, setHasUnsavedChanges, triggerAutoSave]
  );

  // Handle save and continue
  const handleSaveAndContinue = async () => {
    try {
      setSaving(true);
      const saveResult = await silentSave(false);
      if (saveResult) {
        setHasUnsavedChanges(false);
        setTimeout(() => {
          setActiveStep('questions');
        }, 300);
      } else {
        setSaving(false);
      }
    } catch (error) {
      console.error('Error saving survey:', error);
      setAlert({
        type: 'error',
        message: `Error saving survey: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      setSaving(false);
    }
  };

  return (
    <Panel>
      <FormGroup>
        <Label htmlFor="surveyTitle">Title</Label>
        <Input
          type="text"
          id="surveyTitle"
          value={survey?.title || ''}
          onChange={(e) => {
            setSurvey({ ...survey, title: e.target.value });
            setHasUnsavedChanges(true);
            triggerAutoSave();
          }}
          placeholder="Enter survey title"
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="surveyDescription">Description</Label>
        <QuillContainer>
          <ReactQuill
            theme="snow"
            value={survey?.description || ''}
            onChange={(content) => {
              setSurvey({ ...survey, description: content });
              setHasUnsavedChanges(true);
              triggerAutoSave();
            }}
            placeholder="Enter survey description"
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
              ],
            }}
            formats={['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link', 'image']}
          />
        </QuillContainer>
      </FormGroup>

      {/* <FormGroup>
        <p style={{ fontSize: 15, color: '#555', margin: '0 0 16px 0' }}>
          Select tags to associate with this survey. Tags help with filtering and organizing surveys.
        </p>
        <Label htmlFor="surveyTags">Select Tags</Label>
        <SelectContainer>
          <CreatableSelect
            id="surveyTags"
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={true}
            options={selectOptions}
            value={selectOptions.filter(option => selectedTags.includes(option.value))}
            onChange={(selected) => {
              if (Array.isArray(selected)) {
                setSelectedTags(selected.map(option => option.value));
                setHasUnsavedChanges(true);
                triggerAutoSave();
              }
            }}
            onCreateOption={(inputValue) => {
              Meteor.call(
                'layers.create',
                {
                  name: inputValue,
                  color: 'var(--color-primary, #552a47)',
                  active: true,
                  location: 'Surveys',
                  fields: [],
                  id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                },
                (error: Meteor.Error, newTagId: string) => {
                  if (error) {
                    setAlert({ type: 'error', message: `Error creating tag: ${error.message}` });
                    setTimeout(() => setAlert(null), 5000);
                    return;
                  }
                  setSelectedTags([...selectedTags, newTagId]);
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                  setAlert({ type: 'success', message: `Tag "${inputValue}" created successfully!` });
                  setTimeout(() => setAlert(null), 3000);
                }
              );
            }}
            components={{ Option: CustomOption }}
            styles={{
              option: (base, state) => ({
                ...base,
                fontFamily: 'monospace',
                whiteSpace: 'pre',
                backgroundColor: state.isFocused ? '#f0f0f0' : '#ffffff',
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
                width: '100%',
                backgroundColor: '#ffffff',
              }),
              menuList: (base) => ({
                ...base,
                width: '100%',
                backgroundColor: '#ffffff',
              }),
            }}
            formatCreateLabel={(inputValue) => `Create this tag: "${inputValue}"`}
            classNamePrefix="react-select"
          />
        </SelectContainer>
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 14, color: '#666' }}>
            <strong>Selected Tags:</strong>{' '}
            {selectedTags.length > 0
              ? selectedTags
                  .map(tagId => availableTags.find(t => t._id === tagId)?.name || '')
                  .join(', ')
              : 'No tags selected'}
          </p>
        </div>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="expectationsTitle">Welcome Screen Expectations Title</Label>
        <Input
          type="text"
          id="expectationsTitle"
          value={survey?.expectationsTitle || ''}
          onChange={(e) => {
            setSurvey({ ...survey, expectationsTitle: e.target.value });
            setHasUnsavedChanges(true);
            triggerAutoSave();
          }}
          placeholder="What to expect"
        />
      </FormGroup>

      <FormGroup>
        <Label>Expectations List</Label>
        {(survey?.expectations || []).map((expectation: any, index: number) => (
          <ExpectationCard key={index}>
            <ExpectationHeader>
              <strong>Expectation {index + 1}</strong>
              <RemoveButton
                onClick={() => {
                  const newExpectations = [...(survey?.expectations || [])];
                  newExpectations.splice(index, 1);
                  setSurvey({ ...survey, expectations: newExpectations });
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
              >
                Remove
              </RemoveButton>
            </ExpectationHeader>
            <div style={{ marginBottom: 10 }}>
              <Input
                type="text"
                placeholder="Expectation title"
                value={expectation.title || ''}
                onChange={(e) => {
                  const newExpectations = [...(survey?.expectations || [])];
                  newExpectations[index] = { ...expectation, title: e.target.value };
                  setSurvey({ ...survey, expectations: newExpectations });
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <TextArea
                placeholder="Expectation description"
                value={expectation.description || ''}
                onChange={(e) => {
                  const newExpectations = [...(survey?.expectations || [])];
                  newExpectations[index] = { ...expectation, description: e.target.value };
                  setSurvey({ ...survey, expectations: newExpectations });
                  setHasUnsavedChanges(true);
                  triggerAutoSave();
                }}
              />
            </div>
            <div>
              <Label>Icon/Image (optional)</Label>
              <FileUploadContainer>
                <FileInput
                  type="file"
                  id={`expectationImage-${index}`}
                  onChange={(e) => handleFileUpload(e, index)}
                  accept="image/*"
                />
                <FileUploadButton htmlFor={`expectationImage-${index}`}>Choose Image</FileUploadButton>
                <span style={{ fontSize: '12px', color: '#6c757d' }}>
                  {expectation.image ? 'Image selected' : 'No file selected'}
                </span>
                {expectation.image && (
                  <RemoveImageButton
                    onClick={() => {
                      const newExpectations = [...(survey?.expectations || [])];
                      newExpectations[index] = { ...expectation, image: '' };
                      setSurvey({ ...survey, expectations: newExpectations });
                      setHasUnsavedChanges(true);
                      triggerAutoSave();
                    }}
                  >
                    Remove
                  </RemoveImageButton>
                )}
              </FileUploadContainer>
              {expectation.image && (
                <ImagePreview>
                  <img
                    src={expectation.image}
                    alt="Preview"
                    style={{ maxWidth: 48, maxHeight: 48, borderRadius: 4, objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </ImagePreview>
              )}
            </div>
          </ExpectationCard>
        ))}
        <AddButton
          onClick={() => {
            const newExpectations = [...(survey?.expectations || []), { title: '', description: '', image: '' }];
            setSurvey({ ...survey, expectations: newExpectations });
            setHasUnsavedChanges(true);
            triggerAutoSave();
          }}
        >
          <FiPlus size={16} /> Add Expectation
        </AddButton>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="startButtonLabel">Start Button Label</Label>
        <Input
          type="text"
          id="startButtonLabel"
          value={survey?.startButtonLabel || ''}
          onChange={(e) => {
            setSurvey({ ...survey, startButtonLabel: e.target.value });
            setHasUnsavedChanges(true);
            triggerAutoSave();
          }}
          placeholder="Start Survey"
        />
        <SmallText>This text will appear on the button that starts the survey. Default is "Start Survey".</SmallText>
      </FormGroup>

      <FormActions>
        <SaveButton onClick={handleSaveAndContinue} disabled={saving}>
          {saving ? 'Saving...' : 'Save and Continue'}
        </SaveButton>
      </FormActions> */}
    </Panel>
  );
};

export default BasicSurveyWelcomeSection;
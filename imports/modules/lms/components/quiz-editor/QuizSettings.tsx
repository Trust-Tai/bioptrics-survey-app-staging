import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Settings2, Clock, Award, RotateCcw, Shuffle, Eye, CheckCircle } from 'lucide-react';
import type { QuizSettings as QuizSettingsType } from '../../api/quizzes';

interface QuizSettingsProps {
  settings: QuizSettingsType;
  totalPoints: number;
  estimatedMinutes: number;
  onUpdate: (settings: Partial<QuizSettingsType>) => void;
  onDurationChange: (minutes: number) => void;
}

const SidebarContainer = styled.div`
  width: 400px;
  background: white;
  border-right: 1px solid #e5e7eb;
  padding: 24px;
  position: sticky;
  top: 73px;
  height: calc(100vh - 73px);
  overflow-y: auto;
  flex-shrink: 0;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
`;

const SidebarTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  svg {
    width: 16px;
    height: 16px;
    color: #6b7280;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const InputSuffix = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  input {
    flex: 1;
  }
  
  span {
    font-size: 14px;
    color: #6b7280;
    white-space: nowrap;
  }
`;

const DurationWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DurationField = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DurationInput = styled.input`
  width: 60px;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const DurationLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
  white-space: nowrap;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3b82f6;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  user-select: none;
  flex: 1;
`;

const HelpText = styled.p`
  margin: 6px 0 0 0;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 20px 0;
`;

const InfoBox = styled.div`
  padding: 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  margin-top: 12px;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #075985;
  line-height: 1.5;
`;

export const QuizSettings: React.FC<QuizSettingsProps> = ({
  settings,
  totalPoints,
  estimatedMinutes,
  onUpdate,
  onDurationChange,
}) => {
  return (
    <SidebarContainer>
      <SidebarHeader>
        <Settings2 size={20} color="#3b82f6" />
        <SidebarTitle>Quiz Settings</SidebarTitle>
      </SidebarHeader>

      {/* Time & Scoring */}
      <Section>
        <SectionTitle>
          <Clock />
          Time & Scoring
        </SectionTitle>
        
        <FormGroup>
          <Label>Time Limit</Label>
          <InputSuffix>
            <Input
              type="number"
              min="1"
              value={settings.timeLimit || 30}
              onChange={(e) => onUpdate({ timeLimit: parseInt(e.target.value) || 30 })}
            />
            <span>minutes</span>
          </InputSuffix>
          <HelpText>Maximum time allowed to complete the quiz</HelpText>
        </FormGroup>

        <FormGroup>
          <Label>Passing Score</Label>
          <InputSuffix>
            <Input
              type="number"
              min="0"
              max="100"
              value={settings.passingScore || 80}
              onChange={(e) => onUpdate({ passingScore: parseInt(e.target.value) || 80 })}
            />
            <span>%</span>
          </InputSuffix>
          <HelpText>Minimum score required to pass the quiz</HelpText>
        </FormGroup>

        <InfoBox>
          <InfoText>
            <strong>Total Points:</strong> {totalPoints} points
          </InfoText>
        </InfoBox>

        <FormGroup style={{ marginTop: '16px' }}>
          <Label>Estimated Duration</Label>
          <DurationWrapper>
            <DurationField>
              <DurationInput
                type="number"
                min="0"
                max="99"
                value={Math.floor(estimatedMinutes / 60)}
                onChange={(e) => {
                  const h = parseInt(e.target.value) || 0;
                  const m = estimatedMinutes % 60;
                  onDurationChange(Math.max(1, h * 60 + m));
                }}
                placeholder="0"
              />
              <DurationLabel>hours</DurationLabel>
            </DurationField>
            <DurationField>
              <DurationInput
                type="number"
                min="0"
                max="59"
                value={estimatedMinutes % 60}
                onChange={(e) => {
                  const h = Math.floor(estimatedMinutes / 60);
                  const m = parseInt(e.target.value) || 0;
                  onDurationChange(Math.max(1, h * 60 + m));
                }}
                placeholder="0"
              />
              <DurationLabel>min</DurationLabel>
            </DurationField>
          </DurationWrapper>
          <HelpText>Estimated time to complete this quiz (shown in course outline)</HelpText>
        </FormGroup>
      </Section>

      <Divider />

      {/* Attempt Settings */}
      <Section>
        <SectionTitle>
          <RotateCcw />
          Attempts
        </SectionTitle>

        <FormGroup>
          <Label>Maximum Attempts</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={settings.maxAttempts || 3}
            onChange={(e) => onUpdate({ maxAttempts: parseInt(e.target.value) || 3 })}
          />
          <HelpText>Number of times a student can take this quiz</HelpText>
        </FormGroup>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="allowRetakes"
            checked={settings.allowRetakes !== false}
            onChange={(e) => onUpdate({ allowRetakes: e.target.checked })}
          />
          <CheckboxLabel htmlFor="allowRetakes">
            Allow retakes after completion
          </CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="requireCompletion"
            checked={settings.requireCompletion || false}
            onChange={(e) => onUpdate({ requireCompletion: e.target.checked })}
          />
          <CheckboxLabel htmlFor="requireCompletion">
            Require all questions to be answered
          </CheckboxLabel>
        </CheckboxWrapper>
      </Section>

      <Divider />

      {/* Display Options */}
      <Section>
        <SectionTitle>
          <Shuffle />
          Display Options
        </SectionTitle>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="shuffleQuestions"
            checked={settings.shuffleQuestions || false}
            onChange={(e) => onUpdate({ shuffleQuestions: e.target.checked })}
          />
          <CheckboxLabel htmlFor="shuffleQuestions">
            Shuffle question order
          </CheckboxLabel>
        </CheckboxWrapper>
        <HelpText style={{ marginTop: '-8px', marginLeft: '28px' }}>
          Randomize the order of questions for each student
        </HelpText>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="shuffleOptions"
            checked={settings.shuffleOptions || false}
            onChange={(e) => onUpdate({ shuffleOptions: e.target.checked })}
          />
          <CheckboxLabel htmlFor="shuffleOptions">
            Shuffle answer options
          </CheckboxLabel>
        </CheckboxWrapper>
        <HelpText style={{ marginTop: '-8px', marginLeft: '28px' }}>
          Randomize multiple choice options (except "All of the above")
        </HelpText>
      </Section>

      <Divider />

      {/* Results Settings */}
      <Section>
        <SectionTitle>
          <Eye />
          Results & Feedback
        </SectionTitle>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showScoreImmediately"
            checked={settings.showScoreImmediately !== false}
            onChange={(e) => onUpdate({ showScoreImmediately: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showScoreImmediately">
            Show score immediately after submission
          </CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showCorrectAnswers"
            checked={settings.showCorrectAnswers !== false}
            onChange={(e) => onUpdate({ showCorrectAnswers: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showCorrectAnswers">
            Show correct answers after completion
          </CheckboxLabel>
        </CheckboxWrapper>

        <InfoBox>
          <InfoText>
            💡 <strong>Tip:</strong> Disable these options if you want to review submissions manually or reuse the quiz.
          </InfoText>
        </InfoBox>
      </Section>
    </SidebarContainer>
  );
};

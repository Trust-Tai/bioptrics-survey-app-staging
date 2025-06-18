import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import CustomerSatisfactionTemplate from './CustomerSatisfactionTemplate';

interface Question {
  _id: string;
  id?: string;
  text: string;
  type: string;
  sectionId?: string;
  sectionName?: string;
  options?: string[];
  scale?: number;
  labels?: string[];
  required?: boolean;
  order?: number;
}

interface ModernSurveyQuestionProps {
  question: Question;
  progress: string;
  onAnswer: (answer: any) => void;
  onBack: () => void;
  value?: any;
  color?: string;
  isLastQuestion?: boolean;
  onSubmit?: () => void;
  backgroundImage?: string;
  sectionName?: string;
  sectionDescription?: string;
}

const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  animation: fadeIn 0.5s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const QuestionCard = styled.div<{ color?: string }>`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 40px 48px;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || '#552a47'};
  }
  
  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const ProgressText = styled.div`
  font-size: 14px;
  color: #777;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const SectionName = styled.span`
  font-weight: 500;
`;

const QuestionText = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 30px 0;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 24px;
  }
`;

const RequiredIndicator = styled.span`
  color: #e74c3c;
  margin-left: 5px;
`;

const AnswerContainer = styled.div`
  margin-bottom: 40px;
  width: 100%;
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 16px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: ${props => props.color || '#552a47'};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 16px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  min-height: 150px;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: ${props => props.color || '#552a47'};
  }
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const OptionItem = styled.div<{ selected?: boolean; color?: string }>`
  padding: 16px;
  border: 2px solid ${props => props.selected ? (props.color || '#552a47') : '#ddd'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  background: ${props => props.selected ? `${props.color || '#552a47'}10` : 'white'};
  
  &:hover {
    border-color: ${props => props.color || '#552a47'};
    background: ${props => props.selected ? `${props.color || '#552a47'}10` : `${props.color || '#552a47'}05`};
  }
`;

const OptionCheckmark = styled.div<{ selected?: boolean; color?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? (props.color || '#552a47') : '#ddd'};
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: ${props => props.selected ? (props.color || '#552a47') : 'transparent'};
`;

const OptionText = styled.div`
  font-size: 16px;
  color: #333;
`;

const ScaleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ScaleOptions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ScaleOption = styled.div<{ selected?: boolean; color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? (props.color || '#552a47') : '#ddd'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? (props.color || '#552a47') : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  font-weight: ${props => props.selected ? '600' : 'normal'};
  
  &:hover {
    border-color: ${props => props.color || '#552a47'};
    background: ${props => props.selected ? (props.color || '#552a47') : `${props.color || '#552a47'}10`};
  }
`;

const ScaleLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const ScaleLabel = styled.div`
  font-size: 14px;
  color: #666;
  text-align: center;
  max-width: 80px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const Button = styled.button<{ primary?: boolean; btnColor?: string }>`
  background: ${props => props.primary ? (props.btnColor || '#552a47') : 'transparent'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: ${props => props.primary ? 'none' : '2px solid #ddd'};
  border-radius: 50px;
  padding: ${props => props.primary ? '14px 28px' : '12px 24px'};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.primary ? (props.btnColor ? `${props.btnColor}dd` : '#6d3a5e') : '#f5f5f5'};
    transform: ${props => props.primary ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.primary ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-top: 8px;
`;

const ModernSurveyQuestion: React.FC<ModernSurveyQuestionProps> = (props) => {
  return <CustomerSatisfactionTemplate {...props} />;
};

export default ModernSurveyQuestion;

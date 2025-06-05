import React, { useState } from 'react';
import { EnhancedQuestionPreviewModal } from './EnhancedQuestionPreviewModal';
import { FaEye, FaMobileAlt, FaTabletAlt, FaDesktop } from 'react-icons/fa';
import './QuestionBuilderPreview.css';

interface Question {
  _id?: string;
  text: string;
  description?: string;
  answerType: string;
  answers?: any[];
  required?: boolean;
  image?: string;
  feedback?: string;
  [key: string]: any;
}

interface QuestionBuilderPreviewProps {
  question: Question;
  onClose?: () => void;
}

/**
 * Component for previewing a question with enhanced preview options
 */
const QuestionBuilderPreview: React.FC<QuestionBuilderPreviewProps> = ({
  question,
  onClose
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleOpenPreview = (device: 'desktop' | 'tablet' | 'mobile' = 'desktop') => {
    setPreviewDevice(device);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <div className="question-builder-preview">
        <div className="preview-buttons">
          <button
            className="preview-button desktop"
            onClick={() => handleOpenPreview('desktop')}
            title="Preview on Desktop"
          >
            <FaDesktop />
            <span>Desktop</span>
          </button>
          <button
            className="preview-button tablet"
            onClick={() => handleOpenPreview('tablet')}
            title="Preview on Tablet"
          >
            <FaTabletAlt />
            <span>Tablet</span>
          </button>
          <button
            className="preview-button mobile"
            onClick={() => handleOpenPreview('mobile')}
            title="Preview on Mobile"
          >
            <FaMobileAlt />
            <span>Mobile</span>
          </button>
        </div>
        
        <button
          className="preview-all-button"
          onClick={() => handleOpenPreview()}
          title="Preview Question"
        >
          <FaEye /> Preview Question
        </button>
      </div>
      
      {isPreviewOpen && (
        <EnhancedQuestionPreviewModal
          question={question}
          onClose={handleClosePreview}
          initialDevice={previewDevice}
        />
      )}
    </>
  );
};

export default QuestionBuilderPreview;

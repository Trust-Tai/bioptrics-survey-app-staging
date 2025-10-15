import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: string[];
  title?: string;
}

const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  isOpen,
  onClose,
  errors,
  title = "Validation Errors"
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '0',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        zIndex: 1000
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#fef2f2'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2'
            }}>
              <FiAlertTriangle size={18} color="#dc2626" />
            </div>
            <h3 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#dc2626'
            }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <p style={{ 
            marginBottom: '16px', 
            color: '#374151',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            Please fix the following issues before saving your survey:
          </p>
          
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <ul style={{ 
              margin: 0,
              paddingLeft: '20px',
              listStyleType: 'disc'
            }}>
              {errors.map((error, index) => (
                <li key={index} style={{ 
                  marginBottom: '8px', 
                  color: '#dc2626',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  {error}
                </li>
              ))}
            </ul>
          </div>

          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: '#0369a1',
              lineHeight: '1.4'
            }}>
              💡 <strong>Tip:</strong> Add questions to empty sections by clicking "Choose from Question Bank" or "Create Question" within each section.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#552a47',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#6a3559';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#552a47';
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
};

export default ValidationErrorModal;

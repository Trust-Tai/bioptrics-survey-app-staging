import React, { useState, useEffect, useCallback } from 'react';
import { wpsQuestions } from '../../api/wpsQuestionBank';
import { Modal, Button } from 'react-bootstrap';
import { buildJSONExport } from '/imports/utils/wpsExport';
import wpsSurveyTemplate from '/imports/api/wpsSurveyTemplate.json';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

interface BuildModalProps {
  show: boolean;
  onHide: () => void;
  wpsids: string[];
  onImportSuccess?: () => void; // New prop for refreshing surveys list
}
// Helper to extract unique indicators and their descriptions from questionsByWPSID
function getUniqueIndicatorsWithDescriptions(
  questionsByWPSID: Record<string, { indicator?: string | undefined, indicatorShows?: string | undefined }>
) {
  const seen = new Set<string>();
  const indicators: { indicator: string; description?: string }[] = [];
  Object.values(questionsByWPSID).forEach(q => {
    if (q.indicator && !seen.has(q.indicator)) {
      seen.add(q.indicator);
      indicators.push({ indicator: q.indicator, description: q.indicatorShows });
    }
  });
  return indicators;
}

// Helper to count questions for each indicator, for a specific group
function getIndicatorQuestionCountsByGroup(
  questionsByWPSID: Record<string, { leader?: string; workforce?: string; indicator?: string }>,
  group: 'Leaders' | 'Workforce'
) {
  // Map: indicator -> count
  const counts: Record<string, number> = {};
  Object.values(questionsByWPSID).forEach(q => {
    if (!q.indicator) return;
    const hasQuestion = group === 'Leaders' ? q.leader : q.workforce;
    if (hasQuestion) {
      if (!counts[q.indicator]) counts[q.indicator] = 0;
      counts[q.indicator] += 1;
    }
  });
  return counts;
}

// (removed duplicate import)
// ...existing code...

// Helper to get questions for an indicator and group
function getQuestionsForIndicator(
  questionsByWPSID: Record<string, { leader?: string; workforce?: string; indicator?: string }>,
  indicator: string,
  group: 'Leaders' | 'Workforce'
) {
  const questions: string[] = [];
  Object.values(questionsByWPSID).forEach(q => {
    if (q.indicator === indicator) {
      if (group === 'Leaders' && q.leader) questions.push(q.leader);
      if (group === 'Workforce' && q.workforce) questions.push(q.workforce);
    }
  });
  return questions;
}

// Helper to render the indicator list for a specific group, with expand/collapse, smooth transitions, hover underline, and description
function renderIndicatorListByGroup(
  questionsByWPSID: Record<string, { leader?: string; workforce?: string; indicator?: string; indicatorShows?: string }>,
  group: 'Leaders' | 'Workforce',
  expandedIndicators: Record<string, boolean>,
  onToggle: (indicator: string) => void
) {
  const indicatorsWithDesc = getUniqueIndicatorsWithDescriptions(questionsByWPSID);
  const indicatorCounts = getIndicatorQuestionCountsByGroup(questionsByWPSID, group);
  if (indicatorsWithDesc.length === 0) {
    return <div className="text-muted">No indicators found for selected WPSIDs.</div>;
  }
  let idx = 0;
  return indicatorsWithDesc.map(({ indicator, description }) => {
    const count = indicatorCounts[indicator] || 0;
    if (count === 0) return null;
    idx++;
    const isExpanded = !!expandedIndicators[indicator + group];
    const questions = getQuestionsForIndicator(questionsByWPSID, indicator, group);
    return (
      <div key={indicator + group}>
        <div
          style={{
            padding: '12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'background 0.2s',
          }}
          className="indicator-row"
          onClick={() => onToggle(indicator + group)}
        >
          <span
            style={{
              minWidth: 32,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 15,
              color: '#6c47b6',
              borderRight: '2px solid #e0e0e0',
              paddingRight: 16,
              marginRight: 8,
              lineHeight: 1,
            }}
          >
            {idx}
          </span>
          <span
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
            }}
            className="indicator-label-wrapper"
            onMouseEnter={e => {
              const title = e.currentTarget.querySelector('.indicator-title');
              if (title) (title as HTMLElement).style.textDecoration = 'underline';
            }}
            onMouseLeave={e => {
              const title = e.currentTarget.querySelector('.indicator-title');
              if (title) (title as HTMLElement).style.textDecoration = 'none';
            }}
          >
            <span
              className="indicator-title"
              style={{
                wordBreak: 'break-word',
                whiteSpace: 'pre-line',
                fontSize: 15,
                lineHeight: 1.6,
                textDecoration: 'none',
                transition: 'text-decoration 0.3s',
                color: 'inherit',
              }}
            >
              {indicator}
              <span style={{ color: '#888', fontWeight: 400, marginLeft: 12 }}>({count} question{count !== 1 ? 's' : ''})</span>
            </span>
            {description && (
              <div style={{ fontStyle: 'italic', color: '#555', fontSize: 14, marginTop: 2, textDecoration: 'none' }}>{description}</div>
            )}
          </span>
          <span style={{ fontSize: 18, color: '#6c47b6', marginLeft: 8, transition: 'transform 0.2s' }}>
            <svg style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 5L13 10L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        <div
          style={{
            maxHeight: isExpanded && questions.length > 0 ? 500 : 0,
            opacity: isExpanded && questions.length > 0 ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.7s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div style={{ marginLeft: 56, marginTop: 2, marginBottom: 8 }}>
            {questions.map((q, qidx) => (
              <div key={qidx} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 4 }}>
                <span style={{ minWidth: 24, fontWeight: 500, color: '#6c47b6', marginRight: 8 }}>
                  {String.fromCharCode(65 + qidx)}.
                </span>
                <span style={{ fontSize: 15, lineHeight: 1.5 }}>{q}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  });
}
// (removed unused style injection for underline)

// (error UI removed; radio selection doesn't need it)

// Utility to trigger browser download of a JSON object
function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

// Helper function to build JSON for import
function buildJSONForImport(questions: { question: string; standard: string }[], title: string) {
  const { standardsSet, questionsSet } = buildJSONExport(questions);
  const survey = JSON.parse(JSON.stringify(wpsSurveyTemplate));
  survey.title = title;
  survey.sections = standardsSet;
  survey.questions = questionsSet;
  return survey;
}

// Success Modal Component
const SuccessModal: React.FC<{ 
  show: boolean; 
  onHide: () => void; 
  surveyCount: number;
  onViewSurveys: () => void;
}> = ({ show, onHide, surveyCount, onViewSurveys }) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Body style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem', color: '#2a8c5f' }}>
          <FaCheckCircle size={60} />
        </div>
        <h4 style={{ marginBottom: '1rem' }}>Success!</h4>
        <p style={{ fontSize: '16px', marginBottom: '1.5rem' }}>
          {surveyCount === 1 
            ? 'Your survey has been successfully built and imported.' 
            : `${surveyCount} surveys have been successfully built and imported.`}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Button variant="secondary" onClick={onHide}>
            Close
          </Button>
          <Button variant="primary" onClick={onViewSurveys}>
            View All Surveys
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const BuildModal: React.FC<BuildModalProps> = ({ show, onHide, wpsids, onImportSuccess }) => {
  const navigate = useNavigate();
  // Temporary data structure for questions and indicators
  const [questionsByWPSID, setQuestionsByWPSID] = useState<Record<string, { leader: string | undefined, workforce: string | undefined, standard: string | undefined, indicator?: string | undefined }>>({});
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [importedSurveyCount, setImportedSurveyCount] = useState(0);
  // On modal load, collect questions for selected WPSIDs
  useEffect(() => {
    if (!show || !wpsids.length) {
      setQuestionsByWPSID({});
      return;
    }
    // Build a map of WPSID -> { leader, workforce, standard, indicator, indicatorShows }
    const map: Record<string, { leader: string | undefined, workforce: string | undefined, standard: string | undefined, indicator?: string | undefined, indicatorShows?: string | undefined }> = {};
    wpsQuestions.forEach(item => {
      if (wpsids.includes(item.WPSID)) {
        map[item.WPSID] = {
          leader: item['LEADER QUESTIONS'],
          workforce: item['WORKFORCE QUESTIONS'],
          standard: item['STANDARD'],
          indicator: item['INDICATOR'],
          indicatorShows: item['INDICATOR SHOWS']
        };
      }
    });
    setQuestionsByWPSID(map);
  }, [show, wpsids]);
  // Radio filter state: Workforce | Leaders | Both
  const [filter, setFilter] = useState<'Workforce' | 'Leaders' | 'Both'>('Workforce');
  // Survey title input
  const [customTitle, setCustomTitle] = useState<string>('');
  // Loading state for buttons
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRadioChange = (value: 'Workforce' | 'Leaders' | 'Both') => {
    setFilter(value);
  };
  
  // Handler for navigating to All Surveys page
  const handleViewAllSurveys = () => {
    navigate('/admin/surveys/all');
    onHide();
  };
  

  // Rendered blocks
  // Rendered blocks for each group
  // State for expanded indicators (keyed by indicator+group)
  const [expandedIndicators, setExpandedIndicators] = useState<Record<string, boolean>>({});

  const handleToggleIndicator = useCallback((key: string) => {
    setExpandedIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const indicatorBlockWorkforce = (
    <div style={{ maxHeight: 320, overflowY: 'auto', background: '#f9f9fb', borderRadius: 8, padding: '1rem 1.5rem', border: '1px solid #eee', marginBottom: 24 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#2d2d2d' }}>Workforce</div>
      {Object.entries(questionsByWPSID).length === 0 ? (
        <div className="text-muted">No indicators found for selected WPSIDs.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {renderIndicatorListByGroup(questionsByWPSID, 'Workforce', expandedIndicators, handleToggleIndicator)}
        </div>
      )}
    </div>
  );

  const indicatorBlockLeaders = (
    <div style={{ maxHeight: 320, overflowY: 'auto', background: '#f9f9fb', borderRadius: 8, padding: '1rem 1.5rem', border: '1px solid #eee', marginBottom: 24 }}>
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#2d2d2d' }}>Leaders</div>
      {Object.entries(questionsByWPSID).length === 0 ? (
        <div className="text-muted">No indicators found for selected WPSIDs.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {renderIndicatorListByGroup(questionsByWPSID, 'Leaders', expandedIndicators, handleToggleIndicator)}
        </div>
      )}
    </div>
  );

  const radioBlock = (
    <div style={{ marginBottom: '1.25rem' }}>
      <div
        style={{
          marginBottom: '1.25rem',
          background: '#f6f7fa',
          borderRadius: 8,
          padding: '1.25rem 1.25rem',
          border: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          position: 'relative',
        }}
      >
        {/* Top row: Survey Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 160, minWidth: 160 }}>
            <label
              htmlFor="survey-title-input"
              style={{ fontWeight: 600, fontSize: 16, color: '#2d2d2d', margin: 0, whiteSpace: 'nowrap' }}
            >
              Survey Title:
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              id="survey-title-input"
              type="text"
              value={customTitle}
              onChange={e => setCustomTitle(e.target.value)}
              placeholder={wpsSurveyTemplate.title || 'New WPS Survey'}
              style={{
                width: '100%',
                background: '#fff',
                padding: '10px 12px',
                borderRadius: 6,
                border: '1px solid #dcdcdc',
                outline: 'none',
                fontSize: 15,
              }}
            />
          </div>
        </div>
        {/* Second row: Select Audience */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 160, minWidth: 160 }}>
            <span style={{ fontWeight: 600, fontSize: 16, color: '#2d2d2d' }}>Select Audience:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="radio"
              name="question-area"
              checked={filter === 'Workforce'}
              onChange={() => handleRadioChange('Workforce')}
            />
            Workforce
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="radio"
              name="question-area"
              checked={filter === 'Leaders'}
              onChange={() => handleRadioChange('Leaders')}
            />
            Leaders
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="radio"
              name="question-area"
              checked={filter === 'Both'}
              onChange={() => handleRadioChange('Both')}
            />
            Workforce &amp; Leaders
            </label>
          </div>
        </div>
        {/* Error rendering removed */}
      </div>
    </div>
  );

  // Helper to build and download a survey JSON
  function buildAndDownloadSurvey(questions: { question: string; standard: string }[], filename: string) {
    const { standardsSet, questionsSet } = buildJSONExport(questions);
    const survey = JSON.parse(JSON.stringify(wpsSurveyTemplate));
    survey.sections = standardsSet;
    survey.questions = questionsSet;
    downloadJSON(survey, filename);
  }

  const confirmHandler = () => {
    // Prepare arrays for each group
    const leaderQuestions: { question: string; standard: string }[] = [];
    const workforceQuestions: { question: string; standard: string }[] = [];

    Object.values(questionsByWPSID).forEach(q => {
      if (q.leader && q.standard) {
        leaderQuestions.push({ question: q.leader, standard: q.standard });
      }
      if (q.workforce && q.standard) {
        workforceQuestions.push({ question: q.workforce, standard: q.standard });
      }
    });

    const baseTitle = (customTitle && customTitle.trim()) || (wpsSurveyTemplate.title || 'New WPS Survey');
    if (filter === 'Both') {
      const leadersTitle = `${baseTitle} (Leaders)`;
      const workforceTitle = `${baseTitle} (Workforce)`;
      buildAndDownloadSurveyWithTitle(leaderQuestions, 'wps-survey-leaders.json', leadersTitle);
      buildAndDownloadSurveyWithTitle(workforceQuestions, 'wps-survey-workforce.json', workforceTitle);
    } else if (filter === 'Leaders') {
      const title = `${baseTitle} (Leaders)`;
      buildAndDownloadSurveyWithTitle(leaderQuestions, 'wps-survey-leaders.json', title);
    } else if (filter === 'Workforce') {
      const title = `${baseTitle} (Workforce)`;
      buildAndDownloadSurveyWithTitle(workforceQuestions, 'wps-survey-workforce.json', title);
    }
  };
  
  // Handle Build and Import functionality
  const handleBuildAndImport = () => {
    setIsLoading(true);
    // Prepare arrays for each group
    const leaderQuestions: { question: string; standard: string }[] = [];
    const workforceQuestions: { question: string; standard: string }[] = [];
    
    Object.values(questionsByWPSID).forEach(q => {
      if (q.leader && q.standard) {
        leaderQuestions.push({ question: q.leader, standard: q.standard });
      }
      if (q.workforce && q.standard) {
        workforceQuestions.push({ question: q.workforce, standard: q.standard });
      }
    });
    
    const baseTitle = (customTitle && customTitle.trim()) || (wpsSurveyTemplate.title || 'New WPS Survey');
    
    if (filter === 'Both') {
      // Import both surveys
      const leadersTitle = `${baseTitle} (Leaders)`;
      const workforceTitle = `${baseTitle} (Workforce)`;
      
      // Generate Leader survey
      const leaderSurvey = buildJSONForImport(leaderQuestions, leadersTitle);
      // Generate Workforce survey
      const workforceSurvey = buildJSONForImport(workforceQuestions, workforceTitle);
      
      // Track completion of both imports
      let completedImports = 0;
      let successfulImports = 0;
      
      // Import leader survey
      Meteor.call('surveys.import', leaderSurvey, (leaderError: any, leaderResult: any) => {
        completedImports++;
        if (!leaderError && leaderResult && leaderResult.success) {
          successfulImports++;
        }
        
        // Import workforce survey
        Meteor.call('surveys.import', workforceSurvey, (workforceError: any, workforceResult: any) => {
          completedImports++;
          if (!workforceError && workforceResult && workforceResult.success) {
            successfulImports++;
          }
          
          // Both imports are complete, check results
          if (completedImports === 2) {
            if (successfulImports === 2) {
              // Both imports successful
              toast.success('Surveys built and imported successfully!');
              setImportedSurveyCount(2);
              setShowSuccessModal(true);
              if (onImportSuccess) {
                onImportSuccess();
              }
            } else {
              toast.error('Failed to import one or more surveys');
              setShowSuccessModal(true);
            }
            setIsLoading(false);
          }
        });
      });
    } else if (filter === 'Leaders') {
      const title = `${baseTitle} (Leaders)`;
      const survey = buildJSONForImport(leaderQuestions, title);
      
      Meteor.call('surveys.import', survey, (error: any, result: any) => {
        setIsLoading(false);
        if (error) {
          console.error('Error importing survey:', error);
          toast.error(`Error: ${error.message || 'Unknown error'}`);
        } else if (result && result.success) {
          toast.success('Survey built and imported successfully!');
          setImportedSurveyCount(1);
          setShowSuccessModal(true);
          if (onImportSuccess) {
            onImportSuccess();
          }
        } else {
          toast.error('Failed to import survey');
        }
      });
    } else if (filter === 'Workforce') {
      const title = `${baseTitle} (Workforce)`;
      const survey = buildJSONForImport(workforceQuestions, title);
      
      Meteor.call('surveys.import', survey, (error: any, result: any) => {
        setIsLoading(false);
        if (error) {
          console.error('Error importing survey:', error);
          toast.error(`Error: ${error.message || 'Unknown error'}`);
        } else if (result && result.success) {
          toast.success('Survey built and imported successfully!');
          setImportedSurveyCount(1);
          setShowSuccessModal(true);
          if (onImportSuccess) {
            onImportSuccess();
          }
        } else {
          toast.error('Failed to import survey');
        }
      });
    }
  };

  // Helper to build with explicit title
  function buildAndDownloadSurveyWithTitle(
    questions: { question: string; standard: string }[],
    filename: string,
    title: string
  ) {
    const { standardsSet, questionsSet } = buildJSONExport(questions);
    const survey = JSON.parse(JSON.stringify(wpsSurveyTemplate));
    survey.title = title;
    survey.sections = standardsSet;
    survey.questions = questionsSet;
    downloadJSON(survey, filename);
  }

  return (
    <>
      {/* Success Modal */}
      <SuccessModal 
        show={showSuccessModal} 
        onHide={() => {
          setShowSuccessModal(false);
          onHide();
        }} 
        surveyCount={importedSurveyCount} 
        onViewSurveys={handleViewAllSurveys} 
      />
      
      {/* Main Modal */}
      <Modal show={show && !showSuccessModal} onHide={onHide} centered size="lg" dialogClassName="wps-builder-modal">
        <div style={{ borderBottom: 'none' }}>
          <Modal.Header closeButton style={{ borderBottom: 'none' }} />
        </div>
      <Modal.Body style={{ padding: '2rem 2.5rem' }}>
        <style>{`
          .wps-builder-modal #survey-title-input::placeholder { color: #bfc3cc; opacity: 1; }
          .wps-builder-modal #survey-title-input::-webkit-input-placeholder { color: #bfc3cc; }
          .wps-builder-modal #survey-title-input::-moz-placeholder { color: #bfc3cc; }
          .wps-builder-modal #survey-title-input:-ms-input-placeholder { color: #bfc3cc; }
        `}</style>
  <h4 style={{ marginBottom: '1.5rem' }}>Review & Create Survey</h4>
  {radioBlock}
        {wpsids.length === 0 ? (
          <div className="text-muted">No indicators selected.</div>
        ) : (
          filter === 'Both' ? (
            <>
              {indicatorBlockWorkforce}
              {indicatorBlockLeaders}
            </>
          ) : filter === 'Workforce' ? (
            indicatorBlockWorkforce
          ) : (
            indicatorBlockLeaders
          )
        )}
      </Modal.Body>
      <div style={{ borderTop: 'none' }}>
        <Modal.Footer className="justify-content-end" style={{ borderTop: 'none', paddingRight: '2.5rem', paddingBottom: '2rem' }}>
          <Button variant="secondary" onClick={onHide} style={{ minWidth: 90 }}>
            Close
          </Button>
          <Button
            variant="primary"
            style={{ minWidth: 90, marginLeft: 12 }}
            disabled={wpsids.length === 0 || isLoading}
            onClick={confirmHandler}
          >
            Build
          </Button>
          <Button
            variant="primary"
            style={{ minWidth: 120, marginLeft: 12 }}
            disabled={wpsids.length === 0 || isLoading}
            onClick={handleBuildAndImport}
          >
            Build and Import
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
    </>
  );
};

export default BuildModal;

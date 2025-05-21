import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: string[];
}

const PublicSurveyPage: React.FC = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!surveyId) return;
    Meteor.call('surveys.get', surveyId, (err: any, res: Survey) => {
      if (err || !res) {
        setError('Survey not found.');
        setLoading(false);
      } else {
        setSurvey(res);
        setLoading(false);
      }
    });
  }, [surveyId]);

  if (loading) return <div style={{ padding: 32 }}>Loading survey...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>{error}</div>;
  if (!survey) return null;

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontWeight: 800, color: '#28211e', fontSize: 26 }}>{survey.title}</h2>
      <p style={{ color: '#6e5a67', fontSize: 18 }}>{survey.description}</p>
      {/* Render questions here. */}
      <SurveyQuestions
        surveyId={survey._id}
        questions={survey.questions}
      />
    </div>
  );
};

// Helper component to render and submit survey questions
const SurveyQuestions: React.FC<{ surveyId: string; questions: string[] }> = ({ surveyId, questions }) => {
  const [questionData, setQuestionData] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questions || questions.length === 0) return;
    Meteor.call('questions.getMany', questions, (err: any, res: any[]) => {
      if (err || !res) {
        setError('Could not load questions.');
      } else {
        setQuestionData(res);
      }
    });
  }, [questions]);

  const handleChange = (qid: string, value: any) => {
    setAnswers(a => ({ ...a, [qid]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    Meteor.call('surveys.submitResponse', surveyId, answers, (err: any) => {
      setSubmitting(false);
      if (err) {
        setError('Failed to submit response.');
      } else {
        setSubmitted(true);
      }
    });
  };

  if (submitted) {
    return <div style={{ marginTop: 32, color: '#2ecc40', fontWeight: 700, fontSize: 20 }}>Thank you for completing the survey!</div>;
  }

  if (error) {
    return <div style={{ marginTop: 24, color: 'red' }}>{error}</div>;
  }

  if (!questionData.length) {
    return <div style={{ marginTop: 24 }}>Loading questions...</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {questionData.map((q: any, idx: number) => {
        // Assume latest version is last
        const latest = q.versions && q.versions.length > 0 ? q.versions[q.versions.length - 1] : {};
        const qid = q._id || q.id || questions[idx];
        return (
          <div key={qid} style={{ background: '#f9f4f7', padding: 20, borderRadius: 8 }}>
            <div style={{ fontWeight: 600, color: '#28211e', fontSize: 17, marginBottom: 8 }}>{latest.questionText || q.question_text}</div>
            <div style={{ color: '#6e5a67', fontSize: 15, marginBottom: 10 }}>{latest.description || ''}</div>
            {renderInput(latest, qid, answers[qid], (val: any) => handleChange(qid, val))}
          </div>
        );
      })}
      <button
        type="submit"
        disabled={submitting}
        style={{
          background: '#552a47', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', borderRadius: 6, padding: '12px 32px', marginTop: 8, cursor: 'pointer', opacity: submitting ? 0.7 : 1
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Survey'}
      </button>
    </form>
  );
};

function renderInput(q: any, qid: string, value: any, onChange: (v: any) => void) {
  // Support scale_1_to_5, textarea, short_text
  if (q.display_format === 'scale_1_to_5' || q.responseType === 'scale_1_to_5') {
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {[1,2,3,4,5].map(n => (
          <label key={n} style={{ fontWeight: 500, color: '#552a47' }}>
            <input
              type="radio"
              name={qid}
              value={n}
              checked={String(value) === String(n)}
              onChange={() => onChange(n)}
              style={{ marginRight: 6 }}
            />
            {n}
          </label>
        ))}
      </div>
    );
  }
  if (q.display_format === 'textarea' || q.responseType === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', minHeight: 60, fontSize: 15, padding: 8, borderRadius: 4, border: '1.5px solid #e5d6c7' }}
        placeholder="Your answer"
      />
    );
  }
  // Default: short text
  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      style={{ width: '100%', fontSize: 15, padding: 8, borderRadius: 4, border: '1.5px solid #e5d6c7' }}
      placeholder="Your answer"
    />
  );
}

export default PublicSurveyPage;

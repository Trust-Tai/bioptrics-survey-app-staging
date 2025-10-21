import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';

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

  if (loading) {
    return (
      <Container fluid className="px-3 py-3 py-md-5">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            <div className="text-center">Loading survey...</div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="px-3 py-3 py-md-5">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }
  
  if (!survey) return null;

  return (
    <Container fluid className="px-3 py-3 py-md-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={11} md={10} lg={8} xl={7} xxl={6}>
          <div className="text-center mb-3 mb-md-4 mb-lg-5">
            <h2 className="fw-bold text-dark fs-3 fs-sm-2 fs-md-1 mb-2 mb-md-3">{survey.title}</h2>
            <p className="text-muted fs-6 fs-sm-5 fs-md-4 px-2 px-sm-0">{survey.description}</p>
          </div>
          <SurveyQuestions
            surveyId={survey._id}
            questions={survey.questions}
          />
        </Col>
      </Row>
  </Container>
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
    return (
      <Alert variant="success" className="text-center py-3 py-md-4">
        <h4 className="fw-bold mb-2 fs-5 fs-md-4">Thank you for completing the survey!</h4>
        <p className="mb-0 fs-6">Your response has been recorded successfully.</p>
      </Alert>
    );
  }

  if (error) {
    return <Alert variant="danger" className="mt-3 mx-2 mx-sm-0">{error}</Alert>;
  }

  if (!questionData.length) {
    return (
      <div className="text-center mt-3 mt-md-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading questions...</span>
        </div>
        <p className="mt-2 text-muted fs-6">Loading questions...</p>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
    <Row>
      <Col xs={12}>
        {questionData.map((q: any, idx: number) => {
          // Assume latest version is last
          const latest = q.versions && q.versions.length > 0 ? q.versions[q.versions.length - 1] : {};
          const qid = q._id || q.id || questions[idx];
          return (
            <Card key={qid} className="mb-3 mb-md-4 border-0 shadow-sm mx-1 mx-sm-0">
              <Card.Body className="p-3 p-sm-4">
                <Card.Title className="fw-semibold text-dark fs-6 fs-sm-5 fs-md-4 mb-2 mb-md-3 lh-sm">
                  {latest.questionText || q.question_text}
                </Card.Title>
                {(latest.description || '') && (
                  <Card.Text className="text-muted fs-7 fs-sm-6 mb-3 lh-sm">
                    {latest.description}
                  </Card.Text>
                )}
                {renderInput(latest, qid, answers[qid], (val: any) => handleChange(qid, val))}
              </Card.Body>
            </Card>
          );
        })}

        <div className="d-grid gap-2 mt-4 px-1 px-sm-0">
          <Button
            type="submit"
            disabled={submitting}
            variant="primary"
            size="lg"
            className="py-3 fs-6 fs-md-5"
            style={{ backgroundColor: 'var(--color-primary, #552a47)', borderColor: 'var(--color-primary, #552a47)' }}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              'Submit Survey'
            )}
          </Button>
          </div>
          </Col>
      </Row>
    </Form>
  );
};

function renderInput(q: any, qid: string, value: any, onChange: (v: any) => void) {
  // Support scale_1_to_5, textarea, short_text
  if (q.display_format === 'scale_1_to_5' || q.responseType === 'scale_1_to_5') {
    return (
      <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 align-items-start">
        {[1,2,3,4,5].map(n => (
          <Form.Check
            key={n}
            type="radio"
            id={`${qid}-${n}`}
            name={qid}
            value={n}
            checked={String(value) === String(n)}
            onChange={() => onChange(n)}
            label={n.toString()}
            className="fw-medium fs-6 mb-1 mb-sm-0"
            style={{ color: 'var(--color-primary, #552a47)' }}
          />
        ))}
      </div>
    );
  }
  if (q.display_format === 'textarea' || q.responseType === 'textarea') {
    return (
      <Form.Control
        as="textarea"
        rows={3}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="Your answer"
        className="border-2 fs-6"
        style={{ borderColor: '#e5d6c7' }}
      />
    );
  }
  // Default: short text
  return (
    <Form.Control
      type="text"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder="Your answer"
      className="border-2 fs-6"
      style={{ borderColor: '#e5d6c7' }}
    />
  );
}

export default PublicSurveyPage;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthButton, AuthTitle } from '../components/AuthStyles';
import { Meteor } from 'meteor/meteor';
import { FaArrowRight, FaArrowLeft, FaBriefcase, FaGraduationCap, FaUser, FaChalkboardTeacher, FaUsers, FaQuestionCircle, FaMoneyCheck, FaRegSmile, FaCalendarAlt, FaChalkboard, FaChartBar, FaEllipsisH, FaHeadset, FaBullhorn, FaLightbulb, FaPaintBrush, FaLaptopCode, FaUserTie, FaSchool, FaSearch, FaPodcast, FaBlogger, FaUserFriends, FaFacebook, FaUserEdit, FaYoutube, FaTv, FaGlobe, FaAd, FaForward } from 'react-icons/fa';
import { SiBlogger, SiFacebook, SiInstagram, SiLinkedin, SiTiktok, SiYoutube } from 'react-icons/si';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const LeftImage = styled.div<{image: string}>`
  flex: 1;
  background: ${({image}) => `url(${image}) center center/cover no-repeat`};
  height: 100vh;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  border-radius: 0;
`;

const RightSurvey = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  height: 100vh;
  min-height: 100vh;
  position: relative;
  justify-content: center;
  align-items: flex-start;
  overflow: hidden;
  padding-left: 64px;
  padding-right: 32px;
`;

const SkipButton = styled.button`
  position: absolute;
  top: 32px;
  right: 40px;
  background: none;
  border: none;
  color: #a96fa6;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  z-index: 2;
`;

const SurveyContent = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0;
  box-sizing: border-box;
`;

const QuestionLabel = styled.div<{isPurpose?: boolean}>`
  font-weight: 600;
  color: #552a47;
  font-size: 1.18rem;
  margin-bottom: ${({isPurpose}) => isPurpose ? '30px' : '14px'};
  text-align: left;
  letter-spacing: 0.1px;
`;

const OptionRow = styled.div<{vertical?: boolean}>`
  display: flex;
  flex-direction: ${({vertical}) => vertical ? 'column' : 'row'};
  gap: 18px;
  ${({vertical}) => vertical && `
    max-height: 60vh;
    min-height: 280px;
    overflow-y: auto;
    scrollbar-width: thin; /* Firefox */
    -ms-overflow-style: auto; /* IE 10+ */
    &::-webkit-scrollbar {
      width: 10px;
      background: #f4eaf7;
      border-radius: 8px;
    }
    &::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #a96fa6 0%, #552a47 100%);
      border-radius: 8px;
      min-height: 32px;
      box-shadow: 0 2px 6px rgba(85,42,71,0.08);
      border: 2px solid #f4eaf7;
    }
    &::-webkit-scrollbar-track {
      background: #f4eaf7;
      border-radius: 8px;
    }
  `}
`;

const OptionButton = styled.button<{selected: boolean}>`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 54px;
  font-size: 1.13rem;
  padding: 0.85rem 1.2rem;
  border-radius: 12px;
  border: 2px solid ${({selected}) => selected ? '#552a47' : '#e2d5e2'};
  background: ${({selected}) => selected ? 'rgba(85,42,71,0.07)' : '#fff'};
  color: #552a47;
  font-weight: 600;
  margin-bottom: 0;
  transition: border 0.18s, background 0.18s;
  cursor: pointer;
  outline: none;
  box-shadow: none;
  &:hover {
    border: 2px solid #a96fa6;
    background: #f7f1f7;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 1.2rem;
  border-radius: 16px;
  border: 1.5px solid #e0dbe2;
  font-size: 1.13rem;
  background: #faf6f8;
  outline: none;
  margin-bottom: 12px;
  box-shadow: 0 1px 8px #f6e9f5;
  transition: border 0.2s;
`;

const ErrorMsg = styled.div`
  color: #e74c3c;
  margin-bottom: 1rem;
  text-align: left;
`;

const ButtonRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  margin-top: 10px;
`;

const BackButton = styled(AuthButton)`
  visibility: ${({disabled}) => disabled ? 'hidden' : 'visible'};
  font-size: 1.1rem;
  padding: 0 12px;
`;

const ONBOARD_IMAGE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

const PROGRESS_KEY = 'onboarding_progress_v1';

export default function GetToKnowYou() {
  // Utility to get N random elements from an array
  function getRandomSubset<T>(arr: T[], n: number): T[] {
    const shuffled = arr.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
  }

  // Fetch questions from localStorage (as saved by admin)
  function fetchBankQuestions(): any[] {
    try {
      const data = localStorage.getItem('questions');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // On first mount, select a random subset for this survey cycle
  const [questions, setQuestions] = useState<any[]>([]);
  useEffect(() => {
    const allBankQuestions = fetchBankQuestions();
    // Fallback: if admin hasn't added any, show a demo question
    if (!allBankQuestions.length) {
      setQuestions([
        {
          label: 'No questions available. Please ask your admin to add questions.',
          name: 'demo',
          type: 'text',
        },
      ]);
    } else {
      setQuestions(getRandomSubset(allBankQuestions, 10)); // 10 random questions
    }
  }, []);

  const navigate = useNavigate();
  // Load progress from localStorage
  const saved = typeof window !== 'undefined' ? window.localStorage.getItem(PROGRESS_KEY) : null;
  let initialAnswers = { purpose: '', interest: '', role: '', referrer: '', goal: '', hearAbout: '' };
  let initialStep = 0;
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        initialAnswers = { ...initialAnswers, ...parsed.answers };
        initialStep = typeof parsed.step === 'number' ? parsed.step : 0;
      }
    } catch {}
  }
  const [answers, setAnswers] = useState(initialAnswers);
  const [step, setStep] = useState(initialStep);
  const [error, setError] = useState('');

  // Save progress on answer/step change
  useEffect(() => {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ answers, step }));
  }, [answers, step]);

  // Clear progress on completion
  const completeOnboarding = () => {
    window.localStorage.removeItem(PROGRESS_KEY);
    Meteor.call('auth.setOnboardingComplete', (err: any) => {
      if (err) {
        setError('Error completing onboarding.');
      } else {
        navigate('/home');
      }
    });
  };

  // For select type, move to next step immediately after selection
  const handleSelect = (value: string) => {
    const name = questions[step].name;
    setAnswers(prev => {
      const updated = { ...prev, [name]: value };
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify({ answers: updated, step: step + 1 }));
      return updated;
    });
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      window.localStorage.removeItem(PROGRESS_KEY);
      Meteor.call('auth.setOnboardingComplete', (err: any) => {
        if (err) {
          setError('Error completing onboarding.');
        } else {
          navigate('/home');
        }
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswers({ ...answers, [questions[step].name]: e.target.value });
  };

  const handleSkip = () => {
    window.localStorage.removeItem(PROGRESS_KEY);
    Meteor.call('auth.setOnboardingComplete', (err: any) => {
      if (err) {
        setError('Error completing onboarding.');
      } else {
        navigate('/home');
      }
    });
  };

  // Remove body padding for onboarding page
  useEffect(() => {
    const originalPadding = document.body.style.padding;
    const originalMargin = document.body.style.margin;
    const originalOverflow = document.body.style.overflow;
    document.body.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.padding = originalPadding;
      document.body.style.margin = originalMargin;
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const optionRowRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    // Show scroll hint if content is overflowing and not scrolled to end
    const checkScroll = () => {
      const el = optionRowRef.current;
      if (el && el.scrollHeight > el.clientHeight) {
        // Only show hint if not at the bottom
        setShowScrollHint(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
      } else {
        setShowScrollHint(false);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [step, questions[step].options]);

  // Hide scroll hint when scrolled to end
  useEffect(() => {
    const el = optionRowRef.current;
    if (!el) return;
    const handleScroll = () => {
      setShowScrollHint(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [step, questions[step].options]);

  // If all questions are already answered, redirect to home
  useEffect(() => {
    // Only run if there is onboarding progress in localStorage (prevents infinite redirect loop)
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(PROGRESS_KEY) : null;
    if (!saved) return;
    let parsed = null;
    try {
      parsed = JSON.parse(saved);
    } catch {}
    if (!parsed || typeof parsed !== 'object') return;
    // Only check for all-answered if step >= questions.length (i.e., finished)
    if (typeof parsed.step === 'number' && parsed.step >= questions.length) {
      Meteor.call('auth.setOnboardingComplete', (err: any) => {
        window.localStorage.removeItem(PROGRESS_KEY);
        navigate('/home');
      });
    }
  }, []);

  // Defensive: If step is out of bounds, redirect to home (and render nothing)
  useEffect(() => {
    if (step < 0 || step >= questions.length) {
      navigate('/home');
    }
  }, [step, navigate]);
  if (step < 0 || step >= questions.length) return null;

  const current = questions[step];
  const questionsLeft = questions.length - step - 1;

  // Robust fallback: if no questions or malformed, show a visible message
  if (!questions || !Array.isArray(questions) || questions.length === 0 || !questions[0].label) {
    console.warn('[Survey] No valid questions found in localStorage.');
    return (
      <PageContainer>
        <LeftImage image={ONBOARD_IMAGE} />
        <RightSurvey>
          <SurveyContent>
            <AuthTitle style={{marginBottom: 32, textAlign: 'left', fontSize: '2.1rem', color: '#552a47'}}>Let's get to know you!</AuthTitle>
            <div style={{ width: '100%', margin: '32px 0', color: '#a96fa6', fontSize: 22, fontWeight: 600, textAlign: 'center' }}>
              No questions available. Please ask your admin to add questions in the Question Bank.
            </div>
          </SurveyContent>
        </RightSurvey>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <LeftImage image={ONBOARD_IMAGE} />
      <RightSurvey>
        <SkipButton type="button" onClick={handleSkip}>
          Skip <FaForward style={{marginLeft:8, fontSize:'1.1em', verticalAlign:'middle'}} />
        </SkipButton>
        <SurveyContent>
          <AuthTitle style={{marginBottom: 32, textAlign: 'left', fontSize: '2.1rem', color: '#552a47'}}>Let's get to know you!</AuthTitle>
          {/* Progressive questions: show all previous questions/answers, and the next unanswered one */}
          {questions.slice(0, step + 1).map((q, idx) => (
            <div key={q.name || idx} style={{ width: '100%', marginBottom: 28, opacity: idx < step ? 0.7 : 1 }}>
              <QuestionLabel isPurpose={q.name === 'purpose'}>{q.label}</QuestionLabel>
              {/* Show questions left except on first question */}
              {idx > 0 && idx < questions.length - 1 && (
                <div style={{ color: '#a096a2', fontSize: '1.03rem', marginBottom: 10, fontWeight: 500 }}>
                  {questions.length - idx - 1} question{questions.length - idx - 1 > 1 ? 's' : ''} left
                </div>
              )}
              {q.type === 'select' ? (
                <div style={{position:'relative'}}>
                  <OptionRow ref={idx === step ? optionRowRef : undefined} vertical={q.name === 'purpose' || q.name === 'interest' || q.name === 'role' || q.name === 'referrer'}>
                    {(q.options ?? []).map(opt => (
                      <OptionButton
                        key={opt.value}
                        type="button"
                        selected={answers[q.name as keyof typeof answers] === opt.value}
                        onClick={() => idx === step && handleSelect(opt.value)}
                        disabled={idx !== step}
                        style={idx !== step ? {opacity: 0.5, pointerEvents: 'none'} : {}}
                      >
                        {((q.name === 'purpose' || q.name === 'interest' || q.name === 'role' || q.name === 'referrer') && opt.icon) ? <span style={{marginRight:8}}>{opt.icon}</span> : null}
                        {opt.label}
                      </OptionButton>
                    ))}
                  </OptionRow>
                  {/* Scroll hint only for current step */}
                  {idx === step && showScrollHint && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.85)',
                        borderRadius: 14,
                        padding: '3px 16px',
                        fontSize: '1.01rem',
                        color: '#a96fa6',
                        fontWeight: 600,
                        boxShadow: '0 2px 10px rgba(85,42,71,0.06)'
                      }}>
                        Scroll to see more options ↓
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <StyledInput
                  type={q.type}
                  name={q.name}
                  value={answers[q.name as keyof typeof answers]}
                  onChange={idx === step ? handleChange : undefined}
                  placeholder={q.placeholder}
                  autoFocus={idx === step}
                  autoComplete="off"
                  disabled={idx !== step}
                  style={idx !== step ? {opacity: 0.5, pointerEvents: 'none'} : {}}
                />
              )}
            </div>
          ))}

          {error && <ErrorMsg>{error}</ErrorMsg>}
          <ButtonRow>
            {/* Back button removed: cannot go back after answering a question */}
            <div style={{flex:1}} />
            {/* No Next/Finish button */}
          </ButtonRow>
        </SurveyContent>
      </RightSurvey>
    </PageContainer>
  );
}

// Define AnalyticsQuestion interface here to avoid circular dependencies
export interface AnalyticsQuestion {
  questionId: string;
  questionText: string;
  questionType: string;
  progress: Record<string, number>;
  latestResponses?: Array<{
    answer: string;
    date: Date;
  }>;
}

// Interface for question with calculated positive score
export interface RankedQuestion extends AnalyticsQuestion {
  positiveScore: number;
  questionCategory: 'likert' | 'radio' | 'text';
}

/**
 * Calculate positive score for Likert scale questions
 * Positive Score = Agree % + Strongly Agree %
 */
export function calculateLikertPositiveScore(question: AnalyticsQuestion): number {
  const agreePercentage = question.progress['Agree'] || 0;
  const stronglyAgreePercentage = question.progress['Strongly Agree'] || 0;
  return agreePercentage + stronglyAgreePercentage;
}

/**
 * Calculate positive score for Radio questions
 * Positive Score = Highest Selected Option %
 */
export function calculateRadioPositiveScore(question: AnalyticsQuestion): number {
  return Math.max(...Object.values(question.progress), 0);
}

/**
 * Categorize questions by type and calculate positive scores
 */
export function categorizeAndScoreQuestions(
  questions: AnalyticsQuestion[]
): {
  likertQuestions: RankedQuestion[];
  radioQuestions: RankedQuestion[];
  textQuestions: RankedQuestion[];
} {
  const likertQuestions: RankedQuestion[] = [];
  const radioQuestions: RankedQuestion[] = [];
  const textQuestions: RankedQuestion[] = [];

  questions.forEach(question => {
    if (['text', 'textarea', 'date'].includes(question.questionType)) {
      textQuestions.push({
        ...question,
        positiveScore: 0,
        questionCategory: 'text'
      });
    } else if (question.questionType === 'likert') {
      const positiveScore = calculateLikertPositiveScore(question);
      likertQuestions.push({
        ...question,
        positiveScore,
        questionCategory: 'likert'
      });
    } else {
      // Radio and other question types
      const positiveScore = calculateRadioPositiveScore(question);
      radioQuestions.push({
        ...question,
        positiveScore,
        questionCategory: 'radio'
      });
    }
  });

  // Sort by positive score (descending)
  likertQuestions.sort((a, b) => b.positiveScore - a.positiveScore);
  radioQuestions.sort((a, b) => b.positiveScore - a.positiveScore);

  return { likertQuestions, radioQuestions, textQuestions };
}

/**
 * Find the section ID for a question
 */
export function findSectionForQuestion(
  questionId: string,
  sectionQuestionMap: Record<string, string[]>
): string | null {
  for (const [sectionId, questionIds] of Object.entries(sectionQuestionMap)) {
    if (questionIds.includes(questionId)) {
      return sectionId;
    }
  }
  return null;
}

/**
 * Create a map of section IDs to question IDs
 */
export function createSectionQuestionMap(surveyData: any): Record<string, string[]> {
  const sectionQuestionMap: Record<string, string[]> = {};
  
  if (surveyData.sectionQuestions && Array.isArray(surveyData.sectionQuestions)) {
    surveyData.sectionQuestions.forEach((item: any) => {
      if (item.sectionId && item.id) {
        if (!sectionQuestionMap[item.sectionId]) {
          sectionQuestionMap[item.sectionId] = [];
        }
        sectionQuestionMap[item.sectionId].push(item.id);
      }
    });
  }
  
  return sectionQuestionMap;
}

/**
 * Group questions by section and sort within each section
 */
export function groupQuestionsBySection(
  questions: AnalyticsQuestion[],
  surveyData: any
): Record<string, AnalyticsQuestion[]> {
  const sectionQuestionMap = createSectionQuestionMap(surveyData);
  const questionsBySection: Record<string, AnalyticsQuestion[]> = {};
  
  // Initialize sections
  if (surveyData.surveySections && Array.isArray(surveyData.surveySections)) {
    surveyData.surveySections.forEach((section: any) => {
      if (section.id) {
        questionsBySection[section.id] = [];
      }
    });
  }
  
  // Add a default section for questions not in any section
  questionsBySection['unsectioned'] = [];
  
  // Assign questions to sections
  questions.forEach(question => {
    const sectionId = findSectionForQuestion(question.questionId, sectionQuestionMap);
    if (sectionId && questionsBySection[sectionId]) {
      questionsBySection[sectionId].push(question);
    } else {
      questionsBySection['unsectioned'].push(question);
    }
  });
  
  return questionsBySection;
}

/**
 * Group and rank questions by section
 */
export function rankQuestionsBySection(
  questions: AnalyticsQuestion[],
  surveyData: any
): Record<string, { likert: RankedQuestion[], radio: RankedQuestion[], text: RankedQuestion[] }> {
  const questionsBySection = groupQuestionsBySection(questions, surveyData);
  const rankedQuestionsBySection: Record<string, { 
    likert: RankedQuestion[], 
    radio: RankedQuestion[], 
    text: RankedQuestion[] 
  }> = {};
  
  // Process each section
  Object.entries(questionsBySection).forEach(([sectionId, sectionQuestions]) => {
    // Skip empty sections
    if (sectionQuestions.length === 0) {
      return;
    }
    
    // Categorize and score questions in this section
    const { likertQuestions, radioQuestions, textQuestions } = 
      categorizeAndScoreQuestions(sectionQuestions);
    
    // Store the ranked questions
    rankedQuestionsBySection[sectionId] = {
      likert: likertQuestions,
      radio: radioQuestions,
      text: textQuestions
    };
  });
  
  return rankedQuestionsBySection;
}

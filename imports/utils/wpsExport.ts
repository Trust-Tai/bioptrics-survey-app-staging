// Utility for building WPS export JSON from selected questions
// Accepts filteredQuestions: { question: string; standard: string }[]
// Returns { standardsSet, questionsSet }
export function buildJSONExport(filteredQuestions: { question: string; standard: string }[]) {
  const standardsMap = new Map<string, { id: string; title: string; description: string; instructions: string }>();
  const standardOrderCount: Record<string, number> = {};
  type RatingQuestion = {
    text: string;
    responseType: 'rating';
    sectionId: string;
    order: number;
    options: { value: string; label: string }[];
    required: boolean;
    description?: string;
  };
  type TextQuestion = {
    text: string;
    responseType: 'text';
    sectionId: string;
    order: number;
    required: boolean;
    description?: string;
  };
  type Question = RatingQuestion | TextQuestion;
  const questionsSet: Question[] = [];


  // Track questions per standard for custom question insertion
  const questionsByStandard: Record<string, number> = {};

  filteredQuestions.forEach(q => {
    // Add to standardsMap if not already present
    if (q.standard && !standardsMap.has(q.standard)) {
      standardsMap.set(q.standard, {
        id: q.standard.toLowerCase().replace(/\s+/g, '-'),
        title: q.standard,
        description: "",
        instructions: ""
      });
      standardOrderCount[q.standard] = 1;
      questionsByStandard[q.standard] = 0;
    } else if (q.standard) {
      standardOrderCount[q.standard]++;
    }

    // Add question to questionsSet (filtered questions)
    questionsSet.push({
      text: q.question,
      responseType: "rating",
      sectionId: q.standard ? q.standard.toLowerCase().replace(/\s+/g, '-') : '',
      order: standardOrderCount[q.standard],
      options: [
        { value: "1", label: "Strongly Disagree" },
        { value: "2", label: "Disagree" },
        { value: "3", label: "Neither Agree nor Disagree" },
        { value: "4", label: "Agree" },
        { value: "5", label: "Strongly Agree" }
      ],
      required: true
    });
    if (q.standard) {
      questionsByStandard[q.standard]++;
    }
  });

  // Add custom question to the end of each standard
  standardsMap.forEach((standardObj, standardTitle) => {
    // Find the max order for this standard in questionsSet
    const maxOrder = questionsSet
      .filter(q => q.sectionId === standardObj.id)
      .reduce((max, q) => q.order > max ? q.order : max, 0);
    questionsSet.push({
      text: `${standardTitle}: Feedback`,
      responseType: "text",
      sectionId: standardObj.id,
      order: maxOrder + 1,
      required: true,
      description: ""
    });
  });

  const standardsSet = Array.from(standardsMap.values());

  return { standardsSet, questionsSet };
}

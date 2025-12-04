// Survey utilities exports
export const surveyUtils = {
  formatSurveyTitle: (title: string): string => {
    return title.trim().substring(0, 100);
  },
  
  calculateProgress: (responses: any[], totalQuestions: number): number => {
    const answeredQuestions = responses.filter(r => r && r !== '').length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  },
  
  generateSurveyUrl: (surveyId: string, token?: string): string => {
    return token ? `/public/${token}` : `/survey/${surveyId}`;
  }
};

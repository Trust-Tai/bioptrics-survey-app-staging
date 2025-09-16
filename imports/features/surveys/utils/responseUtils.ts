// Utility functions for response operations

export interface ResponseStats {
  totalResponses: number;
  totalTags: number;
  completionRate: number;
  avgEngagement: number;
  timeToComplete: number;
  responseRate: number;
}

/**
 * Calculate engagement score for a response
 */
export const calculateEngagementScore = (response: any): number => {
  if (!response || !response.responses) return 0;
  
  let score = 0;
  const responses = response.responses;
  
  // Count answered questions
  const answeredCount = Object.keys(responses).length;
  score += answeredCount * 10; // 10 points per answered question
  
  // Bonus for text responses (more engagement)
  Object.values(responses).forEach((resp: any) => {
    if (typeof resp === 'string' && resp.length > 50) {
      score += 5; // Bonus for longer text responses
    }
  });
  
  return Math.min(score, 100); // Cap at 100
};

/**
 * Calculate response statistics
 */
export const calculateResponseStats = (responses: any[]): ResponseStats => {
  const totalResponses = responses.length;
  const completedCount = responses.filter(r => r.status === 'completed').length;
  const completionRate = totalResponses > 0 ? Math.round((completedCount / totalResponses) * 100) : 0;
  
  // Calculate engagement scores
  const engagementScores = responses.map(calculateEngagementScore);
  const avgEngagement = engagementScores.length > 0 
    ? Math.round(engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length)
    : 0;
  
  // Calculate average time to complete (for completed responses only)
  const completedWithTime = responses.filter(resp => 
    resp.status === 'completed' && resp.completedAt && resp.startedAt
  );
  const timeToComplete = completedWithTime.length > 0
    ? Math.round(completedWithTime.reduce((sum, resp) => {
        const timeDiff = new Date(resp.completedAt).getTime() - new Date(resp.startedAt).getTime();
        return sum + (timeDiff / 1000 / 60); // Convert to minutes
      }, 0) / completedWithTime.length)
    : 0;
  
  // Count unique tags
  const allTags = new Set();
  responses.forEach(resp => {
    if (resp.tags && Array.isArray(resp.tags)) {
      resp.tags.forEach(tag => allTags.add(tag));
    }
  });
  const totalTags = allTags.size;
  
  // Calculate response rate (this would need survey metadata)
  const responseRate = 0; // This would need to be calculated based on survey distribution
  
  return {
    totalResponses,
    totalTags,
    completionRate,
    avgEngagement,
    timeToComplete,
    responseRate
  };
};

/**
 * Format response for display
 */
export const formatResponseForDisplay = (response: any, index: number) => {
  return {
    ...response,
    id: response._id || `response_${index}`,
    engagementScore: calculateEngagementScore(response),
    formattedDate: response.completedAt 
      ? new Date(response.completedAt).toLocaleDateString()
      : new Date(response.startedAt).toLocaleDateString()
  };
};

/**
 * Filter responses based on criteria
 */
export const filterResponses = (
  responses: any[], 
  filters: {
    status?: string;
    dateRange?: { start: Date; end: Date };
    engagementMin?: number;
    tags?: string[];
  }
) => {
  return responses.filter(response => {
    // Filter by status
    if (filters.status && response.status !== filters.status) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateRange) {
      const responseDate = new Date(response.completedAt || response.startedAt);
      if (responseDate < filters.dateRange.start || responseDate > filters.dateRange.end) {
        return false;
      }
    }
    
    // Filter by engagement score
    if (filters.engagementMin !== undefined) {
      const engagementScore = calculateEngagementScore(response);
      if (engagementScore < filters.engagementMin) {
        return false;
      }
    }
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const responseTags = response.tags || [];
      const hasMatchingTag = filters.tags.some(tag => responseTags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * Sort responses by various criteria
 */
export const sortResponses = (responses: any[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') => {
  return [...responses].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.completedAt || a.startedAt).getTime();
        bValue = new Date(b.completedAt || b.startedAt).getTime();
        break;
      case 'engagement':
        aValue = calculateEngagementScore(a);
        bValue = calculateEngagementScore(b);
        break;
      case 'status':
        aValue = a.status || 'incomplete';
        bValue = b.status || 'incomplete';
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

/**
 * Export responses to CSV format
 */
export const exportResponsesToCSV = (responses: any[], surveyData: any): string => {
  if (!responses.length) return '';
  
  const headers = ['Response ID', 'Status', 'Date', 'Engagement Score'];
  const rows = responses.map(response => [
    response._id || '',
    response.status || 'incomplete',
    response.formattedDate || '',
    calculateEngagementScore(response).toString()
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  return csvContent;
};

/**
 * Get response summary for analytics
 */
export const getResponseSummary = (responses: any[]) => {
  const stats = calculateResponseStats(responses);
  
  return {
    ...stats,
    recentResponses: responses
      .filter(r => r.completedAt)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5),
    topEngagement: responses
      .sort((a, b) => calculateEngagementScore(b) - calculateEngagementScore(a))
      .slice(0, 5)
  };
};





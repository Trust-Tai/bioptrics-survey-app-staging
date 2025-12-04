// Date utility functions
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString();
};

export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

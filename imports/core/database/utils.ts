// Database utility functions
export const createAuditLog = async (
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  moduleId: string,
  metadata?: Record<string, any>
) => {
  // Implementation for audit logging
  console.log('Audit log:', { userId, action, resource, resourceId, moduleId, metadata });
};

export const validateObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const sanitizeInput = (input: any): any => {
  // Basic input sanitization
  if (typeof input === 'string') {
    return input.trim();
  }
  return input;
};

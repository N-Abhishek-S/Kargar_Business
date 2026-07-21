export class UIError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'UIError';
  }
}

export const mapHttpErrorToUIError = (status: number, message: string): UIError => {
  switch (status) {
    case 400:
      return new UIError('VALIDATION_FAILED', message);
    case 401:
      return new UIError('UNAUTHORIZED', 'Please log in to continue.');
    case 403:
      return new UIError('FORBIDDEN', 'You do not have permission to perform this action.');
    case 404:
      return new UIError('NOT_FOUND', 'The requested resource could not be found.');
    default:
      return new UIError('SERVER_ERROR', 'An unexpected error occurred. Please try again.');
  }
};

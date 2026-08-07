export class DomainError extends Error {
  public status: number;
  
  constructor(message: string, status: number = 400) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export class MentorNotApprovedError extends DomainError {
  constructor() {
    super('Mentor profile must be approved to perform this action.', 403);
  }
}

export class ProfileIncompleteError extends DomainError {
  constructor(missingFields: string[]) {
    super(`Profile is missing required fields: ${missingFields.join(', ')}`, 400);
  }
}

export class AuthorizationError extends DomainError {
  constructor() {
    super('You do not have permission to perform this action.', 401);
  }
}

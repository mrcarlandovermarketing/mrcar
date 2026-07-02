export class AppsScriptError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'AppsScriptError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AppsScriptConfigurationError extends AppsScriptError {
  constructor(message: string) {
    super(message);
    this.name = 'AppsScriptConfigurationError';
  }
}

export class AppsScriptNetworkError extends AppsScriptError {
  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
    this.name = 'AppsScriptNetworkError';
  }
}

export class AppsScriptInvalidResponseError extends AppsScriptError {
  constructor(message: string, validationErrors?: unknown) {
    super(message, validationErrors);
    this.name = 'AppsScriptInvalidResponseError';
  }
}

export class AppsScriptUnavailableError extends AppsScriptError {
  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
    this.name = 'AppsScriptUnavailableError';
  }
}

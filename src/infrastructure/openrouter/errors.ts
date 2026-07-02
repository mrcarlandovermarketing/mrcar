export class OpenRouterError extends Error {
  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = 'OpenRouterError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class OpenRouterTimeoutError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = 'OpenRouterTimeoutError';
  }
}

export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = 'OpenRouterRateLimitError';
  }
}

export class OpenRouterUnauthorizedError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = 'OpenRouterUnauthorizedError';
  }
}

export class OpenRouterInvalidResponseError extends OpenRouterError {
  constructor(message: string, details?: unknown) {
    super(message, details);
    this.name = 'OpenRouterInvalidResponseError';
  }
}

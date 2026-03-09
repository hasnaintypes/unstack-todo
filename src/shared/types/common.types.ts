export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export class ValidationError extends Error implements ApiError {
  code?: string;
  details?: Record<string, unknown>;

  constructor(message: string, code?: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ValidationError";
    this.code = code;
    this.details = details;
  }
}

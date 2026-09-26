export type TransportErrorCode =
  | 'INVALID_CONFIG'
  | 'INVALID_QUERY'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'RATE_LIMITED'
  | 'HTTP'
  | 'INVALID_RESPONSE';

export interface TransportErrorOptions {
  status?: number;
  retryAfterSeconds?: number;
  cause?: unknown;
}

export class TransportError extends Error {
  readonly code: TransportErrorCode;
  readonly status?: number;
  readonly retryAfterSeconds?: number;
  readonly cause?: unknown;

  constructor(code: TransportErrorCode, message: string, options: TransportErrorOptions = {}) {
    super(message);
    this.name = 'TransportError';
    this.code = code;
    this.status = options.status;
    this.retryAfterSeconds = options.retryAfterSeconds;
    this.cause = options.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isTransportError(value: unknown): value is TransportError {
  return value instanceof TransportError;
}

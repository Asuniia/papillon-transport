import { TransportError } from '../errors/TransportError';

export type Fetcher = (input: string, init: RequestInit) => Promise<Response>;

export interface ClientConfig {
  userAgent: string;
  referer?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetch?: Fetcher;
}

export interface Settings {
  userAgent: string;
  referer?: string;
  baseUrl: string;
  timeoutMs: number;
  fetch: Fetcher;
}

export const DEFAULT_BASE_URL = 'https://api.transitous.org';
export const DEFAULT_TIMEOUT_MS = 10_000;

const BASE_URL_PATTERN = /^https?:\/\/[^\s/?#]+(\/[^\s?#]*)?$/i;

export function resolveConfig(config: ClientConfig): Settings {
  if (typeof config !== 'object' || config === null) {
    throw invalidConfig('config must be an object');
  }

  const userAgent = typeof config.userAgent === 'string' ? config.userAgent.trim() : '';
  if (userAgent === '') {
    throw invalidConfig(
      'userAgent is required: identify your app, its version and a contact (Transitous usage policy)',
    );
  }

  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  if (typeof timeoutMs !== 'number' || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw invalidConfig('timeoutMs must be a positive finite number');
  }

  const baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).trim().replace(/\/+$/, '');
  if (!BASE_URL_PATTERN.test(baseUrl)) {
    throw invalidConfig(`baseUrl must be an http(s) URL without query or fragment, got "${String(config.baseUrl)}"`);
  }

  const fetchImpl = config.fetch ?? (globalThis as { fetch?: Fetcher }).fetch;
  if (typeof fetchImpl !== 'function') {
    throw invalidConfig('no fetch implementation available: pass config.fetch');
  }

  const referer =
    typeof config.referer === 'string' && config.referer.trim() !== '' ? config.referer.trim() : undefined;

  return {
    userAgent,
    referer,
    baseUrl,
    timeoutMs,
    fetch: (input, init) => fetchImpl(input, init),
  };
}

function invalidConfig(message: string): TransportError {
  return new TransportError('INVALID_CONFIG', message);
}

import { TransportError } from '../errors/TransportError';
import { isRecord } from '../utils/guards';
import type { Fetcher } from './config';

export interface GetJsonRequest {
  url: string;
  userAgent: string;
  referer?: string;
  timeoutMs: number;
  signal?: AbortSignal;
  fetch: Fetcher;
}

const MAX_ERROR_DETAIL_LENGTH = 200;

export async function getJson(request: GetJsonRequest): Promise<unknown> {
  const { signal } = request;
  if (signal?.aborted) {
    throw new TransportError('ABORTED', 'Request aborted by caller');
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, request.timeoutMs);
  const onCallerAbort = (): void => controller.abort();
  signal?.addEventListener('abort', onCallerAbort);

  const aborted = new Promise<never>((_resolve, reject) => {
    controller.signal.addEventListener('abort', () => reject(new Error('Request aborted')));
  });
  aborted.catch(() => undefined);
  const untilAborted = <T>(promise: Promise<T>): Promise<T> => Promise.race([promise, aborted]);

  const classify = (cause: unknown): TransportError => {
    if (timedOut) {
      return new TransportError('TIMEOUT', `Request timed out after ${request.timeoutMs} ms`, {
        cause,
      });
    }
    if (signal?.aborted) {
      return new TransportError('ABORTED', 'Request aborted by caller', { cause });
    }
    return new TransportError('NETWORK', 'Network request failed', { cause });
  };

  try {
    let response: Response;
    try {
      response = await untilAborted(
        request.fetch(request.url, {
          method: 'GET',
          headers: buildHeaders(request),
          signal: controller.signal,
        }),
      );
    } catch (cause) {
      throw classify(cause);
    }

    if (response.status === 429) {
      throw new TransportError('RATE_LIMITED', 'Rate limited by the routing server', {
        status: 429,
        retryAfterSeconds: parseRetryAfter(response.headers.get('Retry-After'), Date.now()),
      });
    }

    let body: string;
    try {
      body = await untilAborted(response.text());
    } catch (cause) {
      throw classify(cause);
    }

    if (!response.ok) {
      throw new TransportError('HTTP', `Routing server responded with HTTP ${response.status}${formatDetail(body)}`, {
        status: response.status,
      });
    }

    try {
      return JSON.parse(body) as unknown;
    } catch (cause) {
      throw new TransportError('INVALID_RESPONSE', 'Routing server returned invalid JSON', {
        cause,
      });
    }
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onCallerAbort);
  }
}

export function parseRetryAfter(value: string | null, now: number): number | undefined {
  if (value === null) {
    return undefined;
  }
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  const date = Date.parse(trimmed);
  if (Number.isNaN(date)) {
    return undefined;
  }
  return Math.max(0, Math.ceil((date - now) / 1000));
}

function buildHeaders(request: GetJsonRequest): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': request.userAgent,
  };
  if (request.referer) {
    headers.Referer = request.referer;
  }
  return headers;
}

function formatDetail(body: string): string {
  let detail = body.trim();
  try {
    const parsed: unknown = JSON.parse(body);
    if (isRecord(parsed) && typeof parsed.error === 'string') {
      detail = parsed.error;
    }
  } catch {}
  return detail === '' ? '' : `: ${detail.slice(0, MAX_ERROR_DETAIL_LENGTH)}`;
}

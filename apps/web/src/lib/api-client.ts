const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** Błędy zwracane przez API w ustalonym kształcie (Nest + ZodValidationPipe). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Brak sesji lub token wygasł — sygnał do przekierowania na /login. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

interface ApiErrorBody {
  message?: string | string[];
  errors?: Record<string, string[]>;
}

function readErrorMessage(body: unknown, fallback: string): string {
  if (typeof body !== 'object' || body === null) {
    return fallback;
  }

  const { message } = body as ApiErrorBody;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  return message ?? fallback;
}

function readFieldErrors(body: unknown): Record<string, string[]> | undefined {
  if (typeof body !== 'object' || body === null) {
    return undefined;
  }

  return (body as ApiErrorBody).errors;
}

/**
 * Cienki wrapper nad fetch.
 *
 * `credentials: 'include'` jest kluczowe: token siedzi w ciasteczku httpOnly,
 * którego JS nie widzi, więc przeglądarka musi je dołączyć sama. Wymaga to
 * po stronie API `cors({ credentials: true, origin: <dokładny origin> })`.
 */
export async function apiFetch<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      readErrorMessage(body, `Żądanie nie powiodło się (HTTP ${response.status})`),
      readFieldErrors(body),
    );
  }

  return body as TResponse;
}

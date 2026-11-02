import { API_URL, expect, test } from './fixtures';

/**
 * Every endpoint is protected by the global JwtCookieGuard unless it is marked
 * `@Public()`. This suite discovers all routes from the live OpenAPI document, so a
 * new controller is covered without touching this file. Making an endpoint public
 * is a deliberate decision: it fails here until it is added to the list below.
 */
const PUBLIC_ENDPOINTS = new Set(['GET /health', 'POST /auth/login', 'POST /auth/logout']);

const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;
const PLACEHOLDER_ID = '00000000-0000-4000-8000-000000000000';

interface OpenApiDocument {
  paths: Record<string, Partial<Record<(typeof HTTP_METHODS)[number], unknown>>>;
}

test('every non-public endpoint rejects requests without a session cookie', async ({ request }) => {
  const docResponse = await request.get(`${API_URL}/docs-json`);
  expect(docResponse.ok(), 'OpenAPI document must be served outside production').toBe(true);
  const doc = (await docResponse.json()) as OpenApiDocument;

  const discovered = new Set<string>();
  const unexpectedlyOpen: string[] = [];

  for (const [path, operations] of Object.entries(doc.paths)) {
    for (const method of HTTP_METHODS) {
      if (!operations[method]) continue;

      const endpoint = `${method.toUpperCase()} ${path}`;
      discovered.add(endpoint);
      if (PUBLIC_ENDPOINTS.has(endpoint)) continue;

      const url = API_URL + path.replace(/\{[^}]+\}/g, PLACEHOLDER_ID);
      const response = await request.fetch(url, { method, data: {} });

      if (response.status() !== 401) {
        unexpectedlyOpen.push(`${endpoint} → ${response.status()}`);
      }
    }
  }

  expect(discovered.size, 'OpenAPI document lists no endpoints').toBeGreaterThan(0);
  expect(unexpectedlyOpen, 'these endpoints answered without a session').toEqual([]);

  const stalePublic = [...PUBLIC_ENDPOINTS].filter((endpoint) => !discovered.has(endpoint));
  expect(stalePublic, 'PUBLIC_ENDPOINTS lists routes that no longer exist').toEqual([]);
});

test('a forged session cookie is rejected', async ({ request }) => {
  const response = await request.get(`${API_URL}/schools`, {
    headers: { cookie: `${process.env.AUTH_COOKIE_NAME ?? 'lokalizator_token'}=forged.jwt.token` },
  });

  expect(response.status()).toBe(401);
});

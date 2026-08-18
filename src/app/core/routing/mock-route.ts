const MOCK_ROUTE_PATTERN = /(?:^|\/)mock(?:\/|$)/;

export function isMockRoute(pathname = globalThis.location?.pathname || ''): boolean {
  return MOCK_ROUTE_PATTERN.test(pathname);
}

export function mockDataUrl(): string {
  const baseUrl = globalThis.document?.baseURI || globalThis.location?.href || 'http://localhost/';
  return new URL('mock.json', baseUrl).toString();
}

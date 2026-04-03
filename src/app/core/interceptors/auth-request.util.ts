const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

export function isAuthRequest(url: string): boolean {
  return AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

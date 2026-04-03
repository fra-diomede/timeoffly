import { environment } from '../../../environments/environment';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

export function isBackendApiRequest(url: string): boolean {
  return url.startsWith(environment.apiBaseUrl);
}

export function isAuthRequest(url: string): boolean {
  return isBackendApiRequest(url) && AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
}

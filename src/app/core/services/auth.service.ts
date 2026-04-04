import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthSession, LoginRequest, RefreshRequest, RegisterRequest } from '../../models/auth.model';
import { SKIP_GLOBAL_HTTP_ERROR_HANDLING } from '../interceptors/error-handler.context';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly sessionSubject: BehaviorSubject<AuthSession | null>;
  readonly session$: Observable<AuthSession | null>;

  constructor(
    private http: HttpClient,
    private storage: TokenStorageService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.sessionSubject = new BehaviorSubject<AuthSession | null>(this.storage.getSession());
    this.session$ = this.sessionSubject.asObservable();
  }

  login(req: LoginRequest): Observable<AuthSession> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, req).pipe(
      map(resp => this.applyAuthResponse(resp)),
      tap(session => this.setSession(session))
    );
  }

  register(req: RegisterRequest, options?: { context?: HttpContext }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/register`, req, {
      context: options?.context
    });
  }

  refresh(): Observable<AuthSession> {
    const refreshToken = this.getRefreshToken();
    const payload: RefreshRequest = { refreshToken: refreshToken ?? '' };
    const context = new HttpContext().set(SKIP_GLOBAL_HTTP_ERROR_HANDLING, true);

    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, payload, { context }).pipe(
      map(resp => this.applyAuthResponse(resp, { mergeWithCurrent: true })),
      tap(session => this.setSession(session))
    );
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return of(void 0);
    }

    return this.http.post<void>(`${this.baseUrl}/auth/logout`, { refreshToken }).pipe(
      finalize(() => this.clearSession())
    );
  }

  redirectToLogin() {
    if (!isPlatformBrowser(this.platformId) || this.router.url.startsWith('/auth/')) {
      return;
    }

    void this.router.navigate(['/auth/login'], {
      replaceUrl: true,
      queryParams: {
        redirectTo: this.resolvePostAuthUrl(this.router.url)
      }
    });
  }

  handleUnauthorized() {
    this.clearSession();
    this.redirectToLogin();
  }

  getAccessToken() {
    return this.sessionSubject.value?.accessToken ?? null;
  }

  getRefreshToken() {
    return this.sessionSubject.value?.refreshToken ?? null;
  }

  getSession() {
    return this.sessionSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  hasAnyRole(roles: string[]): boolean {
    const currentRoles = this.sessionSubject.value?.ruoli ?? [];
    return roles.some(role => currentRoles.includes(role) || currentRoles.includes(`ROLE_${role}`));
  }

  resolvePostAuthUrl(candidate?: string | null, fallback = '/dashboard'): string {
    const normalizedCandidate = this.normalizeString(candidate);
    if (!normalizedCandidate || !normalizedCandidate.startsWith('/') || normalizedCandidate.startsWith('/auth/')) {
      return fallback;
    }

    return normalizedCandidate;
  }

  clearSession() {
    this.sessionSubject.next(null);
    this.storage.clear();
  }

  private setSession(session: AuthSession) {
    this.sessionSubject.next(session);
    this.storage.setSession(session);
  }

  private applyAuthResponse(resp: AuthResponse, options?: { mergeWithCurrent?: boolean }): AuthSession {
    const current = options?.mergeWithCurrent ? this.sessionSubject.value : null;
    const accessToken = this.normalizeString(resp.accessToken) ?? current?.accessToken ?? null;
    const refreshToken = this.normalizeString(resp.refreshToken) ?? current?.refreshToken ?? null;

    if (!accessToken) {
      throw new Error('Risposta di autenticazione non valida: access token mancante');
    }

    return {
      tokenType: this.normalizeString(resp.tokenType) ?? current?.tokenType ?? 'Bearer',
      accessToken,
      refreshToken,
      expiresAt: this.normalizeString(resp.expiresAt) ?? current?.expiresAt ?? null,
      username: this.normalizeString(resp.username) ?? current?.username ?? '',
      nome: this.normalizeString(resp.nome) ?? current?.nome ?? null,
      cognome: this.normalizeString(resp.cognome) ?? current?.cognome ?? null,
      ruoli: Array.isArray(resp.ruoli) ? resp.ruoli : current?.ruoli ?? []
    };
  }

  private normalizeString(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmedValue = value.trim();
    return trimmedValue ? trimmedValue : null;
  }
}

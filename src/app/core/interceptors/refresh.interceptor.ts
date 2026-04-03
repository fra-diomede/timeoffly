import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { isAuthRequest, isBackendApiRequest } from './auth-request.util';
import { AuthService } from '../services/auth.service';
import { RefreshTokenService } from '../services/refresh-token.service';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private refreshService: RefreshTokenService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: unknown) => {
        if (
          !isBackendApiRequest(req.url) ||
          !(error instanceof HttpErrorResponse) ||
          error.status !== 401 ||
          isAuthRequest(req.url)
        ) {
          return throwError(() => error);
        }

        return this.refreshService.refreshAccessToken().pipe(
          switchMap(() => {
            const token = this.authService.getAccessToken();
            if (!token) {
              this.authService.clearSession();
              return throwError(() => error);
            }

            const tokenType = this.authService.getSession()?.tokenType ?? 'Bearer';
            const retry = req.clone({
              setHeaders: { Authorization: `${tokenType} ${token}` }
            });

            return next.handle(retry);
          }),
          catchError(() => {
            this.authService.clearSession();
            return throwError(() => error);
          })
        );
      })
    );
  }
}

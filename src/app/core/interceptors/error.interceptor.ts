import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SKIP_GLOBAL_HTTP_ERROR_HANDLING } from './error-handler.context';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

const AUTHENTICATION_ERROR_MESSAGE = 'Problema di autenticazione, rieseguire il login';
const DEFAULT_SERVER_ERROR_MESSAGE = 'Errore nel server, riprovare pi\u00F9 tardi';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notifications: NotificationService,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: unknown) => {
        if (req.context.get(SKIP_GLOBAL_HTTP_ERROR_HANDLING)) {
          return throwError(() => error);
        }

        const httpError = this.toHttpErrorResponse(error, req);
        const message = this.resolveMessage(httpError);

        this.notifications.error(message, {
          dedupeKey: `http-error:${message}`
        });

        if (httpError.status === 401) {
          this.authService.handleUnauthorized();
        }

        return throwError(() => httpError);
      })
    );
  }

  private resolveMessage(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return AUTHENTICATION_ERROR_MESSAGE;
    }

    if (error.status === 400 || error.status === 500) {
      return this.extractBackendMessage(error.error) ?? DEFAULT_SERVER_ERROR_MESSAGE;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  }

  private extractBackendMessage(payload: unknown, depth = 0): string | null {
    if (payload == null || depth > 4) {
      return null;
    }

    if (typeof payload === 'string') {
      return this.normalizeMessage(payload);
    }

    if (Array.isArray(payload)) {
      for (const item of payload) {
        const message = this.extractBackendMessage(item, depth + 1);
        if (message) {
          return message;
        }
      }

      return null;
    }

    if (typeof payload !== 'object') {
      return null;
    }

    const record = payload as Record<string, unknown>;

    for (const key of ['message', 'error', 'detail', 'title'] as const) {
      const message = this.extractBackendMessage(record[key], depth + 1);
      if (message) {
        return message;
      }
    }

    const errors = record['errors'];
    if (errors && typeof errors === 'object') {
      const values = Array.isArray(errors) ? errors : Object.values(errors as Record<string, unknown>);
      for (const value of values) {
        const message = this.extractBackendMessage(value, depth + 1);
        if (message) {
          return message;
        }
      }
    }

    return null;
  }

  private normalizeMessage(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  private toHttpErrorResponse(error: unknown, req: HttpRequest<unknown>): HttpErrorResponse {
    if (error instanceof HttpErrorResponse) {
      return error;
    }

    return new HttpErrorResponse({
      error,
      status: 0,
      statusText: 'Unknown Error',
      url: req.urlWithParams
    });
  }
}

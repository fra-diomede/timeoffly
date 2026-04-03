import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { isAuthRequest, isBackendApiRequest } from './auth-request.util';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!isBackendApiRequest(req.url) || isAuthRequest(req.url)) {
      return next.handle(req);
    }

    const session = this.authService.getSession();
    const token = session?.accessToken;
    if (!token) {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `${session?.tokenType ?? 'Bearer'} ${token}`
      }
    });

    return next.handle(authReq);
  }
}

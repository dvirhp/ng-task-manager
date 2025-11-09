import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, catchError, switchMap, BehaviorSubject } from 'rxjs';
import { AuthService } from '../services/auth.service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private refreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();

    // Identify if this is a refresh request to avoid handling it again
    const isRefreshRequest = req.url.includes('/auth/refresh');

    // Add Authorization header only if a token exists and it is not a refresh request
    const cloned =
      token && !isRefreshRequest
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle only 401 errors and skip refresh requests
        if (error.status === 401 && !isRefreshRequest) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.refreshing) {
      this.refreshing = true;
      this.refreshSubject.next(null);

      return this.auth.refresh().pipe(
        switchMap((res) => {
          this.refreshing = false;
          const newToken = res.data?.accessToken || null;

          if (newToken) {
            // Store the new token
            this.auth.storeToken(newToken);
            this.refreshSubject.next(newToken);

            // Retry the original request with the new token
            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` },
            });
            return next.handle(cloned);
          }

          return throwError(() => new Error('No token received from refresh'));
        }),
        catchError((err) => {
          // On refresh failure, clear tokens and redirect to login
          this.refreshing = false;
          this.auth.clearToken();
          window.location.href = '/auth/login';
          return throwError(() => err);
        }),
      );
    } else {
      // Wait for ongoing refresh if multiple requests failed simultaneously
      return this.refreshSubject.pipe(
        switchMap((token) => {
          if (token) {
            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
            });
            return next.handle(cloned);
          }
          return throwError(() => new Error('Token refresh failed'));
        }),
      );
    }
  }
}

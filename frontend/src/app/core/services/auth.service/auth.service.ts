import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../utils/api-response';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  // Send login request and store tokens if successful
  login(
    data: LoginRequest,
  ): Observable<ApiResponse<{ accessToken: string; refreshToken?: string }>> {
    return this.postAndStore<{ accessToken: string; refreshToken?: string }>('login', data);
  }

  // Send registration request and store tokens if successful
  register(
    data: RegisterRequest,
  ): Observable<ApiResponse<{ accessToken: string; refreshToken?: string }>> {
    return this.postAndStore<{ accessToken: string; refreshToken?: string }>('register', data);
  }

  // Request a new access token using the refresh cookie
  refresh(): Observable<ApiResponse<{ accessToken: string; refreshToken?: string }>> {
    return this.postAndStore<{ accessToken: string; refreshToken?: string }>('refresh');
  }

  // Logout user and remove stored access token
  logout(): Observable<ApiResponse<null>> {
    return this.http
      .post<ApiResponse<null>>(`${this.api}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.clearToken()));
  }

  // Helper method: Send POST request and store access token automatically if returned
  private postAndStore<T>(endpoint: string, body: any = {}): Observable<ApiResponse<T>> {
    return this.http
      .post<ApiResponse<T>>(`${this.api}/${endpoint}`, body, { withCredentials: true })
      .pipe(tap((res) => this.storeToken((res.data as any)?.accessToken)));
  }

  // Save JWT access token to localStorage
  storeToken(token?: string): void {
    if (token) localStorage.setItem('accessToken', token);
  }

  // Get stored access token from localStorage
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Remove stored access token from localStorage
  clearToken(): void {
    localStorage.removeItem('accessToken');
  }
}

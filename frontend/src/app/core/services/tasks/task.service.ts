import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, map, catchError, throwError } from 'rxjs';
import { getAuthHeaders } from '../../utils/http-helpers';
import { ApiResponse } from '../../utils/api-response';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  done: boolean;
  list: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private baseUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  private get headers() {
    return getAuthHeaders();
  }

  // Get all tasks for a specific list
  getByList(listId: string): Observable<Task[]> {
    return this.http
      .get<ApiResponse<Task[]>>(`${this.baseUrl}/list/${listId}`, { headers: this.headers })
      .pipe(
        map((res) => res.data ?? []),
        catchError(this.handleError),
      );
  }

  // Create a new task under a given list
  create(listId: string, data: { title: string; description?: string }): Observable<Task> {
    const payload = { ...data, list: listId };
    return this.http.post<ApiResponse<Task>>(this.baseUrl, payload, { headers: this.headers }).pipe(
      map((res) => res.data),
      catchError(this.handleError),
    );
  }

  // Update an existing task by its ID
  update(id: string, data: Partial<Task>): Observable<Task> {
    return this.http
      .put<ApiResponse<Task>>(`${this.baseUrl}/${id}`, data, { headers: this.headers })
      .pipe(
        map((res) => res.data),
        catchError(this.handleError),
      );
  }

  // Delete a task by its ID
  delete(id: string): Observable<ApiResponse<any>> {
    return this.http
      .delete<ApiResponse<any>>(`${this.baseUrl}/${id}`, { headers: this.headers })
      .pipe(catchError(this.handleError));
  }

  // Handle API errors and return a readable message
  private handleError(err: any) {
    console.error('TaskService error:', err);
    return throwError(() => new Error(err.error?.message || 'Unexpected error'));
  }
}

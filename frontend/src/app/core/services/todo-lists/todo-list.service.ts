import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, map } from 'rxjs';
import { getAuthHeaders } from '../../utils/http-helpers';
import { ApiResponse } from '../../utils/api-response';

export interface SharedUser {
  _id: string;
  name?: string;
  email?: string;
}

export interface TodoList {
  _id: string;
  title: string;
  description?: string;
  isArchived?: boolean;
  owner: SharedUser;
  sharedWith: SharedUser[];
  tasks?: any[];
}

@Injectable({
  providedIn: 'root',
})
export class TodoListService {
  private baseUrl = `${environment.apiUrl}/lists`;

  constructor(private http: HttpClient) {}

  // Convert the list response into a consistent structure
  private normalizeList(list: TodoList): TodoList {
    const normalizeUser = (u: any): SharedUser =>
      typeof u === 'string' ? { _id: u } : { _id: u._id, name: u.name, email: u.email };

    return {
      ...list,
      owner: normalizeUser(list.owner),
      sharedWith: Array.isArray(list.sharedWith) ? list.sharedWith.map(normalizeUser) : [],
    };
  }

  // Get all todo lists (owned and shared)
  getAll(): Observable<TodoList[]> {
    const headers = getAuthHeaders();
    return this.http.get<ApiResponse<any>>(this.baseUrl, { headers }).pipe(
      map((res) => {
        const lists = Array.isArray(res.data) ? res.data : [];
        return lists.map((l: any) => this.normalizeList(l));
      }),
    );
  }

  // Create a new todo list
  create(data: { title: string; description?: string }): Observable<TodoList> {
    const headers = getAuthHeaders();
    return this.http
      .post<ApiResponse<TodoList>>(this.baseUrl, data, { headers })
      .pipe(map((res) => this.normalizeList(res.data)));
  }

  // Update an existing todo list
  update(id: string, data: Partial<TodoList>): Observable<TodoList> {
    const headers = getAuthHeaders();
    return this.http
      .put<ApiResponse<TodoList>>(`${this.baseUrl}/${id}`, data, { headers })
      .pipe(map((res) => this.normalizeList(res.data)));
  }

  // Delete a todo list by ID
  delete(id: string): Observable<void> {
    const headers = getAuthHeaders();
    return this.http
      .delete<ApiResponse<TodoList>>(`${this.baseUrl}/${id}`, { headers })
      .pipe(map(() => void 0));
  }

  // Get a single todo list by its ID
  getById(id: string): Observable<TodoList> {
    const headers = getAuthHeaders();
    return this.http
      .get<ApiResponse<TodoList>>(`${this.baseUrl}/${id}`, { headers })
      .pipe(map((res) => this.normalizeList(res.data)));
  }

  // Share a list with another user by email
  shareList(listId: string, email: string): Observable<TodoList> {
    const headers = getAuthHeaders();
    return this.http
      .post<ApiResponse<TodoList>>(`${this.baseUrl}/${listId}/share`, { email }, { headers })
      .pipe(map((res) => this.normalizeList(res.data)));
  }

  // Remove a shared user (by owner or the user themself)
  removeSharedUser(listId: string, userId?: string): Observable<TodoList> {
    const headers = getAuthHeaders();
    const body = userId ? { userId } : {};
    return this.http
      .post<ApiResponse<TodoList>>(`${this.baseUrl}/${listId}/unshare`, body, { headers })
      .pipe(map((res) => this.normalizeList(res.data)));
  }
}

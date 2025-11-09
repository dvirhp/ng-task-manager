import { HttpHeaders } from '@angular/common/http';

// Create and return HTTP headers with Authorization token and JSON content type
export function getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('accessToken');
  return new HttpHeaders({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });
}

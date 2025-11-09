// Generic API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  timestamp: string;
}

// Build success response object
export function successResponse<T>(
  message: string,
  data?: T,
  status: number = 200,
): ApiResponse<T> {
  const response: any = {
    success: true,
    status,
    message,
    timestamp: new Date().toISOString(),
  };

  // Add data only if defined
  if (data !== undefined) response.data = data;
  return response;
}

// Build error response object
export function errorResponse<T>(message: string, status: number = 500, data?: T): ApiResponse<T> {
  const response: any = {
    success: false,
    status,
    message,
    timestamp: new Date().toISOString(),
  };

  // Include extra data if provided
  if (data !== undefined) response.data = data;
  return response;
}

// API base URL configuration mapping
export const API_BASE_URL = '/server/ai-cios';

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Inject default headers
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // AI chat endpoints can take longer, so we default to 60s. Other requests default to 15s.
  const timeoutMs = options.timeout ?? (endpoint.startsWith('/ai') ? 60000 : 15000);

  // Timeout logic
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensures Catalyst session cookies are sent
      signal: controller.signal
    });

    clearTimeout(id);

    if (!response.ok) {
      if (response.status === 401) {
        // Global handler for unauthorized
        window.dispatchEvent(new CustomEvent('unauthorized_error'));
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}

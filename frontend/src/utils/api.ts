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

  // Combine external cancellation signal if provided
  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensures Catalyst session cookies are sent
      signal: controller.signal
    });

    clearTimeout(id);

    let data: any = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Global handler for unauthorized
        window.dispatchEvent(new CustomEvent('unauthorized_error'));
      }
      let errorMessage = `HTTP error! Status: ${response.status}`;
      if (data && typeof data === 'object') {
        errorMessage = data.error || data.message || data.details || JSON.stringify(data);
      } else if (typeof data === 'string' && data.trim()) {
        errorMessage = data;
      }
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw error;
  }
}

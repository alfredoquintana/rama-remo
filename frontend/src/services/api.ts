import { appConfig } from '../app/config';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null;
};

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(
    path: string,
    body?: RequestOptions['body'],
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body,
    });
  }

  private async request<T>(path: string, options: RequestOptions): Promise<T> {
    const headers = new Headers(options.headers);
    const normalizedBody = this.normalizeBody(options.body);

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      body: normalizedBody,
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  }

  private normalizeBody(body: RequestOptions['body']): BodyInit | undefined {
    if (body == null) {
      return undefined;
    }

    if (
      typeof body === 'string' ||
      body instanceof FormData ||
      body instanceof URLSearchParams
    ) {
      return body;
    }

    return JSON.stringify(body);
  }
}

export const apiClient = new ApiClient(appConfig.apiBaseUrl);

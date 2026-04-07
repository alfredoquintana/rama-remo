import { appConfig } from '../app/config';
import { getAccessToken } from '../app/session';

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

  async patch<T>(
    path: string,
    body?: RequestOptions['body'],
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body,
    });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  }

  private async request<T>(path: string, options: RequestOptions): Promise<T> {
    const headers = new Headers(options.headers);
    const normalizedBody = this.normalizeBody(options.body);
    const accessToken = getAccessToken();

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (accessToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      body: normalizedBody,
    });

    if (!response.ok) {
      throw new Error(await this.extractErrorMessage(response));
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

  private async extractErrorMessage(response: Response) {
    try {
      const data = (await response.json()) as {
        message?: string | string[];
        error?: string;
      };

      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }

      return (
        data.message ??
        data.error ??
        `No se pudo completar la solicitud. Codigo ${response.status}.`
      );
    } catch {
      return `No se pudo completar la solicitud. Codigo ${response.status}.`;
    }
  }
}

export const apiClient = new ApiClient(appConfig.apiBaseUrl);

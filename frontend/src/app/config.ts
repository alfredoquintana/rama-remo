const defaultApiBaseUrl = 'http://localhost:3001';

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl,
};

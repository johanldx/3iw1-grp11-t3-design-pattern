export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type RequestInterceptor = (request: RequestInit) => RequestInit | Promise<RequestInit>;

/** Client JSON générique basé sur fetch avec timeout et interceptors. */
export class HttpClient {
  private readonly interceptors: RequestInterceptor[] = [];
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetcher: typeof fetch;

  constructor(baseUrl = '', timeoutMs = 8_000, fetcher: typeof fetch = fetch) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this.fetcher = fetcher;
  }

  use(interceptor: RequestInterceptor): void {
    this.interceptors.push(interceptor);
  }

  get<T>(path: string): Promise<T> { return this.request<T>('GET', path); }
  post<T>(path: string, body: unknown): Promise<T> { return this.request<T>('POST', path, body); }
  put<T>(path: string, body: unknown): Promise<T> { return this.request<T>('PUT', path, body); }
  delete<T>(path: string): Promise<T> { return this.request<T>('DELETE', path); }

  async request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), this.timeoutMs);
    let options: RequestInit = {
      method,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    };
    try {
      for (const interceptor of this.interceptors) options = await interceptor(options);
      const response = await this.fetcher(`${this.baseUrl}${path}`, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      if (response.status === 204) return undefined as T;
      return await response.json() as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`La requête a dépassé ${this.timeoutMs} ms.`);
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }
}

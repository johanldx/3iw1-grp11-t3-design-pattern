/** Méthodes HTTP prises en charge par le client générique. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Fonction capable d'enrichir les options d'une requête avant son envoi. */
export type RequestInterceptor = (request: RequestInit) => RequestInit | Promise<RequestInit>;

/** Signature de l'implémentation `fetch` injectée dans le client HTTP. */
export type HttpFetcher = typeof fetch;

const createDefaultFetcher = (): HttpFetcher => globalThis.fetch.bind(globalThis);

/** Client JSON générique basé sur fetch avec timeout et interceptors. */
export class HttpClient {
  private readonly interceptors: RequestInterceptor[] = [];
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetcher: HttpFetcher;

  /**
   * Initialise un client HTTP JSON.
   *
   * @param baseUrl Préfixe appliqué à chaque requête.
   * @param timeoutMs Délai maximal avant annulation de la requête.
   * @param fetcher Implémentation de `fetch` injectable pour les tests.
   */
  constructor(
    baseUrl = '',
    timeoutMs = 8_000,
    fetcher: HttpFetcher = createDefaultFetcher(),
  ) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this.fetcher = (input, init) => fetcher.call(globalThis, input, init);
  }

  /**
   * Ajoute un interceptor appliqué avant l'envoi de chaque requête.
   *
   * @param interceptor Fonction de transformation des options de requête.
   */
  use(interceptor: RequestInterceptor): void {
    this.interceptors.push(interceptor);
  }

  /**
   * Envoie une requête GET.
   *
   * @param path Chemin cible.
   * @returns Réponse JSON typée.
   */
  get<T>(path: string): Promise<T> { return this.request<T>('GET', path); }

  /**
   * Envoie une requête POST JSON.
   *
   * @param path Chemin cible.
   * @param body Corps JSON à transmettre.
   * @returns Réponse JSON typée.
   */
  post<T>(path: string, body: unknown): Promise<T> { return this.request<T>('POST', path, body); }

  /**
   * Envoie une requête PUT JSON.
   *
   * @param path Chemin cible.
   * @param body Corps JSON à transmettre.
   * @returns Réponse JSON typée.
   */
  put<T>(path: string, body: unknown): Promise<T> { return this.request<T>('PUT', path, body); }

  /**
   * Envoie une requête DELETE.
   *
   * @param path Chemin cible.
   * @returns Réponse JSON typée.
   */
  delete<T>(path: string): Promise<T> { return this.request<T>('DELETE', path); }

  /**
   * Envoie une requête HTTP arbitraire avec timeout et gestion JSON.
   *
   * @param method Méthode HTTP à utiliser.
   * @param path Chemin cible.
   * @param body Corps JSON optionnel.
   * @returns Réponse JSON typée.
   */
  async request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), this.timeoutMs);
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
      globalThis.clearTimeout(timeout);
    }
  }
}

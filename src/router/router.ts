import { Observable, type Unsubscribe } from '../core/observer.ts';

/**
 * Décrit une route résolue avec son motif et ses paramètres extraits.
 */
export interface RouteMatch {
  path: string;
  pattern: string;
  params: Record<string, string>;
}

/**
 * Gère la navigation cliente à l'aide de la History API et d'un observable de route active.
 */
export class Router {
  private readonly routes: readonly string[];
  private readonly route$ = new Observable<string>();
  private readonly popstateHandler = (): void => {
    this.syncRoute();
  };
  private currentMatch: RouteMatch;

  /**
   * Initialise le routeur avec la liste des motifs de route autorisés.
   *
   * @param routes Liste des routes gérées par l'application.
   */
  constructor(routes: readonly string[]) {
    this.routes = routes;
    this.currentMatch = this.match(window.location.pathname);
    window.addEventListener('popstate', this.popstateHandler);
    this.route$.next(this.currentMatch.path);
  }

  /**
   * Abonne un callback aux changements de route active.
   *
   * @param callback Fonction appelée à chaque navigation.
   * @returns Fonction permettant de se désabonner.
   */
  subscribe(callback: (path: string) => void): Unsubscribe {
    return this.route$.subscribe(callback);
  }

  /**
   * Navigue vers une nouvelle route en ajoutant une entrée à l'historique.
   *
   * @param path Chemin cible.
   * @param state État d'historique optionnel.
   */
  navigate(path: string, state?: unknown): void {
    const normalizedPath = this.normalizePath(path);
    window.history.pushState(state ?? null, '', normalizedPath);
    this.syncRoute();
  }

  /**
   * Remplace la route courante sans ajouter de nouvelle entrée d'historique.
   *
   * @param path Chemin cible.
   * @param state État d'historique optionnel.
   */
  replace(path: string, state?: unknown): void {
    const normalizedPath = this.normalizePath(path);
    window.history.replaceState(state ?? null, '', normalizedPath);
    this.syncRoute();
  }

  /**
   * Retourne le chemin actuellement actif.
   *
   * @returns Chemin normalisé courant.
   */
  getCurrentPath(): string {
    return this.currentMatch.path;
  }

  /**
   * Retourne la dernière route résolue avec son motif et ses paramètres.
   *
   * @returns Objet de correspondance de route courant.
   */
  getCurrentMatch(): RouteMatch {
    return this.currentMatch;
  }

  /**
   * Nettoie les écouteurs globaux installés par le routeur.
   */
  destroy(): void {
    window.removeEventListener('popstate', this.popstateHandler);
  }

  private syncRoute(): void {
    this.currentMatch = this.match(window.location.pathname);
    this.route$.next(this.currentMatch.path);
  }

  private match(pathname: string): RouteMatch {
    const path = this.normalizePath(pathname);

    for (const pattern of this.routes) {
      const params = this.extractParams(pattern, path);

      if (params) {
        return {
          path,
          pattern,
          params,
        };
      }
    }

    return {
      path,
      pattern: '/404',
      params: {},
    };
  }

  private extractParams(pattern: string, path: string): Record<string, string> | null {
    const patternSegments = pattern.split('/').filter(Boolean);
    const pathSegments = path.split('/').filter(Boolean);

    if (patternSegments.length !== pathSegments.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (const [index, segment] of patternSegments.entries()) {
      const candidate = pathSegments[index];

      if (segment.startsWith(':')) {
        params[segment.slice(1)] = decodeURIComponent(candidate);
        continue;
      }

      if (segment !== candidate) {
        return null;
      }
    }

    return params;
  }

  private normalizePath(path: string): string {
    if (!path || path === '/') {
      return '/';
    }

    const normalized = path.startsWith('/') ? path : `/${path}`;
    return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  }
}

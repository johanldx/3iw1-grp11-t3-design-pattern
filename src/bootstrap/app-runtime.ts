import { createAppShell } from './app-shell.ts';
import { renderRouteView } from './render-route-view.ts';
import { Observable } from '../core/observer.ts';
import { AppConfig, AppStore } from '../core/singleton.ts';
import { Router } from '../router/router.ts';
import { TagFactory } from '../core/factory.ts';
import { LocalStorageAdapter } from '../core/strategy.ts';

const configureApp = (): AppConfig => {
  const appConfig = AppConfig.getInstance();
  appConfig.set('apiUrl', '/api/fuel-prices');
  appConfig.set('currency', 'EUR');
  appConfig.set('distanceUnit', 'km');
  appConfig.set('defaultStorageStrategy', 'localStorage');
  return appConfig;
};

const createNavButton = (
  label: string,
  path: string,
  currentPath: string,
  router: Router,
): HTMLButtonElement =>
  TagFactory.toHtml('button', {
    text: label,
    styles: {
      padding: '0.7rem 0.95rem',
      border: currentPath === path ? '1px solid #0f766e' : '1px solid #dbe3f0',
      borderRadius: '999px',
      background: currentPath === path ? '#ecfdf5' : '#ffffff',
      color: currentPath === path ? '#0f766e' : '#0f172a',
      fontWeight: '700',
      cursor: 'pointer',
      textAlign: 'center',
      width: 'fit-content',
      boxSizing: 'border-box',
    },
    events: {
      click: () => {
        router.navigate(path);
      },
    },
  });

/**
 * Démarre l'application complète à partir du nœud racine fourni.
 *
 * @param appRoot Élément racine dans lequel monter l'application.
 */
export const startApp = (appRoot: HTMLDivElement): void => {
  configureApp();
  const appStore = AppStore.getInstance(new LocalStorageAdapter());
  const observerFeed = new Observable<string>('Application initialisee.');
  const router = new Router(['/', '/history', '/fillups/new', '/fillups/:id/edit']);
  const shell = createAppShell({
    appRoot,
  });

  const renderNavigation = (): void => {
    const currentPath = router.getCurrentPath();

    shell.navigationRow.replaceChildren(
      createNavButton('Dashboard', '/', currentPath, router),
      createNavButton('Historique', '/history', currentPath, router),
      createNavButton('Nouveau plein', '/fillups/new', currentPath, router),
    );
  };

  const renderDashboard = (): void => {
    renderNavigation();

    renderRouteView({
      store: appStore,
      router,
      observerFeed,
      routeViewHost: shell.routeViewHost,
    });
  };

  const initialize = async (): Promise<void> => {
    await appStore.loadFillUps();

    if (router.getCurrentMatch().pattern === '/404') {
      router.replace('/');
    }

    renderDashboard();

    // Les changements du brouillon ne doivent pas rerendre la vue courante
    // pendant la saisie, sinon le focus peut être perdu selon le navigateur.
    appStore.subscribeKey('fillUps', () => {
      renderDashboard();
    });

    router.subscribe((path) => {
      observerFeed.next(`Route active -> ${path}`);
      renderDashboard();
    });
  };

  void initialize();
};

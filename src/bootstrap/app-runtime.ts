import { createAppShell } from './app-shell.ts';
import { renderRouteView } from './render-route-view.ts';
import { bindText } from '../core/reactivity.ts';
import { Observable } from '../core/observer.ts';
import { AppConfig, AppStore, type FillUpPayload } from '../core/singleton.ts';
import { Router } from '../router/router.ts';
import { TagFactory } from '../core/factory.ts';

const createDemoFillUp = (index: number): FillUpPayload => ({
  id: `fill-up-${index}`,
  date: `2026-07-${String(index + 1).padStart(2, '0')}`,
  odometer: 12500 + index * 350,
  liters: 12 + index,
  pricePerLiter: 1.89,
  comment: `Plein ${index + 1}`,
});

const configureApp = (): AppConfig => {
  const appConfig = AppConfig.getInstance();
  appConfig.set('apiUrl', '/api/fuel-prices');
  appConfig.set('currency', 'EUR');
  appConfig.set('distanceUnit', 'km');
  appConfig.set('defaultStorageStrategy', 'volatile');
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
  const appConfig = configureApp();
  const appStore = AppStore.getInstance();
  const observerFeed = new Observable<string>('Application initialisee.');
  const router = new Router(['/', '/history', '/fillups/new', '/fillups/:id/edit']);
  const shell = createAppShell({
    appRoot,
    store: appStore,
    router,
    observerFeed,
  });

  const mountLifecyclePanel = (): void => {
    if (shell.lifecycleHost.childElementCount === 0) {
      shell.lifecyclePanel.mount(shell.lifecycleHost);
    }
  };

  const renderNavigation = (): void => {
    const currentPath = router.getCurrentPath();

    shell.navigationRow.replaceChildren(
      createNavButton('Dashboard', '/', currentPath, router),
      createNavButton('Historique', '/history', currentPath, router),
      createNavButton('Nouveau plein', '/fillups/new', currentPath, router),
    );
  };

  const renderDashboard = (): void => {
    const state = appStore.getSnapshot();
    const config = appConfig.snapshot();
    const currentTitle = state.formDraft.comment.trim() || 'Aucun';

    shell.nameInput.value = state.formDraft.comment;
    renderNavigation();

    shell.fillUpsCard.updateProps({
      value: `${state.fillUps.length}`,
      description: `Selection active : ${state.selectedFillUpId ?? 'aucune'}.`,
    });

    shell.configCard.updateProps({
      value: `${config.currency} / ${config.distanceUnit}`,
      description: `API ${config.apiUrl} - strategy ${config.defaultStorageStrategy}.`,
    });

    shell.formDraftCard.updateProps({
      value: currentTitle,
      description: 'Valeur synchronisee dans le store via setFormDraft().',
    });

    mountLifecyclePanel();
    shell.lifecyclePanel.updateProps({
      status: 'actif',
    });

    renderRouteView({
      store: appStore,
      router,
      observerFeed,
      routeViewHost: shell.routeViewHost,
      createDemoFillUp,
    });
  };

  shell.nameInput.addEventListener('input', () => {
    void appStore.setFormDraft({
      comment: shell.nameInput.value,
    });
  });

  shell.actionButton.addEventListener('click', () => {
    const nextIndex = appStore.getState('fillUps').length;
    void appStore.addFillUp(createDemoFillUp(nextIndex)).then((fillUp) => {
      void appStore.selectFillUp(fillUp.id);
      router.navigate('/history');
    });
  });

  shell.resetButton.addEventListener('click', () => {
    void appStore.resetState();
    router.navigate('/');
  });

  shell.lifecycleHost.addEventListener('component:mounted', (event) => {
    const detail = (event as CustomEvent<{ component: string; mounts: number }>).detail;
    shell.lifecycleEventNote.textContent = `${detail.component} monte (${detail.mounts}).`;
  });

  shell.lifecycleHost.addEventListener('component:updated', (event) => {
    const detail = (event as CustomEvent<{ component: string; updates: number }>).detail;
    shell.lifecycleEventNote.textContent = `${detail.component} mis a jour (${detail.updates}).`;
  });

  appStore.subscribe(() => {
    renderDashboard();
  });

  router.subscribe((path) => {
    observerFeed.next(`Route active -> ${path}`);
    renderDashboard();
  });

  bindText(
    {
      subscribe: (callback: (value: string) => void) => router.subscribe(callback),
    },
    shell.routeBadge,
    (path) => path,
  );

  appStore.subscribeKey('fillUps', (fillUps) => {
    observerFeed.next(`fillUps -> ${fillUps.length} entree(s).`);
  });
  appStore.subscribeKey('selectedFillUpId', (selectedFillUpId) => {
    observerFeed.next(`selectedFillUpId -> ${selectedFillUpId ?? 'aucune'}.`);
  });
  appStore.subscribeKey('formDraft', (formDraft) => {
    observerFeed.next(`formDraft.comment -> ${formDraft.comment.trim() || 'vide'}.`);
  });

  mountLifecyclePanel();
  void appStore.loadFillUps();

  if (router.getCurrentMatch().pattern === '/404') {
    router.replace('/');
  }

  renderDashboard();
};

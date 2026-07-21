import { createDashboardView } from '../views/dashboard.view.ts';
import { createEditFillUpView } from '../views/edit-fillup.view.ts';
import { createHistoryView } from '../views/history.view.ts';
import { createNewFillUpView } from '../views/new-fillup.view.ts';
import { Observable } from '../core/observer.ts';
import { AppStore, type FillUpPayload } from '../core/singleton.ts';
import { Router } from '../router/router.ts';

interface RenderRouteViewOptions {
  store: AppStore;
  router: Router;
  observerFeed: Observable<string>;
  routeViewHost: HTMLDivElement;
  createDemoFillUp: (index: number) => FillUpPayload;
}

/**
 * Rend la vue correspondant à la route courante dans le conteneur fourni.
 *
 * @param options Dépendances nécessaires au rendu conditionnel des vues.
 */
export const renderRouteView = ({
  store,
  router,
  observerFeed,
  routeViewHost,
  createDemoFillUp,
}: RenderRouteViewOptions): void => {
  const state = store.getSnapshot();
  const route = router.getCurrentMatch();
  const currentTitle = state.formDraft.comment.trim() || 'FuelLog Builder Card';

  if (route.pattern === '/404') {
    observerFeed.next(`Route inconnue ${route.path} -> redirection vers /.`);
    router.replace('/');
    return;
  }

  if (route.pattern === '/') {
    routeViewHost.replaceChildren(createDashboardView(route.path, currentTitle));
    return;
  }

  if (route.pattern === '/history') {
    routeViewHost.replaceChildren(
      createHistoryView(state.fillUps, {
        onEdit: (fillUpId) => {
          void store.selectFillUp(fillUpId);
          router.navigate(`/fillups/${fillUpId}/edit`);
        },
        onDelete: (fillUpId) => {
          void store.deleteFillUp(fillUpId);
        },
      }),
    );
    return;
  }

  if (route.pattern === '/fillups/new') {
    routeViewHost.replaceChildren(
      createNewFillUpView(currentTitle, () => {
        const nextIndex = store.getState('fillUps').length;
        void store.addFillUp(createDemoFillUp(nextIndex));
        router.navigate('/history');
      }),
    );
    return;
  }

  if (route.pattern === '/fillups/:id/edit') {
    const target = state.fillUps.find((fillUp) => fillUp.id === route.params.id);

    if (!target) {
      observerFeed.next(
        `Route edition invalide pour ${route.params.id} -> replaceState vers /history.`,
      );
      router.replace('/history');
      return;
    }

    routeViewHost.replaceChildren(
      createEditFillUpView(target, route.path, route.params.id, {
        onUpdate: () => {
          void store.updateFillUp(route.params.id, {
            comment: `${target.comment} (edite)`,
          });
        },
        onBack: () => {
          router.replace('/history');
        },
      }),
    );
  }
};

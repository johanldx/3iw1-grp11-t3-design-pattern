import { createDashboardView } from '../views/dashboard.view.ts';
import { createEditFillUpView } from '../views/edit-fillup.view.ts';
import { createHistoryView } from '../views/history.view.ts';
import { createNewFillUpView } from '../views/new-fillup.view.ts';
import { Observable } from '../core/observer.ts';
import { AppStore } from '../core/singleton.ts';
import { Router } from '../router/router.ts';

interface RenderRouteViewOptions {
  store: AppStore;
  router: Router;
  observerFeed: Observable<string>;
  routeViewHost: HTMLDivElement;
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
}: RenderRouteViewOptions): void => {
  const state = store.getSnapshot();
  const route = router.getCurrentMatch();
  if (route.pattern === '/404') {
    observerFeed.next(`Route inconnue ${route.path} -> redirection vers /.`);
    router.replace('/');
    return;
  }

  if (route.pattern === '/') {
    routeViewHost.replaceChildren(createDashboardView(state.fillUps));
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
    const maximumOdometer = state.fillUps.reduce(
      (maximum, fillUp) => Math.max(maximum, fillUp.odometer),
      0,
    );
    routeViewHost.replaceChildren(
      createNewFillUpView(state.formDraft, maximumOdometer, (draft) => {
        void store.setFormDraft(draft);
      }, async (payload) => {
        await store.addFillUp(payload);
        await store.dispatch('resetFormDraft', undefined);
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
      createEditFillUpView(target, {
        onDraftChange: (draft) => {
          void store.setFormDraft(draft);
        },
        onUpdate: async (payload) => {
          await store.updateFillUp(route.params.id, payload);
          await store.dispatch('resetFormDraft', undefined);
          router.navigate('/history');
        },
        onBack: () => {
          router.replace('/history');
        },
      }),
    );
  }
};

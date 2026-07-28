import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAppShell } from '../src/bootstrap/app-shell.ts';
import { startApp } from '../src/bootstrap/app-runtime.ts';
import { renderRouteView } from '../src/bootstrap/render-route-view.ts';
import { Observable } from '../src/core/observer.ts';
import { AppStore, type FillUp } from '../src/core/singleton.ts';
import { VolatileStorage } from '../src/core/strategy.ts';
import { Router } from '../src/router/router.ts';
import { createDashboardView } from '../src/views/dashboard.view.ts';
import { createEditFillUpView } from '../src/views/edit-fillup.view.ts';
import { createHistoryView } from '../src/views/history.view.ts';
import { createNewFillUpView } from '../src/views/new-fillup.view.ts';

const sampleFillUp: FillUp = {
  id: 'fill-1',
  date: '2026-07-27',
  odometer: 1200,
  liters: 14,
  pricePerLiter: 2,
  comment: 'Retour',
};

const olderFillUp: FillUp = {
  id: 'fill-0',
  date: '2026-07-20',
  odometer: 1000,
  liters: 10,
  pricePerLiter: 1.5,
  comment: 'Aller',
};

const createDraftSource = () => ({
  subscribe: () => () => undefined,
});

describe('vues applicatives et bootstrap', () => {
  beforeEach(async () => {
    document.body.innerHTML = '';
    localStorage.clear();
    window.history.replaceState(null, '', '/');
    const store = AppStore.getInstance(new VolatileStorage());
    await store.resetState();
  });

  it('affiche les métriques du dashboard avec les calculs attendus', () => {
    const view = createDashboardView([sampleFillUp, olderFillUp]);

    expect(view.textContent).toContain('Tableau de bord');
    expect(view.textContent).toContain('43.00 €');
    expect(view.textContent).toContain('7.00 L/100 km');
    expect(view.textContent).toContain('0.140 €/km');
  });

  it('déclenche les callbacks de la vue historique', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const view = createHistoryView([sampleFillUp], { onEdit, onDelete });
    const buttons = Array.from(view.querySelectorAll('button'));

    buttons[0]?.click();
    buttons[1]?.click();

    expect(onEdit).toHaveBeenCalledWith('fill-1');
    expect(onDelete).toHaveBeenCalledWith('fill-1');
  });

  it('rend les vues de création et d édition avec leurs champs attendus', () => {
    const newView = createNewFillUpView(
      { date: '', odometer: '', liters: '', pricePerLiter: '', comment: '' },
      0,
      createDraftSource(),
      vi.fn(),
      vi.fn(),
    );
    const editBack = vi.fn();
    const editView = createEditFillUpView(sampleFillUp, {
      draftSource: createDraftSource(),
      onDraftChange: vi.fn(),
      onUpdate: vi.fn(),
      onBack: editBack,
    });

    expect(newView.textContent).toContain('Nouveau plein');
    expect(newView.textContent).toContain('Prix des carburants autour de vous');

    const odometerInput = editView.querySelector('input[name="odometer"]') as HTMLInputElement;
    expect(odometerInput.value).toBe('1200');
    (editView.querySelector('button[type="button"]') as HTMLButtonElement).click();
    expect(editBack).toHaveBeenCalledOnce();
  });

  it('construit le shell sans panneau de résumé ni debug', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    const shell = createAppShell({ appRoot: root });

    expect(root.textContent).toContain('FuelLog');
    expect(root.textContent).not.toContain('Résumé');
    expect(root.contains(shell.navigationRow)).toBe(true);
    expect(root.contains(shell.routeViewHost)).toBe(true);
  });

  it('rend la bonne vue selon la route et redirige une édition invalide', async () => {
    const store = AppStore.getInstance(new VolatileStorage());
    await store.resetState();
    await store.addFillUp({
      id: olderFillUp.id,
      date: olderFillUp.date,
      odometer: olderFillUp.odometer,
      liters: olderFillUp.liters,
      pricePerLiter: olderFillUp.pricePerLiter,
      comment: olderFillUp.comment,
    });
    const router = new Router(['/', '/history', '/fillups/new', '/fillups/:id/edit']);
    const host = document.createElement('div');
    const observerFeed = new Observable<string>('');

    router.navigate('/history');
    renderRouteView({ store, router, observerFeed, routeViewHost: host });
    expect(host.textContent).toContain('Historique des pleins');

    router.navigate('/fillups/missing/edit');
    renderRouteView({ store, router, observerFeed, routeViewHost: host });
    expect(router.getCurrentPath()).toBe('/history');

    router.destroy();
  });

  it('démarre l application complète avec la navigation principale', async () => {
    const root = document.createElement('div');
    document.body.appendChild(root);

    startApp(root);
    await vi.waitFor(() => {
      expect(root.textContent).toContain('FuelLog');
      expect(root.textContent).toContain('Dashboard');
      expect(root.textContent).toContain('Historique');
      expect(root.textContent).toContain('Tableau de bord');
      expect(root.textContent).not.toContain('Résumé');
    });
  });
});

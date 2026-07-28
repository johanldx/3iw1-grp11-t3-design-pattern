import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppConfig, AppStore } from '../src/core/singleton.ts';
import { VolatileStorage } from '../src/core/strategy.ts';
import { Router } from '../src/router/router.ts';
import { createFillUpForm } from '../src/components/fill-up-form.component.ts';

describe('singletons et store', () => {
  it('expose une configuration singleton typée', () => {
    const first = AppConfig.getInstance();
    const second = AppConfig.getInstance();
    first.set('currency', 'EUR');
    expect(second).toBe(first);
    expect(second.get('currency')).toBe('EUR');
  });

  it('exécute le CRUD et notifie les abonnés', async () => {
    const store = AppStore.getInstance(new VolatileStorage());
    await store.resetState();
    const counts: number[] = [];
    const unsubscribe = store.subscribeKey('fillUps', (fillUps) => counts.push(fillUps.length));
    const created = await store.addFillUp({ date: '2026-07-28', odometer: 1000, liters: 10, pricePerLiter: 1.8, comment: 'Test' });
    await store.updateFillUp(created.id, { liters: 11 });
    expect(store.getState('fillUps')[0].liters).toBe(11);
    await store.deleteFillUp(created.id);
    expect(store.getState('fillUps')).toEqual([]);
    expect(counts).toContain(1);
    unsubscribe();
  });
});

describe('Router', () => {
  beforeEach(() => window.history.replaceState(null, '', '/'));

  it('navigue, extrait les paramètres et gère une route inconnue', () => {
    const router = new Router(['/', '/fillups/:id/edit']);
    const paths: string[] = [];
    router.subscribe((path) => paths.push(path));
    router.navigate('/fillups/abc/edit');
    expect(router.getCurrentMatch()).toMatchObject({ pattern: '/fillups/:id/edit', params: { id: 'abc' } });
    router.replace('/inconnue');
    expect(router.getCurrentMatch().pattern).toBe('/404');
    expect(paths).toContain('/fillups/abc/edit');
    router.destroy();
  });
});

describe('formulaire FuelLog', () => {
  it('affiche les erreurs puis soumet des données normalisées', () => {
    const submit = vi.fn();
    const form = createFillUpForm({
      initial: { date: '', odometer: '', liters: '', pricePerLiter: '', comment: '' },
      minimumOdometer: 100,
      submitLabel: 'Créer',
      onDraftChange: vi.fn(),
      onSubmit: submit,
    });
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(submit).not.toHaveBeenCalled();
    const set = (name: string, value: string): void => {
      const input = form.elements.namedItem(name) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };
    set('date', '2026-07-28');
    set('odometer', '120');
    set('liters', '12.5');
    set('pricePerLiter', '1.899');
    set('comment', ' Station ');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(submit).toHaveBeenCalledWith({
      date: '2026-07-28',
      odometer: 120,
      liters: 12.5,
      pricePerLiter: 1.899,
      comment: 'Station',
    });
  });
});

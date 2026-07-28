import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppConfig, AppStore } from '../src/core/singleton.ts';
import { Observable } from '../src/core/observer.ts';
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
    expect(second.snapshot().currency).toBe('EUR');
  });

  it('couvre les actions publiques du store et notifie les abonnés', async () => {
    const storage = new VolatileStorage();
    const store = AppStore.getInstance(storage);
    await store.resetState();
    const counts: number[] = [];
    const snapshots: number[] = [];
    const states: number[] = [];
    const fillUpsNotificationsBeforeDraftChange: number[] = [];
    const initialSnapshot = store.getSnapshot();

    expect(initialSnapshot.fillUps).toEqual([]);

    const unsubscribeState = store.subscribe((state) => snapshots.push(state.fillUps.length));
    const unsubscribe = store.subscribeKey('fillUps', (fillUps) => counts.push(fillUps.length));
    const unsubscribeDraftIsolation = store.subscribeKey('fillUps', (fillUps) => {
      fillUpsNotificationsBeforeDraftChange.push(fillUps.length);
    });
    await store.setState('loading', true);
    states.push(store.getState('loading') ? 1 : 0);
    await store.patchState({
      error: 'oops',
      formDraft: {
        comment: 'Draft',
      },
    });
    expect(fillUpsNotificationsBeforeDraftChange).toEqual([0]);
    await store.dispatch('setError', null);
    await store.selectFillUp('temporary-selection');
    await store.setFormDraft({
      date: '2026-07-28',
      odometer: '1000',
      liters: '10',
      pricePerLiter: '1.8',
      comment: 'Prefilled',
    });

    const created = await store.addFillUp({ date: '2026-07-28', odometer: 1000, liters: 10, pricePerLiter: 1.8, comment: 'Test' });
    await store.updateFillUp(created.id, { liters: 11 });
    expect(store.getState('fillUps')[0].liters).toBe(11);
    expect(store.getState('selectedFillUpId')).toBe('temporary-selection');

    await storage.set('fuel-log:app-state', {
      fillUps: [created],
      selectedFillUpId: created.id,
      formDraft: {
        date: created.date,
        odometer: String(created.odometer),
        liters: String(created.liters),
        pricePerLiter: String(created.pricePerLiter),
        comment: created.comment,
      },
      loading: false,
      error: null,
    });
    await store.setStorageStrategy(storage);
    await store.hydrate();
    await expect(store.loadFillUps()).resolves.toHaveLength(1);

    await store.deleteFillUp(created.id);
    expect(store.getState('fillUps')).toEqual([]);
    expect(counts).toContain(1);
    expect(snapshots).toContain(1);
    expect(states).toContain(1);
    unsubscribe();
    unsubscribeState();
    unsubscribeDraftIsolation();
  });
});

describe('Router', () => {
  beforeEach(() => window.history.replaceState(null, '', '/'));

  it('navigue, extrait les paramètres et gère une route inconnue', () => {
    const router = new Router(['/', '/fillups/:id/edit']);
    const paths: string[] = [];
    router.subscribe((path) => paths.push(path));
    expect(router.getCurrentPath()).toBe('/');
    router.navigate('/fillups/abc/edit');
    expect(router.getCurrentMatch()).toMatchObject({ pattern: '/fillups/:id/edit', params: { id: 'abc' } });
    expect(router.getCurrentPath()).toBe('/fillups/abc/edit');
    router.replace('/inconnue');
    expect(router.getCurrentMatch().pattern).toBe('/404');
    expect(paths).toContain('/fillups/abc/edit');
    router.destroy();
  });

  it('réagit au bouton précédent via popstate', () => {
    const router = new Router(['/', '/history']);
    const paths: string[] = [];

    router.subscribe((path) => paths.push(path));
    window.history.pushState(null, '', '/history');
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(router.getCurrentPath()).toBe('/history');
    expect(paths.at(-1)).toBe('/history');

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
    document.body.appendChild(form);
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
    expect((form.elements.namedItem('comment') as HTMLInputElement).value).toBe(' Station ');
  });

  it('ne valide pas les autres champs tant que le formulaire n est pas soumis', () => {
    const form = createFillUpForm({
      initial: { date: '', odometer: '', liters: '', pricePerLiter: '', comment: '' },
      minimumOdometer: 100,
      submitLabel: 'Créer',
      onDraftChange: vi.fn(),
      onSubmit: vi.fn(),
    });
    document.body.appendChild(form);

    const odometerInput = form.elements.namedItem('odometer') as HTMLInputElement;
    odometerInput.value = '120';
    odometerInput.dispatchEvent(new Event('input', { bubbles: true }));

    const errorMessages = Array.from(form.querySelectorAll('span')).map((node) => node.textContent);

    expect(errorMessages).not.toContain('Ce champ est obligatoire.');
  });

  it('diffère une synchro externe sur le champ actif pour préserver la saisie', async () => {
    const draft$ = new Observable({
      date: '',
      odometer: '',
      liters: '',
      pricePerLiter: '',
      comment: '',
    });
    let latestDraft = {
      date: '',
      odometer: '',
      liters: '',
      pricePerLiter: '',
      comment: '',
    };
    const form = createFillUpForm({
      initial: latestDraft,
      minimumOdometer: 0,
      submitLabel: 'Créer',
      draftSource: {
        subscribe: (callback) => draft$.subscribe(callback),
      },
      onDraftChange: (draft) => {
        latestDraft = { ...draft };
      },
      onSubmit: vi.fn(),
    });
    document.body.appendChild(form);

    const litersInput = form.elements.namedItem('liters') as HTMLInputElement;
    litersInput.focus();
    litersInput.value = '1';
    litersInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(document.activeElement).toBe(litersInput);
    expect(litersInput.value).toBe('1');

    draft$.next({
      ...latestDraft,
      liters: '12.5',
      comment: 'Station test',
    });

    expect(document.activeElement).toBe(litersInput);
    expect(litersInput.value).toBe('1');

    litersInput.dispatchEvent(new Event('blur', { bubbles: true }));

    expect(litersInput.value).toBe('12.5');
  });
});

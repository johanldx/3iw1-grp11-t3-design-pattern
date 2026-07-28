import { Observable, type Unsubscribe } from './observer.ts';
import {
  type StorageStrategy,
  type StorageStrategyName,
} from './strategy.ts';

/**
 * Représente un plein de carburant enregistré dans l'application.
 */
export interface FillUp {
  id: string;
  date: string;
  odometer: number;
  liters: number;
  pricePerLiter: number;
  comment: string;
}

/**
 * Décrit les données nécessaires à la création d'un plein.
 */
export type FillUpPayload = Omit<FillUp, 'id'> & {
  id?: string;
};

/**
 * Décrit les champs pouvant être modifiés sur un plein existant.
 */
export type FillUpUpdatePayload = Partial<Omit<FillUp, 'id'>>;

/**
 * Représente l'état courant du formulaire de saisie.
 */
export interface FillUpFormState {
  date: string;
  odometer: string;
  liters: string;
  pricePerLiter: string;
  comment: string;
}

/**
 * Représente l'état global de l'application.
 */
export interface AppState {
  fillUps: FillUp[];
  selectedFillUpId: string | null;
  formDraft: FillUpFormState;
  loading: boolean;
  error: string | null;
}

/**
 * Décrit les valeurs de configuration partagées dans l'application.
 */
export interface AppConfigValues {
  apiUrl: string;
  currency: string;
  distanceUnit: string;
  defaultStorageStrategy: StorageStrategyName;
}

export type AppConfigKey = keyof AppConfigValues;

type StateSubscriber = (state: Readonly<AppState>) => void;
type StateKeySubscriber<K extends keyof AppState> = (value: AppState[K]) => void;

type ActionPayloadMap = {
  replaceFillUps: FillUp[];
  selectFillUp: string | null;
  setFormDraft: Partial<FillUpFormState>;
  resetFormDraft: undefined;
  setLoading: boolean;
  setError: string | null;
  hydrate: Partial<AppState>;
  resetState: undefined;
};

export type AppAction = keyof ActionPayloadMap;

const APP_STATE_STORAGE_KEY = 'fuel-log:app-state';

const createFillUpId = (): string =>
  `fill-up-${Math.random().toString(36).slice(2, 10)}`;

const createInitialFormDraft = (): FillUpFormState => ({
  date: '',
  odometer: '',
  liters: '',
  pricePerLiter: '',
  comment: '',
});

const createInitialState = (): AppState => ({
  fillUps: [],
  selectedFillUpId: null,
  formDraft: createInitialFormDraft(),
  loading: false,
  error: null,
});

const createDefaultConfig = (): AppConfigValues => ({
  apiUrl: '/api',
  currency: 'EUR',
  distanceUnit: 'km',
  defaultStorageStrategy: 'volatile',
});

/**
 * Fournit une stratégie de stockage neutre utilisée tant qu'aucun backend réel n'est injecté.
 */
class NoopStorageStrategy implements StorageStrategy {
  async get<T>(_key: string): Promise<T | null> {
    return null;
  }

  async set<T>(_key: string, _value: T): Promise<void> {}

  async remove(_key: string): Promise<void> {}

  async clear(): Promise<void> {}
}

/**
 * Centralise la configuration globale de l'application via une instance unique.
 */
export class AppConfig {
  private static instance: AppConfig | undefined;
  private readonly config: AppConfigValues;

  private constructor() {
    this.config = createDefaultConfig();
  }

  /**
   * Retourne l'instance unique de configuration.
   *
   * @returns Instance globale de configuration.
   */
  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }

    return AppConfig.instance;
  }

  /**
   * Écrit une valeur de configuration.
   *
   * @param key Clé de configuration à modifier.
   * @param value Valeur à associer à cette clé.
   */
  set<K extends AppConfigKey>(key: K, value: AppConfigValues[K]): void {
    this.config[key] = value;
  }

  /**
   * Lit une valeur de configuration.
   *
   * @param key Clé de configuration recherchée.
   * @returns Valeur associée à la clé.
   */
  get<K extends AppConfigKey>(key: K): AppConfigValues[K] {
    return this.config[key];
  }

  /**
   * Retourne une copie immuable de la configuration courante.
   *
   * @returns Instantané de la configuration.
   */
  snapshot(): Readonly<AppConfigValues> {
    return { ...this.config };
  }
}

/**
 * Centralise l'état global de l'application via un store singleton.
 */
export class AppStore {
  private static instance: AppStore | undefined;
  private readonly state$ = new Observable<Readonly<AppState>>();
  private readonly keyObservables: {
    [K in keyof AppState]: Observable<AppState[K]>;
  };
  private readonly actions: {
    [K in AppAction]: (payload: ActionPayloadMap[K]) => AppState;
  };
  private state: AppState;
  private strategy: StorageStrategy;

  private constructor(strategy?: StorageStrategy) {
    this.state = createInitialState();
    this.strategy = strategy ?? new NoopStorageStrategy();
    this.keyObservables = {
      fillUps: new Observable(this.state.fillUps),
      selectedFillUpId: new Observable(this.state.selectedFillUpId),
      formDraft: new Observable(this.state.formDraft),
      loading: new Observable(this.state.loading),
      error: new Observable(this.state.error),
    };
    this.actions = {
      replaceFillUps: (fillUps) => ({ ...this.state, fillUps }),
      selectFillUp: (selectedFillUpId) => ({ ...this.state, selectedFillUpId }),
      setFormDraft: (formDraftPatch) => ({
        ...this.state,
        formDraft: {
          ...this.state.formDraft,
          ...formDraftPatch,
        },
      }),
      resetFormDraft: () => ({
        ...this.state,
        formDraft: createInitialFormDraft(),
      }),
      setLoading: (loading) => ({ ...this.state, loading }),
      setError: (error) => ({ ...this.state, error }),
      hydrate: (incomingState) => ({
        ...this.state,
        ...incomingState,
        formDraft: {
          ...this.state.formDraft,
          ...incomingState.formDraft,
        },
      }),
      resetState: () => createInitialState(),
    };

    this.emitState();
  }

  /**
   * Retourne l'instance unique du store.
   *
   * @param strategy Stratégie de stockage à injecter si nécessaire.
   * @returns Instance globale du store.
   */
  static getInstance(strategy?: StorageStrategy): AppStore {
    if (!AppStore.instance) {
      AppStore.instance = new AppStore(strategy);
    } else if (strategy) {
      void AppStore.instance.setStorageStrategy(strategy);
    }

    return AppStore.instance;
  }

  /**
   * Lit la valeur courante d'une clé du store.
   *
   * @param key Clé d'état recherchée.
   * @returns Valeur courante associée à la clé.
   */
  getState<K extends keyof AppState>(key: K): AppState[K] {
    return this.state[key];
  }

  /**
   * Retourne une copie de l'état global courant.
   *
   * @returns Instantané de l'état applicatif.
   */
  getSnapshot(): Readonly<AppState> {
    return {
      ...this.state,
      fillUps: [...this.state.fillUps],
      formDraft: { ...this.state.formDraft },
    };
  }

  /**
   * Abonne un callback aux changements de l'état global complet.
   *
   * @param callback Fonction appelée à chaque modification d'état.
   * @returns Fonction permettant de se désabonner.
   */
  subscribe(callback: StateSubscriber): Unsubscribe {
    return this.state$.subscribe(callback);
  }

  /**
   * Abonne un callback à une clé précise du store.
   *
   * @param key Clé d'état observée.
   * @param callback Fonction appelée lors des mises à jour de cette clé.
   * @returns Fonction permettant de se désabonner.
   */
  subscribeKey<K extends keyof AppState>(
    key: K,
    callback: StateKeySubscriber<K>,
  ): Unsubscribe {
    return this.keyObservables[key].subscribe((value) => {
      callback(value);
    });
  }

  /**
   * Remplace directement la valeur d'une clé dans le store.
   *
   * @param key Clé à modifier.
   * @param value Nouvelle valeur à enregistrer.
   * @returns Promesse résolue une fois l'état persisté.
   */
  async setState<K extends keyof AppState>(key: K, value: AppState[K]): Promise<void> {
    this.state = {
      ...this.state,
      [key]: value,
    };
    this.emitState();
    await this.persistState();
  }

  /**
   * Applique un patch partiel sur l'état global.
   *
   * @param patch Ensemble de valeurs à fusionner avec l'état courant.
   * @returns Promesse résolue une fois l'état persisté.
   */
  async patchState(patch: Partial<AppState>): Promise<void> {
    this.state = {
      ...this.state,
      ...patch,
      formDraft: patch.formDraft
        ? {
            ...this.state.formDraft,
            ...patch.formDraft,
          }
        : this.state.formDraft,
    };
    this.emitState();
    await this.persistState();
  }

  /**
   * Exécute une action interne du store.
   *
   * @param action Nom de l'action à déclencher.
   * @param payload Charge utile de l'action.
   * @returns Promesse résolue une fois l'état persisté.
   */
  async dispatch<K extends AppAction>(
    action: K,
    payload: ActionPayloadMap[K],
  ): Promise<void> {
    const nextState = this.actions[action](payload);
    this.state = nextState;
    this.emitState();
    await this.persistState();
  }

  /**
   * Réhydrate l'état global depuis la stratégie de stockage active.
   *
   * @returns Promesse résolue une fois l'hydratation terminée.
   */
  async hydrate(): Promise<void> {
    const persistedState = await this.strategy.get<Partial<AppState>>(APP_STATE_STORAGE_KEY);

    if (!persistedState) {
      return;
    }

    await this.dispatch('hydrate', persistedState);
  }

  /**
   * Charge les pleins actuellement connus du store.
   *
   * @returns Liste des pleins après hydratation éventuelle.
   */
  async loadFillUps(): Promise<FillUp[]> {
    await this.hydrate();
    return [...this.state.fillUps];
  }

  /**
   * Ajoute un nouveau plein au store.
   *
   * @param payload Données du plein à créer.
   * @returns Plein créé avec son identifiant final.
   */
  async addFillUp(payload: FillUpPayload): Promise<FillUp> {
    const fillUp: FillUp = {
      id: payload.id ?? createFillUpId(),
      date: payload.date,
      odometer: payload.odometer,
      liters: payload.liters,
      pricePerLiter: payload.pricePerLiter,
      comment: payload.comment,
    };

    await this.dispatch('replaceFillUps', [...this.state.fillUps, fillUp]);
    return fillUp;
  }

  /**
   * Met à jour un plein existant.
   *
   * @param id Identifiant du plein à modifier.
   * @param payload Champs à mettre à jour.
   * @returns Plein mis à jour ou `null` si l'identifiant est inconnu.
   */
  async updateFillUp(id: string, payload: FillUpUpdatePayload): Promise<FillUp | null> {
    let updatedFillUp: FillUp | null = null;

    const nextFillUps = this.state.fillUps.map((fillUp) => {
      if (fillUp.id !== id) {
        return fillUp;
      }

      updatedFillUp = {
        ...fillUp,
        ...payload,
      };

      return updatedFillUp;
    });

    if (!updatedFillUp) {
      return null;
    }

    await this.dispatch('replaceFillUps', nextFillUps);
    return updatedFillUp;
  }

  /**
   * Supprime un plein du store.
   *
   * @param id Identifiant du plein à supprimer.
   * @returns Promesse résolue une fois la suppression terminée.
   */
  async deleteFillUp(id: string): Promise<void> {
    const nextFillUps = this.state.fillUps.filter((fillUp) => fillUp.id !== id);
    const selectedFillUpId =
      this.state.selectedFillUpId === id ? null : this.state.selectedFillUpId;

    await this.patchState({
      fillUps: nextFillUps,
      selectedFillUpId,
    });
  }

  /**
   * Définit le plein actuellement sélectionné.
   *
   * @param id Identifiant sélectionné ou `null`.
   * @returns Promesse résolue une fois l'état persisté.
   */
  async selectFillUp(id: string | null): Promise<void> {
    await this.dispatch('selectFillUp', id);
  }

  /**
   * Met à jour le brouillon global du formulaire.
   *
   * @param payload Patch à appliquer au brouillon courant.
   * @returns Promesse résolue une fois l'état persisté.
   */
  async setFormDraft(payload: Partial<FillUpFormState>): Promise<void> {
    await this.dispatch('setFormDraft', payload);
  }

  /**
   * Remplace la stratégie de stockage utilisée par le store.
   *
   * @param strategy Nouvelle stratégie de stockage.
   * @returns Promesse résolue une fois l'état repersisté.
   */
  async setStorageStrategy(strategy: StorageStrategy): Promise<void> {
    this.strategy = strategy;
    await this.persistState();
  }

  /**
   * Réinitialise l'état global du store.
   *
   * @returns Promesse résolue une fois l'état réinitialisé.
   */
  async resetState(): Promise<void> {
    await this.dispatch('resetState', undefined);
  }

  private emitState(): void {
    const snapshot = this.getSnapshot();
    this.state$.next(snapshot);
    this.keyObservables.fillUps.next(snapshot.fillUps);
    this.keyObservables.selectedFillUpId.next(snapshot.selectedFillUpId);
    this.keyObservables.formDraft.next(snapshot.formDraft);
    this.keyObservables.loading.next(snapshot.loading);
    this.keyObservables.error.next(snapshot.error);
  }

  private async persistState(): Promise<void> {
    await this.strategy.set(APP_STATE_STORAGE_KEY, this.getSnapshot());
  }
}

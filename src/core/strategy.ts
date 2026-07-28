/** Noms des stratégies de stockage supportées par l'application. */
export type StorageStrategyName = 'volatile' | 'localStorage' | 'indexedDb';

/**
 * Définit le contrat commun des stratégies de stockage.
 */
export interface StorageStrategy {
  /**
   * Lit une valeur depuis une clé de stockage.
   *
   * @param key Clé à lire.
   * @returns Valeur lue ou `null` si elle n'existe pas.
   */
  get<T>(key: string): Promise<T | null>;
  /**
   * Écrit une valeur pour une clé donnée.
   *
   * @param key Clé de destination.
   * @param value Valeur à enregistrer.
   * @returns Promesse résolue une fois l'écriture terminée.
   */
  set<T>(key: string, value: T): Promise<void>;
  /**
   * Supprime une clé du stockage.
   *
   * @param key Clé à supprimer.
   * @returns Promesse résolue une fois la suppression terminée.
   */
  remove(key: string): Promise<void>;
  /**
   * Vide intégralement le stockage.
   *
   * @returns Promesse résolue une fois le stockage vidé.
   */
  clear(): Promise<void>;
}

/** Stockage en mémoire, pratique pour les tests et les sessions temporaires. */
export class VolatileStorage implements StorageStrategy {
  private readonly values = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | null> {
    return (this.values.get(key) as T | undefined) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.values.set(key, structuredClone(value));
  }

  async remove(key: string): Promise<void> {
    this.values.delete(key);
  }

  async clear(): Promise<void> {
    this.values.clear();
  }
}

/** Adaptateur asynchrone autour de l'API localStorage. */
export class LocalStorageAdapter implements StorageStrategy {
  private readonly storage: Storage;

  /**
   * Initialise l'adaptateur `localStorage`.
   *
   * @param storage Implémentation de stockage Web injectable.
   */
  constructor(storage: Storage = window.localStorage) {
    this.storage = storage;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = this.storage.getItem(key);
    return value === null ? null : JSON.parse(value) as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.storage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    this.storage.removeItem(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}

/** Stockage persistant IndexedDB conforme au même contrat que localStorage. */
export class IndexedDBStorage implements StorageStrategy {
  private readonly database: Promise<IDBDatabase>;
  private readonly storeName: string;

  /**
   * Initialise le stockage IndexedDB avec sa base et son object store.
   *
   * @param databaseName Nom de la base IndexedDB à ouvrir.
   * @param storeName Nom de l'object store utilisé pour les couples clé/valeur.
   */
  constructor(
    databaseName = 'fuel-log',
    storeName = 'key-value',
  ) {
    this.storeName = storeName;
    this.database = new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(this.storeName)) {
          request.result.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB unavailable.'));
    });
  }

  async get<T>(key: string): Promise<T | null> {
    return this.request<T | undefined>('readonly', (store) => store.get(key))
      .then((value) => value ?? null);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.request('readwrite', (store) => store.put(value, key));
  }

  async remove(key: string): Promise<void> {
    await this.request('readwrite', (store) => store.delete(key));
  }

  async clear(): Promise<void> {
    await this.request('readwrite', (store) => store.clear());
  }

  private async request<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const database = await this.database;
    return new Promise((resolve, reject) => {
      const request = operation(database.transaction(this.storeName, mode).objectStore(this.storeName));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB operation failed.'));
    });
  }
}

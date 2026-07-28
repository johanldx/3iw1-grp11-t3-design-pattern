import { beforeEach, describe, expect, it } from 'vitest';
import { IndexedDBStorage, LocalStorageAdapter, VolatileStorage } from '../src/core/strategy.ts';

describe.each([
  ['volatile', () => new VolatileStorage()],
  ['localStorage', () => new LocalStorageAdapter()],
])('%s storage', (_name, createStorage) => {
  beforeEach(() => localStorage.clear());

  it('écrit, lit, supprime et vide les valeurs', async () => {
    const storage = createStorage();
    await storage.set('one', { value: 1 });
    await storage.set('two', 'ok');
    await expect(storage.get('one')).resolves.toEqual({ value: 1 });
    await storage.remove('one');
    await expect(storage.get('one')).resolves.toBeNull();
    await storage.clear();
    await expect(storage.get('two')).resolves.toBeNull();
  });
});

describe('indexedDb storage', () => {
  it('écrit, lit, supprime et vide les valeurs', async () => {
    const data = new Map<string, unknown>();
    const storeNames = new Set<string>();

    const createRequest = <T>(executor: () => T): IDBRequest<T> => {
      const request = {
        onsuccess: null,
        onerror: null,
        result: undefined,
        error: null,
      } as unknown as IDBRequest<T>;

      queueMicrotask(() => {
        try {
          (request as { result: T }).result = executor();
          request.onsuccess?.(new Event('success') as unknown as IDBRequestEventMap['success']);
        } catch (error) {
          (request as { error: DOMException | null }).error = error as DOMException;
          request.onerror?.(new Event('error') as unknown as IDBRequestEventMap['error']);
        }
      });

      return request;
    };

    const database = {
      objectStoreNames: {
        contains: (name: string) => storeNames.has(name),
      },
      createObjectStore: (name: string) => {
        storeNames.add(name);
        return {} as IDBObjectStore;
      },
      transaction: () => ({
        objectStore: () => ({
          get: (key: string) => createRequest(() => data.get(key) as unknown),
          put: (value: unknown, key: string) => createRequest(() => {
            data.set(key, value);
          }),
          delete: (key: string) => createRequest(() => {
            data.delete(key);
          }),
          clear: () => createRequest(() => {
            data.clear();
          }),
        }),
      }),
    } as unknown as IDBDatabase;

    const openRequest = {
      result: database,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    } as unknown as IDBOpenDBRequest;

    const previousIndexedDb = globalThis.indexedDB;
    Object.defineProperty(globalThis, 'indexedDB', {
      configurable: true,
      value: {
        open: () => {
          queueMicrotask(() => {
            openRequest.onupgradeneeded?.(
              new Event('upgradeneeded') as unknown as IDBVersionChangeEvent,
            );
            openRequest.onsuccess?.(
              new Event('success') as unknown as IDBRequestEventMap['success'],
            );
          });

          return openRequest;
        },
      } satisfies Pick<IDBFactory, 'open'>,
    });

    try {
      const storage = new IndexedDBStorage('fuel-log-tests', 'fill-ups');
      await storage.set('one', { value: 1 });
      await storage.set('two', 'ok');
      await expect(storage.get('one')).resolves.toEqual({ value: 1 });
      await storage.remove('one');
      await expect(storage.get('one')).resolves.toBeNull();
      await storage.clear();
      await expect(storage.get('two')).resolves.toBeNull();
    } finally {
      Object.defineProperty(globalThis, 'indexedDB', {
        configurable: true,
        value: previousIndexedDb,
      });
    }
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { LocalStorageAdapter, VolatileStorage } from '../src/core/strategy.ts';

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

import { describe, expect, it, vi } from 'vitest';
import { HttpClient } from '../src/http/http-client.ts';

describe('HttpClient', () => {
  it('sérialise le JSON et retourne la réponse', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    const client = new HttpClient('/api', 1000, fetcher);
    await expect(client.post('/fillups', { liters: 10 })).resolves.toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith('/api/fillups', expect.objectContaining({
      method: 'POST',
      body: '{"liters":10}',
    }));
  });

  it('transforme une erreur HTTP en exception', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 500, statusText: 'Failure' }));
    await expect(new HttpClient('', 1000, fetcher).get('/error')).rejects.toThrow('HTTP 500');
  });
});

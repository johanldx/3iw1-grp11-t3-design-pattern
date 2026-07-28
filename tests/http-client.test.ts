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

  it('applique les interceptors et supporte PUT puis DELETE', async () => {
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ updated: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const client = new HttpClient('/api', 1000, fetcher);
    client.use(async (request) => ({
      ...request,
      headers: {
        ...(request.headers ?? {}),
        Authorization: 'Bearer token',
      },
    }));

    await expect(client.put('/fillups/1', { liters: 11 })).resolves.toEqual({ updated: true });
    await expect(client.delete<void>('/fillups/1')).resolves.toBeUndefined();
    expect(fetcher).toHaveBeenNthCalledWith(1, '/api/fillups/1', expect.objectContaining({
      method: 'PUT',
      headers: expect.objectContaining({
        Authorization: 'Bearer token',
      }),
    }));
    expect(fetcher).toHaveBeenNthCalledWith(2, '/api/fillups/1', expect.objectContaining({
      method: 'DELETE',
    }));
  });

  it('transforme une erreur HTTP en exception', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 500, statusText: 'Failure' }));
    await expect(new HttpClient('', 1000, fetcher).get('/error')).rejects.toThrow('HTTP 500');
  });

  it('attache correctement fetch au contexte global et gère le timeout', async () => {
    vi.useFakeTimers();

    try {
      const contextualFetch = vi.fn(function (
        this: typeof globalThis,
        _input: RequestInfo | URL,
        init?: RequestInit,
      ): Promise<Response> {
        expect(this).toBe(globalThis);

        return new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      }) as typeof fetch;
      const request = new HttpClient('/api', 50, contextualFetch).get('/slow');
      const expectation = expect(request).rejects.toThrow('La requête a dépassé 50 ms.');

      await vi.advanceTimersByTimeAsync(50);

      await expectation;
      expect(contextualFetch).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });
});

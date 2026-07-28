import { describe, expect, it, vi } from 'vitest';
import { FuelPriceService } from '../src/http/fuel-price.service.ts';
import { HttpClient } from '../src/http/http-client.ts';

describe('FuelPriceService', () => {
  it('utilise les champs actuels du dataset pour le carburant demandé', async () => {
    const get = vi.fn<InstanceType<typeof HttpClient>['get']>().mockResolvedValue({
      results: [
        {
          id: 75001003,
          adresse: '8 Rue Bailleul',
          ville: 'Paris',
          cp: '75001',
          sp95_prix: 2.39,
          sp95_maj: '2026-06-12T16:35:12+00:00',
        },
      ],
    });
    const client = { get } as unknown as HttpClient;
    const service = new FuelPriceService(client);

    await expect(service.search('75001', 'SP95')).resolves.toEqual([
      {
        stationId: '75001003',
        address: '8 Rue Bailleul',
        city: 'Paris',
        postalCode: '75001',
        fuel: 'SP95',
        price: 2.39,
        updatedAt: '2026-06-12T16:35:12+00:00',
      },
    ]);
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('select=id%2Cadresse%2Cville%2Ccp%2Csp95_prix%2Csp95_maj'),
    );
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('where=cp%3D%2275001%22+AND+sp95_prix+is+not+null'),
    );
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('order_by=sp95_prix+asc'),
    );
  });

  it('refuse un carburant non supporté', async () => {
    const service = new FuelPriceService({ get: vi.fn() } as unknown as HttpClient);

    await expect(service.search('92160', 'Diesel+')).rejects.toThrow(
      'Carburant non supporté : Diesel+.',
    );
  });
});

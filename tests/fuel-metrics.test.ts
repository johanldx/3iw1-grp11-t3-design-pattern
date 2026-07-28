import { describe, expect, it } from 'vitest';
import { calculateFuelMetrics } from '../src/core/fuel-metrics.ts';
import type { FillUp } from '../src/core/singleton.ts';

describe('fuel metrics', () => {
  it('exclut le premier plein de la consommation et du coût kilométrique mesurés', () => {
    const fillUps: FillUp[] = [
      {
        id: 'a',
        date: '2026-07-01',
        odometer: 1000,
        liters: 40,
        pricePerLiter: 2,
        comment: '',
      },
      {
        id: 'b',
        date: '2026-07-10',
        odometer: 1500,
        liters: 25,
        pricePerLiter: 2,
        comment: '',
      },
      {
        id: 'c',
        date: '2026-07-20',
        odometer: 1800,
        liters: 18,
        pricePerLiter: 2.5,
        comment: '',
      },
    ];

    const metrics = calculateFuelMetrics(fillUps);

    expect(metrics.totalLiters).toBe(83);
    expect(metrics.totalCost).toBe(175);
    expect(metrics.measuredDistance).toBe(800);
    expect(metrics.measuredLiters).toBe(43);
    expect(metrics.measuredCost).toBe(95);
    expect(metrics.averageConsumption).toBeCloseTo(5.375, 6);
    expect(metrics.costPerKm).toBeCloseTo(0.11875, 6);
  });

  it('ignore les segments incohérents avec compteur décroissant ou identique', () => {
    const fillUps: FillUp[] = [
      {
        id: 'a',
        date: '2026-07-01',
        odometer: 1000,
        liters: 40,
        pricePerLiter: 2,
        comment: '',
      },
      {
        id: 'b',
        date: '2026-07-02',
        odometer: 1000,
        liters: 20,
        pricePerLiter: 2,
        comment: '',
      },
      {
        id: 'c',
        date: '2026-07-03',
        odometer: 900,
        liters: 20,
        pricePerLiter: 2,
        comment: '',
      },
    ];

    const metrics = calculateFuelMetrics(fillUps);

    expect(metrics.measuredDistance).toBe(0);
    expect(metrics.averageConsumption).toBe(0);
    expect(metrics.costPerKm).toBe(0);
  });
});

import type { FillUp } from './singleton.ts';

/**
 * Regroupe les indicateurs métier calculés à partir d'une liste de pleins.
 */
export interface FuelMetrics {
  orderedFillUps: FillUp[];
  totalCost: number;
  totalLiters: number;
  measuredDistance: number;
  measuredLiters: number;
  measuredCost: number;
  averageConsumption: number;
  costPerKm: number;
}

/**
 * Calcule les métriques métier FuelLog à partir des pleins enregistrés.
 *
 * Les litres et les coûts "mesurés" excluent le tout premier plein, car il
 * n'est pas rattachable à une distance observée dans la période.
 *
 * @param fillUps Pleins à analyser.
 * @returns Ensemble des indicateurs dérivés.
 */
export const calculateFuelMetrics = (fillUps: FillUp[]): FuelMetrics => {
  const orderedFillUps = [...fillUps].sort((left, right) => {
    const leftTimestamp = Date.parse(left.date);
    const rightTimestamp = Date.parse(right.date);

    if (Number.isFinite(leftTimestamp) && Number.isFinite(rightTimestamp)) {
      return leftTimestamp - rightTimestamp || left.odometer - right.odometer;
    }

    return left.odometer - right.odometer;
  });
  const totalCost = orderedFillUps.reduce(
    (total, fillUp) => total + fillUp.liters * fillUp.pricePerLiter,
    0,
  );
  const totalLiters = orderedFillUps.reduce((total, fillUp) => total + fillUp.liters, 0);

  let measuredDistance = 0;
  let measuredLiters = 0;
  let measuredCost = 0;

  for (let index = 1; index < orderedFillUps.length; index += 1) {
    const previous = orderedFillUps[index - 1];
    const current = orderedFillUps[index];
    const distance = current.odometer - previous.odometer;

    if (distance <= 0) {
      continue;
    }

    measuredDistance += distance;
    measuredLiters += current.liters;
    measuredCost += current.liters * current.pricePerLiter;
  }

  const averageConsumption =
    measuredDistance > 0 ? (measuredLiters / measuredDistance) * 100 : 0;
  const costPerKm = measuredDistance > 0 ? measuredCost / measuredDistance : 0;

  return {
    orderedFillUps,
    totalCost,
    totalLiters,
    measuredDistance,
    measuredLiters,
    measuredCost,
    averageConsumption,
    costPerKm,
  };
};

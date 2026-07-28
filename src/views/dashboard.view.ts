import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import { calculateFuelMetrics } from '../core/fuel-metrics.ts';
import type { FillUp } from '../core/singleton.ts';
import { CardComponent } from '../components/card.component.ts';

const card = (title: string, value: string, detail: string): HTMLElement =>
  new CardComponent({
    slots: {
      header: TagFactory.toHtml('span', { text: title, styles: { color: '#64748b', fontWeight: '700' } }),
      body: [
        TagFactory.toHtml('heading', { level: 3, text: value, styles: { margin: '.45rem 0', color: '#0f766e', fontSize: '1.5rem' } }),
        TagFactory.toHtml('p', { text: detail, styles: { margin: '0', color: '#475569' } }),
      ],
    },
  }).mount(document.createElement('div'));

/** Calcule et affiche les indicateurs métier à partir des pleins. */
export const createDashboardView = (fillUps: FillUp[]): HTMLElement => {
  const metrics = calculateFuelMetrics(fillUps);
  const grid = new TagBuilder('div')
    .withStyle('display', 'grid').withStyle('gap', '1rem')
    .withStyle('grid-template-columns', 'repeat(auto-fit,minmax(190px,1fr))')
    .withChild(card('Pleins', String(metrics.orderedFillUps.length), 'Entrées enregistrées'))
    .withChild(card('Dépense totale', `${metrics.totalCost.toFixed(2)} €`, `${metrics.totalLiters.toFixed(1)} litres achetés`))
    .withChild(card('Consommation', `${metrics.averageConsumption.toFixed(2)} L/100 km`, `${metrics.measuredDistance.toFixed(0)} km observés`))
    .withChild(card('Coût kilométrique', `${metrics.costPerKm.toFixed(3)} €/km`, 'Calculé sur la distance mesurée'))
    .build();
  return new TagBuilder('section')
    .withStyle('display', 'grid').withStyle('gap', '1rem')
    .withChild(TagFactory.toHtml('heading', { level: 2, text: 'Tableau de bord', styles: { margin: '0', color: '#0f172a', fontSize: '1.6rem' } }))
    .withChild(grid)
    .build();
};

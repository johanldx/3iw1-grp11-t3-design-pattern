import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
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
  const ordered = [...fillUps].sort((a, b) => a.odometer - b.odometer);
  const totalCost = ordered.reduce((sum, item) => sum + item.liters * item.pricePerLiter, 0);
  const totalLiters = ordered.reduce((sum, item) => sum + item.liters, 0);
  const distance = ordered.length > 1
    ? ordered[ordered.length - 1].odometer - ordered[0].odometer
    : 0;
  const consumption = distance > 0 ? totalLiters / distance * 100 : 0;
  const costPerKm = distance > 0 ? totalCost / distance : 0;
  const grid = new TagBuilder('div')
    .withStyle('display', 'grid').withStyle('gap', '1rem')
    .withStyle('grid-template-columns', 'repeat(auto-fit,minmax(190px,1fr))')
    .withChild(card('Pleins', String(ordered.length), 'Entrées enregistrées'))
    .withChild(card('Dépense totale', `${totalCost.toFixed(2)} €`, `${totalLiters.toFixed(1)} litres achetés`))
    .withChild(card('Consommation', `${consumption.toFixed(2)} L/100 km`, `${distance.toFixed(0)} km observés`))
    .withChild(card('Coût kilométrique', `${costPerKm.toFixed(3)} €/km`, 'Calculé sur la période'))
    .build();
  return new TagBuilder('section')
    .withStyle('display', 'grid').withStyle('gap', '1rem')
    .withChild(TagFactory.toHtml('heading', { level: 2, text: 'Tableau de bord', styles: { margin: '0', color: '#0f172a', fontSize: '1.6rem' } }))
    .withChild(grid)
    .build();
};

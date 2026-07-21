import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import type { FillUp } from '../core/singleton.ts';

/**
 * Regroupe les callbacks utilisés par la vue d'historique.
 */
export interface HistoryViewHandlers {
  onEdit: (fillUpId: string) => void;
  onDelete: (fillUpId: string) => void;
}

/**
 * Construit la vue d'historique à partir d'une liste de pleins.
 *
 * @param fillUps Pleins à afficher dans l'historique.
 * @param handlers Callbacks associés aux actions de la vue.
 * @returns Élément HTML représentant la vue.
 */
export const createHistoryView = (
  fillUps: FillUp[],
  handlers: HistoryViewHandlers,
): HTMLElement => {
  const list = new TagBuilder('div')
    .withStyle('display', 'grid')
    .withStyle('gap', '0.85rem')
    .build();

  if (fillUps.length === 0) {
    list.appendChild(
      TagFactory.toHtml('p', {
        text: 'Aucun plein enregistre pour le moment.',
        styles: {
          margin: '0',
          color: '#475569',
          lineHeight: '1.6',
          padding: '1rem',
          borderRadius: '0.9rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
        },
      }),
    );
  } else {
    for (const fillUp of fillUps) {
      list.appendChild(
        new TagBuilder('div')
          .withStyle('display', 'grid')
          .withStyle('gap', '0.75rem')
          .withStyle('padding', '1rem')
          .withStyle('border-radius', '0.95rem')
          .withStyle('background', '#f8fafc')
          .withStyle('border', '1px solid #e2e8f0')
          .withChild(
            new TagBuilder('div')
              .withStyle('display', 'grid')
              .withStyle('gap', '0.35rem')
              .withChild(
                TagFactory.toHtml('p', {
                  text: fillUp.comment || 'Plein sans commentaire',
                  styles: {
                    margin: '0',
                    color: '#0f172a',
                    fontWeight: '700',
                  },
                }),
              )
              .withChild(
                TagFactory.toHtml('p', {
                  text: `${fillUp.date} • ${fillUp.odometer} km • ${fillUp.liters} L • ${fillUp.pricePerLiter.toFixed(2)} EUR/L`,
                  styles: {
                    margin: '0',
                    color: '#475569',
                    lineHeight: '1.6',
                  },
                }),
              )
              .build(),
          )
          .withChild(
            new TagBuilder('div')
              .withStyle('display', 'flex')
              .withStyle('gap', '0.65rem')
              .withStyle('flex-wrap', 'wrap')
              .withChild(
                TagFactory.toHtml('button', {
                  text: 'Editer',
                  styles: {
                    padding: '0.7rem 1rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.85rem',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: 'fit-content',
                  },
                  events: {
                    click: () => {
                      handlers.onEdit(fillUp.id);
                    },
                  },
                }),
              )
              .withChild(
                TagFactory.toHtml('button', {
                  text: 'Supprimer',
                  styles: {
                    padding: '0.7rem 1rem',
                    border: '1px solid #fecaca',
                    borderRadius: '0.85rem',
                    background: '#fff1f2',
                    color: '#be123c',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: 'fit-content',
                  },
                  events: {
                    click: () => {
                      handlers.onDelete(fillUp.id);
                    },
                  },
                }),
              )
              .build(),
          )
          .build(),
      );
    }
  }

  return new TagBuilder('section')
    .withStyle('display', 'grid')
    .withStyle('gap', '1rem')
    .withChild(
      TagFactory.toHtml('heading', {
        level: 2,
        text: 'Historique des pleins',
        styles: { margin: '0', color: '#0f172a', fontSize: '1.6rem' },
      }),
    )
    .withChild(
      TagFactory.toHtml('p', {
        text: 'Liste des entrees actuellement presentes dans le store global.',
        styles: {
          margin: '0',
          color: '#475569',
          lineHeight: '1.6',
        },
      }),
    )
    .withChild(list)
    .build();
};

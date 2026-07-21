import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import type { FillUp } from '../core/singleton.ts';

/**
 * Regroupe les callbacks utilisés par la vue d'édition.
 */
export interface EditFillUpViewHandlers {
  onUpdate: () => void;
  onBack: () => void;
}

/**
 * Construit la vue minimale d'édition d'un plein.
 *
 * @param fillUp Plein à éditer.
 * @param currentPath Route active affichée dans la vue.
 * @param fillUpId Identifiant du plein édité.
 * @param handlers Callbacks associés aux actions de la vue.
 * @returns Élément HTML représentant la vue.
 */
export const createEditFillUpView = (
  fillUp: FillUp,
  _currentPath: string,
  _fillUpId: string,
  handlers: EditFillUpViewHandlers,
): HTMLElement =>
  new TagBuilder('section')
    .withStyle('display', 'grid')
    .withStyle('gap', '1rem')
    .withChild(
      TagFactory.toHtml('heading', {
        level: 2,
        text: `Edition de ${fillUp.comment}`,
        styles: { margin: '0', color: '#0f172a', fontSize: '1.6rem' },
      }),
    )
    .withChild(
      TagFactory.toHtml('p', {
        text: 'Zone de travail pour modifier une entree existante.',
        styles: {
          margin: '0',
          color: '#475569',
          lineHeight: '1.6',
        },
      }),
    )
    .withChild(
      TagFactory.toHtml('p', {
        text: `${fillUp.date} • ${fillUp.odometer} km • ${fillUp.liters} L • ${fillUp.pricePerLiter.toFixed(2)} EUR/L`,
        styles: {
          margin: '0',
          color: '#64748b',
          lineHeight: '1.6',
        },
      }),
    )
    .withChild(
      new TagBuilder('div')
        .withStyle('display', 'flex')
        .withStyle('gap', '0.65rem')
        .withStyle('flex-wrap', 'wrap')
        .withChild(
          TagFactory.toHtml('button', {
            text: 'Mettre a jour le commentaire',
            styles: {
              padding: '0.8rem 1rem',
              border: 'none',
              borderRadius: '0.9rem',
              background: '#7c3aed',
              color: '#ffffff',
              fontWeight: '700',
              cursor: 'pointer',
              width: 'fit-content',
            },
            events: {
              click: () => {
                handlers.onUpdate();
              },
            },
          }),
        )
        .withChild(
          TagFactory.toHtml('button', {
            text: 'Retour a l historique',
            styles: {
              padding: '0.8rem 1rem',
              border: '1px solid #cbd5e1',
              borderRadius: '0.9rem',
              background: '#f8fafc',
              color: '#0f172a',
              fontWeight: '700',
              cursor: 'pointer',
              width: 'fit-content',
            },
            events: {
              click: () => {
                handlers.onBack();
              },
            },
          }),
        )
        .build(),
    )
    .build();

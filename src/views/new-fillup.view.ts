import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';

/**
 * Construit la vue minimale de création d'un plein.
 *
 * @param currentTitle Valeur courante du brouillon affichée dans la vue.
 * @param onCreate Callback déclenché lors de la création de la démo.
 * @returns Élément HTML représentant la vue.
 */
export const createNewFillUpView = (
  _currentTitle: string,
  onCreate: () => void,
): HTMLElement =>
  new TagBuilder('section')
    .withStyle('display', 'grid')
    .withStyle('gap', '1rem')
    .withChild(
      TagFactory.toHtml('heading', {
        level: 2,
        text: 'Nouveau plein',
        styles: { margin: '0', color: '#0f172a', fontSize: '1.6rem' },
      }),
    )
    .withChild(
      TagFactory.toHtml('p', {
        text: 'Espace reserve a la future creation d un plein.',
        styles: {
          margin: '0',
          color: '#475569',
          lineHeight: '1.6',
        },
      }),
    )
    .withChild(
      TagFactory.toHtml('p', {
        text: 'Pour la demo actuelle, le bouton ci-dessous ajoute une entree de test puis redirige vers l historique.',
        styles: {
          margin: '0',
          color: '#64748b',
          lineHeight: '1.6',
        },
      }),
    )
    .withChild(
      TagFactory.toHtml('button', {
        text: 'Creer une entree de demo',
        styles: {
          padding: '0.8rem 1rem',
          border: 'none',
          borderRadius: '0.9rem',
          background: '#0f766e',
          color: '#ffffff',
          fontWeight: '700',
          cursor: 'pointer',
          width: 'fit-content',
        },
        events: {
          click: () => {
            onCreate();
          },
        },
      }),
    )
    .build();

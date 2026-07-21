import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';

/**
 * Construit la vue de tableau de bord de base.
 *
 * @param currentPath Route active affichée dans la vue.
 * @param currentTitle Titre courant reflété dans la démo.
 * @returns Élément HTML représentant la vue.
 */
export const createDashboardView = (
  _currentPath: string,
  _currentTitle: string,
): HTMLElement =>
  new TagBuilder('section')
    .withStyle('display', 'grid')
    .withStyle('gap', '1rem')
    .withChild(
      TagFactory.toHtml('heading', {
        level: 2,
        text: 'Tableau de bord',
        styles: {
          margin: '0',
          color: '#0f172a',
          fontSize: '1.6rem',
        },
      }),
    )
    .withChild(
      TagFactory.toHtml('p', {
        text: 'Vue d accueil de l application. Cette base est prete a recevoir la logique metier et les ecrans definitifs.',
        styles: {
          margin: '0',
          color: '#475569',
          lineHeight: '1.6',
        },
      }),
    )
    .withChild(
      new TagBuilder('div')
        .withStyle('display', 'grid')
        .withStyle('gap', '1rem')
        .withStyle('grid-template-columns', 'repeat(auto-fit, minmax(240px, 1fr))')
        .withChild(
          new TagBuilder('article')
            .withStyle('display', 'grid')
            .withStyle('gap', '0.55rem')
            .withStyle('padding', '1rem')
            .withStyle('border-radius', '0.9rem')
            .withStyle('background', '#f8fafc')
            .withStyle('border', '1px solid #e2e8f0')
            .withChild(
              TagFactory.toHtml('heading', {
                level: 3,
                text: 'Structure en place',
                styles: {
                  margin: '0',
                  color: '#0f172a',
                  fontSize: '1rem',
                },
              }),
            )
            .withChild(
              TagFactory.toHtml('p', {
                text: 'Menu, routage client, store global, composants et reactivite sont deja poses proprement.',
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
          new TagBuilder('article')
            .withStyle('display', 'grid')
            .withStyle('gap', '0.55rem')
            .withStyle('padding', '1rem')
            .withStyle('border-radius', '0.9rem')
            .withStyle('background', '#f8fafc')
            .withStyle('border', '1px solid #e2e8f0')
            .withChild(
              TagFactory.toHtml('heading', {
                level: 3,
                text: 'Suite du projet',
                styles: {
                  margin: '0',
                  color: '#0f172a',
                  fontSize: '1rem',
                },
              }),
            )
            .withChild(
              TagFactory.toHtml('p', {
                text: 'Cette base est faite pour accueillir la vraie logique metier, la validation et les integrations sans repartir du shell.',
                styles: {
                  margin: '0',
                  color: '#475569',
                  lineHeight: '1.6',
                },
              }),
            )
            .build(),
        )
        .build(),
    )
    .build();

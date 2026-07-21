import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import { Component } from './base.component.ts';

/**
 * Décrit les données nécessaires au composant de mise en page principal.
 */
export interface LayoutProps {
  title: string;
  subtitle: string;
  footerText: string;
}

/**
 * Structure la page autour d'un en-tête, d'une zone de contenu et d'un pied de page.
 */
export class LayoutComponent extends Component<LayoutProps> {
  /**
   * Initialise le composant de layout.
   *
   * @param props Props de structure et de contenu du layout.
   */
  constructor(props: LayoutProps) {
    super(props, {});
  }

  /**
   * Retourne le slot principal destiné à accueillir le contenu applicatif.
   *
   * @returns Élément HTML servant de zone de contenu.
   */
  getContentSlot(): HTMLDivElement {
    const slot = this.getElement()?.querySelector<HTMLDivElement>('[data-slot="content"]');

    if (!slot) {
      throw new Error('Layout content slot not found.');
    }

    return slot;
  }

  protected render(): HTMLElement {
    return new TagBuilder('section')
      .withStyle('max-width', '1100px')
      .withStyle('margin', '0 auto')
      .withStyle('padding', '1.5rem 1.25rem 3rem')
      .withStyle('font-family', 'ui-sans-serif, system-ui, sans-serif')
      .withChild(
        new TagBuilder('header')
          .withStyle('display', 'grid')
          .withStyle('gap', '0.5rem')
          .withStyle('padding', '1.25rem')
          .withStyle('border-radius', '0.9rem')
          .withStyle('background', '#ffffff')
          .withStyle('border', '1px solid #dbe3f0')
          .withStyle('box-shadow', '0 10px 28px rgba(15, 23, 42, 0.05)')
          .withChild(
            TagFactory.toHtml('heading', {
              level: 1,
              text: this.props.title,
              styles: {
                margin: '0',
                color: '#0f172a',
                fontSize: 'clamp(1.8rem, 3vw, 2.3rem)',
              },
            }),
          )
          .withChild(
            TagFactory.toHtml('p', {
              text: this.props.subtitle,
              styles: {
                margin: '0',
                color: '#475569',
                lineHeight: '1.6',
                maxWidth: '64ch',
              },
            }),
          )
          .build(),
      )
      .withChild(
        new TagBuilder('main')
          .withStyle('display', 'grid')
          .withStyle('gap', '1.5rem')
          .withStyle('margin-top', '1.5rem')
          .withChild(
            TagFactory.toHtml('div', {
              className: 'layout-content',
              attributes: {
                'data-slot': 'content',
              },
            }),
          )
          .build(),
      )
      .withChild(
        TagFactory.toHtml('p', {
          text: this.props.footerText,
          styles: {
            margin: '1.5rem 0 0 0',
            color: '#64748b',
            fontSize: '0.95rem',
            textAlign: 'center',
          },
          attributes: {
            'data-slot': 'footer',
          },
        }),
      )
      .build();
  }
}

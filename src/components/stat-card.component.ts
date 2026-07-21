import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import { Component } from './base.component.ts';

/**
 * Décrit les données affichées par une carte de statistique.
 */
export interface StatCardProps {
  title: string;
  value: string;
  description: string;
  tone: string;
}

/**
 * Affiche une carte de statistique simple à partir de props textuelles.
 */
export class StatCardComponent extends Component<StatCardProps> {
  /**
   * Initialise une carte de statistique.
   *
   * @param props Données à afficher dans la carte.
   */
  constructor(props: StatCardProps) {
    super(props, {});
  }

  protected render(): HTMLElement {
    return new TagBuilder('article')
      .withStyle('display', 'grid')
      .withStyle('gap', '0.5rem')
      .withStyle('min-width', '0')
      .withStyle('padding', '1.25rem')
      .withStyle('border-radius', '0.95rem')
      .withStyle('background', '#ffffff')
      .withStyle('border', `1px solid ${this.props.tone}22`)
      .withStyle('box-shadow', '0 10px 28px rgba(15, 23, 42, 0.05)')
      .withStyle('overflow', 'hidden')
      .withChild(
        TagFactory.toHtml('span', {
          text: this.props.title,
          styles: {
            color: '#64748b',
            fontWeight: '700',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          },
        }),
      )
      .withChild(
        TagFactory.toHtml('heading', {
          level: 2,
          text: this.props.value,
          styles: {
            margin: '0',
            color: this.props.tone,
            fontSize: '1.7rem',
          },
        }),
      )
      .withChild(
        TagFactory.toHtml('p', {
          text: this.props.description,
          styles: {
            margin: '0',
            color: '#475569',
            lineHeight: '1.6',
          },
        }),
      )
      .build();
  }
}

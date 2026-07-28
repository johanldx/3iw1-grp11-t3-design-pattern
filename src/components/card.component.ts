import { TagBuilder } from '../core/builder.ts';
import { Component } from './base.component.ts';

/** Contenu accepté par un slot de carte. */
export type SlotContent = Node | readonly Node[] | null;

/** Slots nommés permettant la composition parent-enfant d'une carte. */
export interface CardSlots {
  header?: SlotContent;
  body: SlotContent;
  actions?: SlotContent;
}

/**
 * Décrit les propriétés publiques de la carte générique.
 */
export interface CardProps {
  slots: CardSlots;
  tone?: string;
}

const appendSlot = (host: HTMLElement, content: SlotContent): void => {
  if (!content) return;
  host.append(...(Array.isArray(content) ? content : [content]));
};

/**
 * Carte générique composée de slots nommés header, body et actions.
 * Les enfants sont fournis par le parent sans coupler la carte au métier.
 */
export class CardComponent extends Component<CardProps> {
  /**
   * Initialise une carte générique composable.
   *
   * @param props Slots et teinte optionnelle de la carte.
   */
  constructor(props: CardProps) {
    super(props, {});
  }

  protected render(): HTMLElement {
    const card = new TagBuilder('article')
      .withStyle('display', 'grid')
      .withStyle('gap', '.65rem')
      .withStyle('padding', '1rem')
      .withStyle('border-radius', '.9rem')
      .withStyle('background', '#f8fafc')
      .withStyle('border', `1px solid ${this.props.tone ?? '#e2e8f0'}`)
      .build();
    const header = new TagBuilder('header').withClass('card-slot-header').build();
    const body = new TagBuilder('div').withClass('card-slot-body').build();
    const actions = new TagBuilder('footer').withClass('card-slot-actions').build();
    appendSlot(header, this.props.slots.header ?? null);
    appendSlot(body, this.props.slots.body);
    appendSlot(actions, this.props.slots.actions ?? null);
    if (header.childNodes.length) card.append(header);
    card.append(body);
    if (actions.childNodes.length) card.append(actions);
    return card;
  }
}

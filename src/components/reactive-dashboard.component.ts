import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import { calculateFuelMetrics } from '../core/fuel-metrics.ts';
import { bindStyle, bindText, type Subscribable } from '../core/reactivity.ts';
import {
  AppStore,
  type FillUp,
  type FillUpFormState,
} from '../core/singleton.ts';
import { Router } from '../router/router.ts';
import { Component } from './base.component.ts';

/**
 * Décrit les dépendances nécessaires au dashboard réactif.
 */
export interface ReactiveDashboardProps {
  store: AppStore;
  router: Router;
}

const toSubscribable = <T>(
  subscribe: (callback: (value: T) => void) => () => void,
): Subscribable<T> => ({
  subscribe,
});

/**
 * Affiche un tableau de bord mis à jour directement par des observables liés au DOM.
 */
export class ReactiveDashboardComponent extends Component<ReactiveDashboardProps> {
  /**
   * Initialise le dashboard réactif.
   *
   * @param props Dépendances de lecture du store et du routeur.
   */
  constructor(props: ReactiveDashboardProps) {
    super(props, {});
  }

  protected render(): HTMLElement {
    return new TagBuilder('section')
      .withStyle('display', 'grid')
      .withStyle('gap', '1rem')
      .withChild(
        TagFactory.toHtml('heading', {
          level: 2,
          text: 'Reactivite Observable -> DOM',
          styles: {
            margin: '0',
            color: '#0f172a',
            fontSize: '1.4rem',
          },
        }),
      )
      .withChild(
        TagFactory.toHtml('p', {
          text: 'Ce bloc recoit des mises a jour directes depuis les observables du store et du routeur. Les noeuds cibles changent sans rerender global.',
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
          .withStyle('grid-template-columns', 'repeat(auto-fit, minmax(220px, 1fr))')
          .withChild(this.createMetricCard('Compteur d entrees', 'entry-count', '0'))
          .withChild(this.createMetricCard('Budget total', 'total-budget', '0.00 EUR'))
          .withChild(this.createMetricCard('Conso moyenne', 'average-consumption', '0.00 L/100'))
          .withChild(this.createMetricCard('Route active', 'active-route', '/'))
          .build(),
      )
      .withChild(
        new TagBuilder('div')
          .withStyle('display', 'grid')
          .withStyle('gap', '0.5rem')
          .withStyle('padding', '1rem')
          .withStyle('border-radius', '0.9rem')
          .withStyle('background', '#ffffff')
          .withStyle('border', '1px solid #e2e8f0')
          .withStyle('overflow', 'hidden')
          .withChild(
            TagFactory.toHtml('p', {
              text: 'Selection active :',
              styles: {
                margin: '0',
                color: '#64748b',
                fontWeight: '700',
              },
            }),
          )
          .withChild(
            TagFactory.toHtml('p', {
              text: 'aucune',
              styles: {
                margin: '0',
                color: '#0f172a',
                fontWeight: '700',
              },
              attributes: {
                'data-role': 'selected-fill-up',
              },
            }),
          )
          .withChild(
            TagFactory.toHtml('p', {
              text: 'Brouillon commentaire : vide',
              styles: {
                margin: '0',
                color: '#475569',
                lineHeight: '1.6',
              },
              attributes: {
                'data-role': 'draft-comment',
              },
            }),
          )
          .build(),
      )
      .build();
  }

  protected onMount(): void {
    const root = this.getElement();

    if (!root) {
      return;
    }

    const entryCount = root.querySelector<HTMLElement>('[data-role="entry-count"]');
    const totalBudget = root.querySelector<HTMLElement>('[data-role="total-budget"]');
    const averageConsumption = root.querySelector<HTMLElement>('[data-role="average-consumption"]');
    const activeRoute = root.querySelector<HTMLElement>('[data-role="active-route"]');
    const selectedFillUp = root.querySelector<HTMLElement>('[data-role="selected-fill-up"]');
    const draftComment = root.querySelector<HTMLElement>('[data-role="draft-comment"]');

    if (
      !entryCount ||
      !totalBudget ||
      !averageConsumption ||
      !activeRoute ||
      !selectedFillUp ||
      !draftComment
    ) {
      return;
    }

    const fillUps$ = toSubscribable<FillUp[]>((callback) =>
      this.props.store.subscribeKey('fillUps', callback),
    );
    const selectedFillUpId$ = toSubscribable<string | null>((callback) =>
      this.props.store.subscribeKey('selectedFillUpId', callback),
    );
    const formDraft$ = toSubscribable<FillUpFormState>((callback) =>
      this.props.store.subscribeKey('formDraft', callback),
    );
    const route$ = toSubscribable<string>((callback) => this.props.router.subscribe(callback));

    this.registerCleanup(bindText(fillUps$, entryCount, (fillUps) => `${fillUps.length}`));
    this.registerCleanup(
      bindText(fillUps$, totalBudget, (fillUps) =>
        `${calculateFuelMetrics(fillUps).totalCost.toFixed(2)} EUR`,
      ),
    );
    this.registerCleanup(
      bindText(fillUps$, averageConsumption, (fillUps) =>
        `${calculateFuelMetrics(fillUps).averageConsumption.toFixed(2)} L/100`,
      ),
    );
    this.registerCleanup(bindText(route$, activeRoute, (route) => route));
    this.registerCleanup(
      bindText(selectedFillUpId$, selectedFillUp, (fillUpId) => fillUpId ?? 'aucune'),
    );
    this.registerCleanup(
      bindText(formDraft$, draftComment, (formDraft) =>
        `Brouillon commentaire : ${formDraft.comment.trim() || 'vide'}`,
      ),
    );
    this.registerCleanup(
      bindStyle(fillUps$, totalBudget, 'color', (fillUps) =>
        calculateFuelMetrics(fillUps).totalCost > 0 ? '#0f766e' : '#0f172a',
      ),
    );
    this.registerCleanup(
      bindStyle(route$, activeRoute, 'color', (route) =>
        route.includes('/edit') ? '#b45309' : '#0f172a',
      ),
    );
  }

  private createMetricCard(label: string, role: string, initialValue: string): HTMLElement {
    return new TagBuilder('article')
      .withStyle('display', 'grid')
      .withStyle('gap', '0.5rem')
      .withStyle('min-width', '0')
      .withStyle('padding', '1rem')
      .withStyle('border-radius', '0.9rem')
      .withStyle('background', '#ffffff')
      .withStyle('border', '1px solid #e2e8f0')
      .withStyle('box-shadow', '0 10px 28px rgba(15, 23, 42, 0.05)')
      .withStyle('overflow', 'hidden')
      .withChild(
        TagFactory.toHtml('span', {
          text: label,
          styles: {
            color: '#64748b',
            fontSize: '0.85rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          },
        }),
      )
      .withChild(
        TagFactory.toHtml('span', {
          text: initialValue,
          styles: {
            color: '#0f172a',
            fontSize: '1.6rem',
            fontWeight: '700',
          },
          attributes: {
            'data-role': role,
          },
        }),
      )
      .build();
  }
}

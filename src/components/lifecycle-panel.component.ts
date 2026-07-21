import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import { Observable, type Unsubscribe } from '../core/observer.ts';
import { Component } from './base.component.ts';

/**
 * Décrit les données nécessaires au panneau de suivi du cycle de vie.
 */
export interface LifecyclePanelProps {
  observerFeed: Observable<string>;
  status: string;
}

interface LifecyclePanelState {
  lastEvent: string;
}

/**
 * Affiche les événements du composant et l'état des hooks de cycle de vie.
 */
export class LifecyclePanelComponent extends Component<
  LifecyclePanelProps,
  LifecyclePanelState
> {
  private mountCount = 0;
  private updateCount = 0;

  /**
   * Initialise le panneau de cycle de vie.
   *
   * @param props Props nécessaires au suivi des événements.
   */
  constructor(props: LifecyclePanelProps) {
    super(props, {
      lastEvent: props.observerFeed.getValue() ?? 'Aucun evenement recu pour le moment.',
    });
  }

  protected render(): HTMLElement {
    return new TagBuilder('section')
      .withStyle('display', 'grid')
      .withStyle('gap', '0.75rem')
      .withStyle('padding', '1.25rem')
      .withStyle('border-radius', '0.95rem')
      .withStyle('background', '#ffffff')
      .withStyle('border', '1px solid #dbe3f0')
      .withChild(
        TagFactory.toHtml('heading', {
          level: 2,
          text: 'LifecyclePanel',
          styles: {
            margin: '0',
            color: '#0f172a',
            fontSize: '1.3rem',
          },
        }),
      )
      .withChild(
        TagFactory.toHtml('p', {
          text: `Observer status : ${this.props.status}`,
          styles: {
            margin: '0',
            color: '#1d4ed8',
            fontWeight: '700',
          },
        }),
      )
      .withChild(
        TagFactory.toHtml('p', {
          text: this.state.lastEvent,
          styles: {
            margin: '0',
            color: '#334155',
            lineHeight: '1.6',
          },
        }),
      )
      .withChild(
        new TagBuilder('div')
          .withStyle('display', 'grid')
          .withStyle('gap', '0.75rem')
          .withStyle('grid-template-columns', 'repeat(auto-fit, minmax(140px, 1fr))')
          .withChild(this.createMetric('Montages', 'mount-count', `${this.mountCount}`))
          .withChild(this.createMetric('Updates', 'update-count', `${this.updateCount}`))
          .build(),
      )
      .build();
  }

  protected onMount(): void {
    this.mountCount += 1;
    this.syncMetrics();
    this.emit('component:mounted', {
      component: 'LifecyclePanel',
      mounts: this.mountCount,
    });

    const unsubscribe = this.props.observerFeed.subscribe((message) => {
      this.setState({
        lastEvent: message,
      });
    });

    this.registerCleanup(unsubscribe as Unsubscribe);
  }

  protected onUpdate(): void {
    this.updateCount += 1;
    this.syncMetrics();
    this.emit('component:updated', {
      component: 'LifecyclePanel',
      updates: this.updateCount,
    });
  }

  protected onDestroy(): void {
    this.emit('component:destroyed', {
      component: 'LifecyclePanel',
      mounts: this.mountCount,
      updates: this.updateCount,
    });
  }

  private createMetric(label: string, role: string, value: string): HTMLElement {
    return new TagBuilder('div')
      .withStyle('display', 'grid')
      .withStyle('gap', '0.2rem')
      .withStyle('padding', '0.75rem 0.9rem')
      .withStyle('border-radius', '0.85rem')
      .withStyle('background', '#f8fafc')
      .withStyle('border', '1px solid #e2e8f0')
      .withStyle('min-width', '0')
      .withChild(
        TagFactory.toHtml('span', {
          text: label,
          styles: {
            color: '#64748b',
            fontSize: '0.85rem',
            fontWeight: '700',
          },
        }),
      )
      .withChild(
        TagFactory.toHtml('span', {
          text: value,
          styles: {
            color: '#0f172a',
            fontSize: '1.1rem',
            fontWeight: '700',
          },
          attributes: {
            'data-role': role,
          },
        }),
      )
      .build();
  }

  private syncMetrics(): void {
    const root = this.getElement();

    if (!root) {
      return;
    }

    const mountCounter = root.querySelector<HTMLElement>('[data-role="mount-count"]');
    const updateCounter = root.querySelector<HTMLElement>('[data-role="update-count"]');

    if (mountCounter) {
      mountCounter.textContent = `${this.mountCount}`;
    }

    if (updateCounter) {
      updateCounter.textContent = `${this.updateCount}`;
    }
  }
}

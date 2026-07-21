import { LayoutComponent } from '../components/layout.component.ts';
import { LifecyclePanelComponent } from '../components/lifecycle-panel.component.ts';
import { ReactiveDashboardComponent } from '../components/reactive-dashboard.component.ts';
import { StatCardComponent } from '../components/stat-card.component.ts';
import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import { Observable } from '../core/observer.ts';
import { AppStore } from '../core/singleton.ts';
import { Router } from '../router/router.ts';

/**
 * Regroupe toutes les références utiles du shell applicatif déjà monté.
 */
export interface AppShell {
  layout: LayoutComponent;
  nameInput: HTMLInputElement;
  lifecycleEventNote: HTMLParagraphElement;
  actionButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  routeBadge: HTMLSpanElement;
  navigationRow: HTMLDivElement;
  lifecycleHost: HTMLDivElement;
  routeViewHost: HTMLDivElement;
  fillUpsCard: StatCardComponent;
  configCard: StatCardComponent;
  formDraftCard: StatCardComponent;
  reactiveDashboard: ReactiveDashboardComponent;
  lifecyclePanel: LifecyclePanelComponent;
}

interface CreateAppShellOptions {
  appRoot: HTMLDivElement;
  store: AppStore;
  router: Router;
  observerFeed: Observable<string>;
}

/**
 * Construit le shell principal de l'application et retourne ses références utiles.
 *
 * @param options Dépendances nécessaires au montage du shell.
 * @returns Ensemble des composants et nœuds montés.
 */
export const createAppShell = ({
  appRoot,
  store,
  router,
  observerFeed,
}: CreateAppShellOptions): AppShell => {
  const layout = new LayoutComponent({
    title: 'FuelLog',
    subtitle:
      'Base front structuree pour la suite du projet : navigation claire, pages separees, resume applicatif et panneau technique range a part.',
    footerText:
      'FuelLog - socle DOM, composants, routing, store global et reactivite prepares pour la suite du projet.',
  });

  layout.mount(appRoot);

  const contentSlot = layout.getContentSlot();
  contentSlot.style.display = 'grid';
  contentSlot.style.gap = '1.5rem';

  const nameInput = TagFactory.toHtml('input', {
    type: 'text',
    name: 'comment-draft',
    placeholder: 'Commentaire par defaut',
    className: 'factory-input',
    styles: {
      width: '100%',
      padding: '0.85rem 1rem',
      border: '1px solid #cbd5e1',
      borderRadius: '0.85rem',
      fontSize: '0.95rem',
      boxSizing: 'border-box',
      background: '#ffffff',
    },
  });
  nameInput.id = 'comment-draft-input';

  const lifecycleEventNote = TagFactory.toHtml('p', {
    text: 'Dernier evenement composant : en attente.',
    styles: {
      margin: '0',
      color: '#475569',
      lineHeight: '1.6',
      fontSize: '0.95rem',
    },
  });

  const actionButton = TagFactory.toHtml('button', {
    text: 'Ajouter une entree de demo',
    styles: {
      padding: '0.85rem 1rem',
      border: 'none',
      borderRadius: '999px',
      background: '#0f766e',
      color: '#ffffff',
      fontWeight: '700',
      cursor: 'pointer',
      width: '100%',
      maxWidth: '100%',
      textAlign: 'center',
      boxSizing: 'border-box',
    },
  });

  const resetButton = new TagBuilder('button')
    .withText('Reinitialiser')
    .withStyle('padding', '0.85rem 1rem')
    .withStyle('border', '1px solid #cbd5e1')
    .withStyle('border-radius', '999px')
    .withStyle('background', '#ffffff')
    .withStyle('color', '#0f172a')
    .withStyle('font-weight', '700')
    .withStyle('cursor', 'pointer')
    .withStyle('width', '100%')
    .withStyle('max-width', '100%')
    .withStyle('text-align', 'center')
    .withStyle('box-sizing', 'border-box')
    .build();

  const routeBadge = TagFactory.toHtml('span', {
    text: router.getCurrentPath(),
    styles: {
      display: 'inline-flex',
      padding: '0.35rem 0.7rem',
      borderRadius: '999px',
      background: '#ecfeff',
      color: '#155e75',
      fontWeight: '700',
      fontSize: '0.85rem',
      width: 'fit-content',
    },
  });

  const technicalMetaGrid = TagFactory.toHtml('div', {
    styles: {
      display: 'grid',
      gap: '0.75rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    },
  });

  const navigationRow = TagFactory.toHtml('div', {
    styles: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
  });

  const cardsGrid = TagFactory.toHtml('div', {
    styles: {
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    },
  });

  const actionsRow = TagFactory.toHtml('div', {
    styles: {
      display: 'grid',
      gap: '0.75rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      alignItems: 'stretch',
    },
    children: [actionButton, resetButton],
  });

  const reactiveDashboardHost = TagFactory.toHtml('div', {
    styles: {
      display: 'grid',
      gap: '1rem',
    },
  });

  const lifecycleHost = TagFactory.toHtml('div', {
    styles: {
      display: 'grid',
      gap: '0.75rem',
    },
  });

  const routeViewHost = TagFactory.toHtml('div', {
    styles: {
      display: 'grid',
      gap: '1rem',
    },
  });

  const topNavigation = new TagBuilder('nav')
    .withStyle('display', 'flex')
    .withStyle('gap', '1rem')
    .withStyle('align-items', 'center')
    .withStyle('justify-content', 'flex-start')
    .withStyle('flex-wrap', 'wrap')
    .withStyle('padding', '1rem 1.25rem')
    .withStyle('border-radius', '0.9rem')
    .withStyle('background', '#ffffff')
    .withStyle('border', '1px solid #dbe3f0')
    .withStyle('box-shadow', '0 10px 28px rgba(15, 23, 42, 0.05)')
    .withChild(navigationRow)
    .build();

  const routeMetaCard = new TagBuilder('div')
    .withStyle('display', 'grid')
    .withStyle('gap', '0.5rem')
    .withStyle('padding', '1rem')
    .withStyle('border-radius', '0.85rem')
    .withStyle('background', '#ffffff')
    .withStyle('border', '1px solid #dbe3f0')
    .withChild(
      TagFactory.toHtml('p', {
        text: 'Route courante',
        styles: {
          margin: '0',
          color: '#64748b',
          fontWeight: '700',
          fontSize: '0.9rem',
        },
      }),
    )
    .withChild(routeBadge)
    .build();

  const eventMetaCard = new TagBuilder('div')
    .withStyle('display', 'grid')
    .withStyle('gap', '0.5rem')
    .withStyle('padding', '1rem')
    .withStyle('border-radius', '0.85rem')
    .withStyle('background', '#ffffff')
    .withStyle('border', '1px solid #dbe3f0')
    .withChild(
      TagFactory.toHtml('p', {
        text: 'Dernier evenement',
        styles: {
          margin: '0',
          color: '#64748b',
          fontWeight: '700',
          fontSize: '0.9rem',
        },
      }),
    )
    .withChild(lifecycleEventNote)
    .build();

  const draftCard = new TagBuilder('section')
    .withStyle('display', 'grid')
    .withStyle('gap', '0.85rem')
    .withStyle('padding', '1.25rem')
    .withStyle('border-radius', '0.9rem')
    .withStyle('background', '#ffffff')
    .withStyle('border', '1px solid #dbe3f0')
    .withStyle('box-shadow', '0 10px 28px rgba(15, 23, 42, 0.05)')
    .withChild(
      TagFactory.toHtml('heading', {
        level: 2,
        text: 'Brouillon rapide',
        styles: {
          margin: '0',
          color: '#0f172a',
          fontSize: '1.1rem',
        },
      }),
    )
    .withChild(
      new TagBuilder('label')
        .withText('Commentaire par defaut')
        .withStyle('color', '#334155')
        .withStyle('font-weight', '700')
        .withStyle('font-size', '0.95rem')
        .withStyle('display', 'block')
        .build(),
    )
    .withChild(nameInput)
    .build();

  const actionsCard = new TagBuilder('section')
    .withStyle('display', 'grid')
    .withStyle('gap', '0.85rem')
    .withStyle('padding', '1.25rem')
    .withStyle('border-radius', '0.9rem')
    .withStyle('background', '#ffffff')
    .withStyle('border', '1px solid #dbe3f0')
    .withStyle('box-shadow', '0 10px 28px rgba(15, 23, 42, 0.05)')
    .withChild(
      TagFactory.toHtml('heading', {
        level: 2,
        text: 'Actions rapides',
        styles: {
          margin: '0',
          color: '#0f172a',
          fontSize: '1.1rem',
        },
      }),
    )
    .withChild(
      TagFactory.toHtml('p', {
        text: 'Actions simples pour alimenter la base de travail.',
        styles: {
          margin: '0',
          color: '#64748b',
          lineHeight: '1.5',
        },
      }),
    )
    .withChild(actionsRow)
    .build();

  const routePanel = new TagBuilder('section')
    .withStyle('display', 'grid')
    .withStyle('gap', '1rem')
    .withStyle('padding', '1.5rem')
    .withStyle('border-radius', '0.9rem')
    .withStyle('background', '#ffffff')
    .withStyle('border', '1px solid #dbe3f0')
    .withStyle('box-shadow', '0 12px 32px rgba(15, 23, 42, 0.06)')
    .withChild(routeViewHost)
    .build();

  const fillUpsCard = new StatCardComponent({
    title: 'Pleins',
    value: '0',
    description: 'Nombre total d entrees dans le store.',
    tone: '#0f5132',
  });

  const configCard = new StatCardComponent({
    title: 'Configuration',
    value: 'EUR / km',
    description: 'Configuration globale partagee via AppConfig.',
    tone: '#1d4ed8',
  });

  const formDraftCard = new StatCardComponent({
    title: 'Commentaire',
    value: 'Aucun',
    description: 'Valeur du brouillon courant dans le store global.',
    tone: '#7c3aed',
  });

  const reactiveDashboard = new ReactiveDashboardComponent({
    store,
    router,
  });

  fillUpsCard.mount(cardsGrid);
  configCard.mount(cardsGrid);
  formDraftCard.mount(cardsGrid);
  reactiveDashboard.mount(reactiveDashboardHost);
  technicalMetaGrid.append(routeMetaCard, eventMetaCard);

  const lifecyclePanel = new LifecyclePanelComponent({
    observerFeed,
    status: 'actif',
  });

  const technicalSection = new TagBuilder('section')
    .withStyle('display', 'grid')
    .withStyle('gap', '1rem')
    .withStyle('padding', '1.5rem')
    .withStyle('border-radius', '0.9rem')
    .withStyle('background', '#f8fafc')
    .withStyle('border', '1px solid #dbe3f0')
    .withChild(
      TagFactory.toHtml('heading', {
        level: 2,
        text: 'Panneau technique',
        styles: {
          margin: '0',
          color: '#0f172a',
          fontSize: '1.2rem',
        },
      }),
    )
    .withChild(
      TagFactory.toHtml('p', {
        text: 'Les points techniques restent disponibles ici, sans encombrer les ecrans principaux.',
        styles: {
          margin: '0',
          color: '#475569',
          lineHeight: '1.6',
        },
      }),
    )
    .withChild(technicalMetaGrid)
    .withChild(reactiveDashboardHost)
    .withChild(lifecycleHost)
    .build();

  const utilityGrid = new TagBuilder('div')
    .withStyle('display', 'grid')
    .withStyle('gap', '1rem')
    .withStyle('grid-template-columns', 'repeat(auto-fit, minmax(280px, 1fr))')
    .withChild(draftCard)
    .withChild(actionsCard)
    .build();

  const overviewSection = new TagBuilder('section')
    .withStyle('display', 'grid')
    .withStyle('gap', '1rem')
    .withChild(
      TagFactory.toHtml('heading', {
        level: 2,
        text: 'Resume',
        styles: {
          margin: '0',
          color: '#0f172a',
          fontSize: '1.2rem',
        },
      }),
    )
    .withChild(cardsGrid)
    .build();

  const shell = new TagBuilder('div')
    .withStyle('display', 'grid')
    .withStyle('gap', '1.5rem')
    .withChild(topNavigation)
    .withChild(routePanel)
    .withChild(overviewSection)
    .withChild(utilityGrid)
    .withChild(technicalSection)
    .build();

  contentSlot.appendChild(shell);

  return {
    layout,
    nameInput,
    lifecycleEventNote,
    actionButton,
    resetButton,
    routeBadge,
    navigationRow,
    lifecycleHost,
    routeViewHost,
    fillUpsCard,
    configCard,
    formDraftCard,
    reactiveDashboard,
    lifecyclePanel,
  };
};

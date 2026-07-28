import { LayoutComponent } from '../components/layout.component.ts';
import { TagBuilder } from '../core/builder.ts';

/**
 * Regroupe les références utiles du shell applicatif.
 */
export interface AppShell {
  layout: LayoutComponent;
  navigationRow: HTMLDivElement;
  routeViewHost: HTMLDivElement;
}

interface CreateAppShellOptions {
  appRoot: HTMLDivElement;
}

/**
 * Construit le shell principal de l'application sans panneaux de debug.
 *
 * @param options Dépendances nécessaires au montage du shell.
 * @returns Ensemble des nœuds montés pour la navigation et les vues.
 */
export const createAppShell = ({
  appRoot,
}: CreateAppShellOptions): AppShell => {
  const layout = new LayoutComponent({
    title: 'FuelLog',
    subtitle:
      'Suivez vos pleins, votre consommation moyenne, votre depense totale et votre cout au kilometre.',
    footerText:
      'FuelLog - application de demonstration du mini-framework TypeScript orienté DOM.',
  });

  layout.mount(appRoot);

  const contentSlot = layout.getContentSlot();
  contentSlot.style.display = 'grid';
  contentSlot.style.gap = '1.5rem';

  const navigationRow = document.createElement('div');
  navigationRow.style.display = 'flex';
  navigationRow.style.gap = '0.75rem';
  navigationRow.style.flexWrap = 'wrap';
  navigationRow.style.alignItems = 'center';

  const routeViewHost = document.createElement('div');
  routeViewHost.style.display = 'grid';
  routeViewHost.style.gap = '1rem';

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
    .withStyle('position', 'sticky')
    .withStyle('top', '0')
    .withStyle('z-index', '1')
    .withChild(navigationRow)
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

  const shell = new TagBuilder('div')
    .withStyle('display', 'grid')
    .withStyle('gap', '1.5rem')
    .withChild(topNavigation)
    .withChild(routePanel)
    .build();

  contentSlot.appendChild(shell);

  return {
    layout,
    navigationRow,
    routeViewHost,
  };
};

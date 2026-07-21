import type { Unsubscribe } from './observer.ts';

/**
 * Décrit une source capable de notifier des valeurs successives.
 */
export interface Subscribable<T> {
  /**
   * Abonne un callback à la source de données.
   *
   * @param callback Fonction appelée à chaque mise à jour.
   * @returns Fonction permettant de se désabonner.
   */
  subscribe(callback: (value: T) => void): Unsubscribe;
}

/**
 * Lie le texte d'un nœud DOM à une source observable.
 *
 * @param source Source à observer.
 * @param target Nœud dont le texte doit être mis à jour.
 * @param project Fonction de projection vers une chaîne affichable.
 * @returns Fonction permettant de se désabonner.
 */
export const bindText = <T>(
  source: Subscribable<T>,
  target: Node,
  project: (value: T) => string,
): Unsubscribe =>
  source.subscribe((value) => {
    target.textContent = project(value);
  });

/**
 * Lie une propriété de style CSS à une source observable.
 *
 * @param source Source à observer.
 * @param element Élément DOM à mettre à jour.
 * @param property Nom de la propriété CSS.
 * @param project Fonction de projection vers la valeur CSS.
 * @returns Fonction permettant de se désabonner.
 */
export const bindStyle = <T>(
  source: Subscribable<T>,
  element: HTMLElement,
  property: string,
  project: (value: T) => string,
): Unsubscribe =>
  source.subscribe((value) => {
    element.style.setProperty(property, project(value));
  });

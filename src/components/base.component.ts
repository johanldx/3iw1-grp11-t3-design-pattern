/** Fonction de nettoyage enregistrée pendant le cycle de vie d'un composant. */
export type Cleanup = () => void;

const cloneShallow = <T extends object>(value: T): T => {
  if (Array.isArray(value)) {
    return [...value] as T;
  }

  return { ...value };
};

/**
 * Fournit la base commune des composants réutilisables avec cycle de vie.
 */
export abstract class Component<
  P extends object,
  S extends object = {},
> {
  protected props: P;
  protected state: S;

  private element: HTMLElement | null = null;
  private mounted = false;
  private readonly cleanups = new Set<Cleanup>();

  /**
   * Initialise un composant avec ses props et son état initial.
   *
   * @param props Props initiales du composant.
   * @param initialState État initial du composant.
   */
  constructor(props: P, initialState: S) {
    this.props = props;
    this.state = initialState;
  }

  /**
   * Monte le composant dans un conteneur DOM.
   *
   * @param container Élément parent qui recevra le composant.
   * @returns Élément HTML racine du composant.
   */
  mount(container: Element): HTMLElement {
    if (this.mounted && this.element) {
      return this.element;
    }

    this.element = this.render();
    container.appendChild(this.element);
    this.mounted = true;
    this.onMount();
    return this.element;
  }

  /**
   * Met à jour les props du composant et déclenche un rerender.
   *
   * @param nextProps Props partielles à fusionner avec les props courantes.
   */
  updateProps(nextProps: Partial<P>): void {
    const previousProps = cloneShallow(this.props);
    const previousState = cloneShallow(this.state);
    this.props = {
      ...this.props,
      ...nextProps,
    };
    this.rerender(previousProps, previousState);
  }

  /**
   * Détruit le composant, exécute son cycle de fin de vie et nettoie ses ressources.
   */
  destroy(): void {
    if (!this.mounted) {
      return;
    }

    this.onDestroy();

    for (const cleanup of this.cleanups) {
      cleanup();
    }

    this.cleanups.clear();
    this.element?.remove();
    this.element = null;
    this.mounted = false;
  }

  protected abstract render(): HTMLElement;

  protected onMount(): void {}

  protected onUpdate(_previousProps: Readonly<P>, _previousState: Readonly<S>): void {}

  protected onDestroy(): void {}

  protected setState(
    nextState:
      | Partial<S>
      | ((previousState: Readonly<S>) => Partial<S> | S),
  ): void {
    const previousProps = cloneShallow(this.props);
    const previousState = cloneShallow(this.state);
    const patch =
      typeof nextState === 'function' ? nextState(previousState) : nextState;

    this.state = {
      ...this.state,
      ...patch,
    };

    this.rerender(previousProps, previousState);
  }

  protected registerCleanup(cleanup: Cleanup): Cleanup {
    this.cleanups.add(cleanup);
    return cleanup;
  }

  protected emit<T>(eventName: string, detail: T): void {
    this.element?.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        detail,
      }),
    );
  }

  protected getElement(): HTMLElement | null {
    return this.element;
  }

  private rerender(previousProps: P, previousState: S): void {
    if (!this.mounted || !this.element) {
      return;
    }

    const parent = this.element.parentElement;
    const nextElement = this.render();

    if (parent) {
      parent.replaceChild(nextElement, this.element);
    }

    this.element = nextElement;
    this.onUpdate(previousProps, previousState);
  }
}

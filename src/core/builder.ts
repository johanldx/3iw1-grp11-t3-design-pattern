export type TagEventHandler = EventListenerOrEventListenerObject;

/**
 * Construit un élément DOM de manière fluide à partir d'une balise HTML donnée.
 */
export class TagBuilder<K extends keyof HTMLElementTagNameMap> {
  private readonly tag: K;
  private readonly classes = new Set<string>();
  private readonly styles = new Map<string, string>();
  private readonly events = new Map<string, TagEventHandler>();
  private readonly children: Node[] = [];
  private textContent: string | null = null;

  /**
   * Initialise un builder pour un type de balise précis.
   *
   * @param tag Type de balise HTML à produire.
   */
  constructor(tag: K) {
    this.tag = tag;
  }

  /**
   * Définit le texte de l'élément.
   *
   * @param text Texte à injecter dans l'élément.
   * @returns Le builder courant.
   */
  withText(text: string): this {
    this.textContent = text;
    return this;
  }

  /**
   * Ajoute une ou plusieurs classes CSS à l'élément.
   *
   * @param className Classe unique ou liste de classes séparées par des espaces.
   * @returns Le builder courant.
   */
  withClass(className: string): this {
    for (const token of className.split(/\s+/).filter(Boolean)) {
      this.classes.add(token);
    }

    return this;
  }

  /**
   * Définit une propriété de style CSS.
   *
   * @param property Nom de la propriété CSS.
   * @param value Valeur CSS à appliquer.
   * @returns Le builder courant.
   */
  withStyle(property: string, value: string): this {
    this.styles.set(property, value);
    return this;
  }

  /**
   * Associe un écouteur à un événement DOM.
   *
   * @param event Nom de l'événement.
   * @param handler Gestionnaire à exécuter.
   * @returns Le builder courant.
   */
  withEvent(event: string, handler: TagEventHandler): this {
    this.events.set(event, handler);
    return this;
  }

  /**
   * Ajoute un nœud enfant à l'élément en cours de construction.
   *
   * @param child Nœud enfant à insérer.
   * @returns Le builder courant.
   */
  withChild(child: Node): this {
    this.children.push(child);
    return this;
  }

  /**
   * Retire une ou plusieurs classes CSS de l'élément.
   *
   * @param className Classe unique ou liste de classes séparées par des espaces.
   * @returns Le builder courant.
   */
  withoutClass(className: string): this {
    for (const token of className.split(/\s+/).filter(Boolean)) {
      this.classes.delete(token);
    }

    return this;
  }

  /**
   * Retire l'écouteur associé à un événement donné.
   *
   * @param event Nom de l'événement à retirer.
   * @returns Le builder courant.
   */
  withoutEvent(event: string): this {
    this.events.delete(event);
    return this;
  }

  /**
   * Construit et retourne l'élément DOM final.
   *
   * @returns Élément HTML entièrement configuré.
   */
  build(): HTMLElementTagNameMap[K] {
    const element = document.createElement(this.tag);

    if (this.textContent !== null) {
      element.textContent = this.textContent;
    }

    if (this.classes.size > 0) {
      element.classList.add(...this.classes);
    }

    for (const [property, value] of this.styles) {
      element.style.setProperty(property, value);
    }

    for (const [event, handler] of this.events) {
      element.addEventListener(event, handler);
    }

    for (const child of this.children) {
      element.appendChild(child);
    }

    return element;
  }
}

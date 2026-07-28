import { TagBuilder, type TagEventHandler } from './builder.ts';

/**
 * Regroupe les options communes à tous les tags gérés par la factory.
 */
export interface BaseTagOptions {
  id?: string;
  text?: string;
  className?: string;
  classes?: string[];
  attributes?: Record<string, string>;
  styles?: Record<string, string>;
  events?: Record<string, TagEventHandler>;
  children?: Node[];
}

/**
 * Décrit les options propres à un bouton HTML.
 */
export interface ButtonTagOptions extends BaseTagOptions {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

/**
 * Décrit les options propres à une balise `div`.
 */
export interface DivTagOptions extends BaseTagOptions {}

/**
 * Décrit les options propres à une balise image.
 */
export interface ImageTagOptions extends BaseTagOptions {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * Décrit les options propres à une balise `hr`.
 */
export interface HorizontalRuleTagOptions extends BaseTagOptions {}

/**
 * Décrit les options propres à un champ `input`.
 */
export interface InputTagOptions extends BaseTagOptions {
  type?: HTMLInputElement['type'];
  name?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Décrit les options propres à un titre HTML.
 */
export interface HeadingTagOptions extends BaseTagOptions {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Décrit les options propres à une balise `span`.
 */
export interface SpanTagOptions extends BaseTagOptions {}

/**
 * Décrit les options propres à une balise `p`.
 */
export interface ParagraphTagOptions extends BaseTagOptions {}

/** Types logiques de tags gérés par la factory HTML. */
export type ElementType =
  | 'button'
  | 'div'
  | 'img'
  | 'hr'
  | 'input'
  | 'heading'
  | 'span'
  | 'p';

/**
 * Représente un objet capable de produire un élément HTML.
 */
export interface Tag<T extends HTMLElement = HTMLElement> {
  /**
   * Construit l'élément HTML final associé à l'instance.
   *
   * @returns Élément HTML configuré.
   */
  toHtml(): T;
}

interface TagOptionsMap {
  button: ButtonTagOptions | undefined;
  div: DivTagOptions | undefined;
  img: ImageTagOptions;
  hr: HorizontalRuleTagOptions | undefined;
  input: InputTagOptions | undefined;
  heading: HeadingTagOptions | undefined;
  span: SpanTagOptions | undefined;
  p: ParagraphTagOptions | undefined;
}

interface TagInstanceMap {
  button: ButtonTag;
  div: DivTag;
  img: ImageTag;
  hr: HorizontalRuleTag;
  input: InputTag;
  heading: HeadingTag;
  span: SpanTag;
  p: ParagraphTag;
}

const toCssPropertyName = (property: string): string =>
  property.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);

/**
 * Fournit l'implémentation commune aux tags concrets produits par la factory.
 */
abstract class BaseTag<T extends HTMLElement, O extends BaseTagOptions = BaseTagOptions>
  implements Tag<T>
{
  protected readonly options: O;

  /**
   * Initialise un tag concret à partir de ses options.
   *
   * @param options Options de construction du tag.
   */
  constructor(options: O) {
    this.options = options;
  }

  protected buildElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
  ): HTMLElementTagNameMap[K] {
    const builder = new TagBuilder(tagName);

    if (this.options.text) {
      builder.withText(this.options.text);
    }

    if (this.options.className) {
      builder.withClass(this.options.className);
    }

    for (const className of this.options.classes ?? []) {
      builder.withClass(className);
    }

    for (const [property, value] of Object.entries(this.options.styles ?? {})) {
      builder.withStyle(toCssPropertyName(property), value);
    }

    for (const [event, handler] of Object.entries(this.options.events ?? {})) {
      builder.withEvent(event, handler);
    }

    for (const child of this.options.children ?? []) {
      builder.withChild(child);
    }

    const element = builder.build();

    if (this.options.id) {
      element.id = this.options.id;
    }

    for (const [attribute, value] of Object.entries(this.options.attributes ?? {})) {
      element.setAttribute(attribute, value);
    }

    return element;
  }

  abstract toHtml(): T;
}

/**
 * Représente un bouton HTML construit par la factory.
 */
export class ButtonTag extends BaseTag<HTMLButtonElement, ButtonTagOptions> {
  /**
   * Initialise un tag bouton.
   *
   * @param options Options de construction du bouton.
   */
  constructor(options: ButtonTagOptions = {}) {
    super(options);
  }

  /**
   * Construit l'élément bouton correspondant.
   *
   * @returns Bouton HTML configuré.
   */
  toHtml(): HTMLButtonElement {
    const element = this.buildElement('button');
    element.type = this.options.type ?? 'button';
    element.disabled = this.options.disabled ?? false;
    return element;
  }
}

/**
 * Représente une balise `div` construite par la factory.
 */
export class DivTag extends BaseTag<HTMLDivElement, DivTagOptions> {
  /**
   * Initialise un tag `div`.
   *
   * @param options Options de construction de la division.
   */
  constructor(options: DivTagOptions = {}) {
    super(options);
  }

  /**
   * Construit l'élément `div` correspondant.
   *
   * @returns Division HTML configurée.
   */
  toHtml(): HTMLDivElement {
    return this.buildElement('div');
  }
}

/**
 * Représente une balise image construite par la factory.
 */
export class ImageTag extends BaseTag<HTMLImageElement, ImageTagOptions> {
  /**
   * Construit l'élément image correspondant.
   *
   * @returns Image HTML configurée.
   */
  toHtml(): HTMLImageElement {
    const element = this.buildElement('img');
    element.src = this.options.src;
    element.alt = this.options.alt ?? '';

    if (this.options.width !== undefined) {
      element.width = this.options.width;
    }

    if (this.options.height !== undefined) {
      element.height = this.options.height;
    }

    return element;
  }
}

/**
 * Représente une balise `hr` construite par la factory.
 */
export class HorizontalRuleTag extends BaseTag<HTMLHRElement, HorizontalRuleTagOptions> {
  /**
   * Initialise un tag `hr`.
   *
   * @param options Options de construction du séparateur.
   */
  constructor(options: HorizontalRuleTagOptions = {}) {
    super(options);
  }

  /**
   * Construit l'élément `hr` correspondant.
   *
   * @returns Séparateur HTML configuré.
   */
  toHtml(): HTMLHRElement {
    return this.buildElement('hr');
  }
}

/**
 * Représente un champ `input` construit par la factory.
 */
export class InputTag extends BaseTag<HTMLInputElement, InputTagOptions> {
  /**
   * Initialise un tag `input`.
   *
   * @param options Options de construction du champ.
   */
  constructor(options: InputTagOptions = {}) {
    super(options);
  }

  /**
   * Construit l'élément `input` correspondant.
   *
   * @returns Champ HTML configuré.
   */
  toHtml(): HTMLInputElement {
    const element = this.buildElement('input');
    element.type = this.options.type ?? 'text';
    element.disabled = this.options.disabled ?? false;

    if (this.options.name) {
      element.name = this.options.name;
    }

    if (this.options.value !== undefined) {
      element.value = this.options.value;
    }

    if (this.options.placeholder) {
      element.placeholder = this.options.placeholder;
    }

    return element;
  }
}

/**
 * Représente un titre HTML construit par la factory.
 */
export class HeadingTag extends BaseTag<HTMLHeadingElement, HeadingTagOptions> {
  /**
   * Initialise un tag de titre.
   *
   * @param options Options de construction du titre.
   */
  constructor(options: HeadingTagOptions = {}) {
    super(options);
  }

  /**
   * Construit le titre HTML correspondant.
   *
   * @returns Titre HTML configuré.
   */
  toHtml(): HTMLHeadingElement {
    const level = this.options.level ?? 2;
    return this.buildElement(`h${level}` as keyof HTMLElementTagNameMap) as HTMLHeadingElement;
  }
}

/**
 * Représente une balise `span` construite par la factory.
 */
export class SpanTag extends BaseTag<HTMLSpanElement, SpanTagOptions> {
  /**
   * Initialise un tag `span`.
   *
   * @param options Options de construction du `span`.
   */
  constructor(options: SpanTagOptions = {}) {
    super(options);
  }

  /**
   * Construit l'élément `span` correspondant.
   *
   * @returns Span HTML configuré.
   */
  toHtml(): HTMLSpanElement {
    return this.buildElement('span');
  }
}

/**
 * Représente une balise `p` construite par la factory.
 */
export class ParagraphTag extends BaseTag<HTMLParagraphElement, ParagraphTagOptions> {
  /**
   * Initialise un tag paragraphe.
   *
   * @param options Options de construction du paragraphe.
   */
  constructor(options: ParagraphTagOptions = {}) {
    super(options);
  }

  /**
   * Construit l'élément `p` correspondant.
   *
   * @returns Paragraphe HTML configuré.
   */
  toHtml(): HTMLParagraphElement {
    return this.buildElement('p');
  }
}

type TagConstructorMap = {
  [K in ElementType]: new (options: TagOptionsMap[K]) => TagInstanceMap[K];
};

const tagRegistry: TagConstructorMap = {
  button: ButtonTag,
  div: DivTag,
  img: ImageTag,
  hr: HorizontalRuleTag,
  input: InputTag,
  heading: HeadingTag,
  span: SpanTag,
  p: ParagraphTag,
};

/**
 * Fabrique typée qui instancie les wrappers de tags et produit le HTML final.
 */
export class TagFactory {
  /**
   * Instancie le tag correspondant au type demandé.
   *
   * @param type Type logique de l'élément à créer.
   * @param options Options de construction du tag.
   * @returns Instance concrète du tag demandé.
   */
  static create<K extends ElementType>(
    type: K,
    options: TagOptionsMap[K],
  ): TagInstanceMap[K] {
    const TagConstructor = tagRegistry[type];
    return new TagConstructor(options);
  }

  /**
   * Construit directement l'élément HTML final pour un type donné.
   *
   * @param type Type logique de l'élément à créer.
   * @param options Options de construction du tag.
   * @returns Élément HTML configuré.
   */
  static toHtml<K extends ElementType>(
    type: K,
    options: TagOptionsMap[K],
  ): ReturnType<TagInstanceMap[K]['toHtml']> {
    return this.create(type, options).toHtml() as ReturnType<TagInstanceMap[K]['toHtml']>;
  }
}

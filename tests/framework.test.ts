import { describe, expect, it, vi } from 'vitest';
import { TagBuilder } from '../src/core/builder.ts';
import { TagFactory } from '../src/core/factory.ts';
import { Observable } from '../src/core/observer.ts';
import { bindStyle, bindText } from '../src/core/reactivity.ts';
import { Component } from '../src/components/base.component.ts';
import { CardComponent } from '../src/components/card.component.ts';

describe('framework DOM', () => {
  it('construit un élément fluide et retire classes et événements', () => {
    const click = vi.fn();
    const child = document.createElement('span');
    const element = new TagBuilder('button')
      .withText('Ajouter').withClass('primary removed').withoutClass('removed')
      .withStyle('color', 'red').withEvent('click', click)
      .withoutEvent('click').withChild(child).build();
    element.click();
    expect(element.textContent).toContain('Ajouter');
    expect(element.className).toBe('primary');
    expect(element.style.color).toBe('red');
    expect(element.lastChild).toBe(child);
    expect(click).not.toHaveBeenCalled();
  });

  it('crée les tags demandés avec leurs options', () => {
    const button = TagFactory.toHtml('button', { text: 'OK', type: 'submit', className: 'action' });
    const image = TagFactory.toHtml('img', { src: '/icon.png', alt: 'Icône', width: 24 });
    expect(button).toBeInstanceOf(HTMLButtonElement);
    expect(button.type).toBe('submit');
    expect(button.classList.contains('action')).toBe(true);
    expect(image.alt).toBe('Icône');
    expect(image.width).toBe(24);
  });

  it('instancie aussi les tags via TagFactory.create', () => {
    const tag = TagFactory.create('span', { text: 'Hello' });

    expect(tag.toHtml().textContent).toBe('Hello');
  });

  it('notifie puis désabonne les observateurs', () => {
    const values: number[] = [];
    const observable = new Observable(1);
    const unsubscribe = observable.subscribe((value) => values.push(value));
    observable.next(2);
    unsubscribe();
    observable.next(3);
    expect(values).toEqual([1, 2]);
    expect(observable.getValue()).toBe(3);
  });

  it('exécute le cycle de vie d’un composant', () => {
    class TestComponent extends Component<{ label: string }> {
      mountCount = 0;
      updateCount = 0;
      destroyCount = 0;
      constructor() { super({ label: 'avant' }, {}); }
      protected render(): HTMLElement {
        const element = document.createElement('p');
        element.textContent = this.props.label;
        return element;
      }
      protected onMount(): void { this.mountCount += 1; }
      protected onUpdate(): void { this.updateCount += 1; }
      protected onDestroy(): void { this.destroyCount += 1; }
    }
    const host = document.createElement('div');
    const component = new TestComponent();
    component.mount(host);
    component.updateProps({ label: 'après' });
    expect(host.textContent).toBe('après');
    expect([component.mountCount, component.updateCount]).toEqual([1, 1]);
    component.destroy();
    expect(component.destroyCount).toBe(1);
    expect(host.childElementCount).toBe(0);
  });

  it('compose une carte grâce à ses slots nommés', () => {
    const host = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = 'Titre';
    const action = document.createElement('button');
    action.textContent = 'Action';
    new CardComponent({ slots: { header: title, body: document.createTextNode('Corps'), actions: action } }).mount(host);
    expect(host.querySelector('.card-slot-header')?.textContent).toBe('Titre');
    expect(host.querySelector('.card-slot-body')?.textContent).toBe('Corps');
    expect(host.querySelector('.card-slot-actions button')).toBe(action);
  });

  it('lie le texte et le style au DOM via la réactivité observable', () => {
    const observable = new Observable(1);
    const text = document.createTextNode('');
    const element = document.createElement('p');

    const unsubscribeText = bindText(observable, text, (value) => `Valeur ${value}`);
    const unsubscribeStyle = bindStyle(observable, element, 'color', (value) =>
      value > 1 ? 'green' : 'black',
    );

    observable.next(2);

    expect(text.textContent).toBe('Valeur 2');
    expect(element.style.color).toBe('green');

    unsubscribeText();
    unsubscribeStyle();
  });
});

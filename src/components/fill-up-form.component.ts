import type { FillUpFormState, FillUpPayload } from '../core/singleton.ts';
import { MinStrategy, NumericStrategy, PatternStrategy, RequiredStrategy, validateWith, type ValidationStrategy } from '../core/validation.ts';
import { FuelPriceService } from '../http/fuel-price.service.ts';

export interface FillUpFormOptions {
  initial: FillUpFormState;
  minimumOdometer?: number;
  submitLabel: string;
  onDraftChange: (draft: FillUpFormState) => void;
  onSubmit: (payload: FillUpPayload) => void | Promise<void>;
  onCancel?: () => void;
  fuelPriceService?: FuelPriceService;
}

type FieldName = keyof FillUpFormState;
const fields: ReadonlyArray<{ name: FieldName; label: string; type: string; placeholder: string }> = [
  { name: 'date', label: 'Date du plein', type: 'date', placeholder: '' },
  { name: 'odometer', label: 'Kilométrage compteur', type: 'number', placeholder: '12500' },
  { name: 'liters', label: 'Litres ajoutés', type: 'number', placeholder: '12.5' },
  { name: 'pricePerLiter', label: 'Prix par litre (€)', type: 'number', placeholder: '1.89' },
  { name: 'comment', label: 'Commentaire (optionnel)', type: 'text', placeholder: 'Trajet, station…' },
];

const rulesFor = (name: FieldName, minimumOdometer: number): readonly ValidationStrategy[] => {
  if (name === 'comment') return [];
  if (name === 'date') return [new RequiredStrategy(), new PatternStrategy(/^\d{4}-\d{2}-\d{2}$/, 'Choisissez une date valide.')];
  const minimum = name === 'odometer' ? minimumOdometer : 0.01;
  return [new RequiredStrategy(), new NumericStrategy(), new MinStrategy(minimum, name === 'odometer'
    ? `Le kilométrage doit être au moins ${minimum} km.`
    : 'La valeur doit être supérieure à zéro.')];
};

/** Construit un formulaire métier complet avec validation immédiate. */
export const createFillUpForm = (options: FillUpFormOptions): HTMLFormElement => {
  const draft: FillUpFormState = { ...options.initial };
  const form = document.createElement('form');
  form.style.cssText = 'display:grid;gap:1rem;max-width:680px';
  const controls = new Map<FieldName, { input: HTMLInputElement; error: HTMLSpanElement }>();
  const validateField = (name: FieldName): boolean => {
    const control = controls.get(name);
    if (!control) return true;
    const result = validateWith(draft[name], rulesFor(name, options.minimumOdometer ?? 0));
    control.error.textContent = result.message;
    control.input.setAttribute('aria-invalid', String(!result.valid));
    control.input.style.borderColor = result.valid ? '#cbd5e1' : '#e11d48';
    return result.valid;
  };
  for (const field of fields) {
    const label = document.createElement('label');
    label.style.cssText = 'display:grid;gap:.4rem;color:#0f172a;font-weight:700';
    label.append(field.label);
    const input = document.createElement('input');
    input.name = field.name;
    input.type = field.type;
    input.value = draft[field.name];
    input.placeholder = field.placeholder;
    if (field.type === 'number') input.step = 'any';
    input.style.cssText = 'padding:.8rem;border:1px solid #cbd5e1;border-radius:.75rem;font:inherit';
    const error = document.createElement('span');
    error.style.cssText = 'min-height:1.2em;color:#be123c;font-size:.85rem;font-weight:500';
    input.addEventListener('input', () => {
      draft[field.name] = input.value;
      options.onDraftChange({ ...draft });
      validateField(field.name);
    });
    input.addEventListener('blur', () => validateField(field.name));
    controls.set(field.name, { input, error });
    label.append(input, error);
    form.append(label);
  }

  if (options.fuelPriceService) {
    const lookup = document.createElement('section');
    lookup.style.cssText = 'display:grid;gap:.65rem;padding:1rem;border:1px solid #bae6fd;border-radius:.8rem;background:#f0f9ff';
    const title = document.createElement('strong');
    title.textContent = 'Prix des carburants autour de vous';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:.5rem;flex-wrap:wrap';
    const postalCode = document.createElement('input');
    postalCode.placeholder = 'Code postal';
    postalCode.inputMode = 'numeric';
    postalCode.maxLength = 5;
    postalCode.setAttribute('aria-label', 'Code postal');
    postalCode.style.cssText = 'padding:.7rem;border:1px solid #94a3b8;border-radius:.65rem';
    const fuel = document.createElement('select');
    fuel.setAttribute('aria-label', 'Type de carburant');
    for (const name of ['Gazole', 'SP95', 'E10', 'SP98', 'E85', 'GPLc']) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      fuel.append(option);
    }
    const search = document.createElement('button');
    search.type = 'button';
    search.textContent = 'Rechercher';
    search.style.cssText = 'padding:.7rem 1rem;border:0;border-radius:.65rem;background:#0369a1;color:white;font-weight:700;cursor:pointer';
    const feedback = document.createElement('p');
    feedback.style.cssText = 'margin:0;color:#334155';
    const results = document.createElement('div');
    results.style.cssText = 'display:grid;gap:.5rem';
    search.addEventListener('click', async () => {
      if (!/^\d{5}$/.test(postalCode.value)) {
        feedback.textContent = 'Saisissez un code postal à 5 chiffres.';
        return;
      }
      search.disabled = true;
      feedback.textContent = 'Recherche en cours…';
      results.replaceChildren();
      try {
        const prices = await options.fuelPriceService?.search(postalCode.value, fuel.value) ?? [];
        feedback.textContent = prices.length ? `${prices.length} station(s) trouvée(s).` : 'Aucun prix trouvé.';
        for (const price of prices) {
          if (price.price === null) continue;
          const choose = document.createElement('button');
          choose.type = 'button';
          choose.textContent = `${price.price.toFixed(3)} €/L — ${price.address}, ${price.city}`;
          choose.style.cssText = 'padding:.65rem;text-align:left;border:1px solid #bae6fd;border-radius:.6rem;background:white;cursor:pointer';
          choose.addEventListener('click', () => {
            draft.pricePerLiter = String(price.price);
            const priceControl = controls.get('pricePerLiter');
            if (priceControl) priceControl.input.value = draft.pricePerLiter;
            options.onDraftChange({ ...draft });
            validateField('pricePerLiter');
            feedback.textContent = `Prix de ${price.price?.toFixed(3)} €/L sélectionné.`;
          });
          results.append(choose);
        }
      } catch (error) {
        feedback.textContent = error instanceof Error ? `Recherche impossible : ${error.message}` : 'Recherche impossible.';
      } finally {
        search.disabled = false;
      }
    });
    row.append(postalCode, fuel, search);
    lookup.append(title, row, feedback, results);
    form.prepend(lookup);
  }
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:.75rem;flex-wrap:wrap';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = options.submitLabel;
  submit.style.cssText = 'padding:.8rem 1rem;border:0;border-radius:.8rem;background:#0f766e;color:white;font-weight:700;cursor:pointer';
  actions.append(submit);
  if (options.onCancel) {
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = 'Annuler';
    cancel.style.cssText = 'padding:.8rem 1rem;border:1px solid #cbd5e1;border-radius:.8rem;background:white;font-weight:700;cursor:pointer';
    cancel.addEventListener('click', options.onCancel);
    actions.append(cancel);
  }
  form.append(actions);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!fields.every((field) => validateField(field.name))) return;
    void options.onSubmit({
      date: draft.date,
      odometer: Number(draft.odometer),
      liters: Number(draft.liters),
      pricePerLiter: Number(draft.pricePerLiter),
      comment: draft.comment.trim(),
    });
  });
  return form;
};

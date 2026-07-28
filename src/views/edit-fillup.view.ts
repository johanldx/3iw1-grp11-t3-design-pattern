import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import { createFillUpForm } from '../components/fill-up-form.component.ts';
import type { FillUp, FillUpFormState, FillUpPayload } from '../core/singleton.ts';

export interface EditFillUpViewHandlers {
  onDraftChange: (draft: FillUpFormState) => void;
  onUpdate: (payload: FillUpPayload) => void | Promise<void>;
  onBack: () => void;
}

/** Construit la vue d'édition préremplie. */
export const createEditFillUpView = (fillUp: FillUp, handlers: EditFillUpViewHandlers): HTMLElement =>
  new TagBuilder('section')
    .withStyle('display', 'grid').withStyle('gap', '1rem')
    .withChild(TagFactory.toHtml('heading', { level: 2, text: `Édition de ${fillUp.comment || 'ce plein'}`, styles: { margin: '0', color: '#0f172a', fontSize: '1.6rem' } }))
    .withChild(createFillUpForm({
      initial: { date: fillUp.date, odometer: String(fillUp.odometer), liters: String(fillUp.liters), pricePerLiter: String(fillUp.pricePerLiter), comment: fillUp.comment },
      submitLabel: 'Mettre à jour',
      onDraftChange: handlers.onDraftChange,
      onSubmit: handlers.onUpdate,
      onCancel: handlers.onBack,
    }))
    .build();

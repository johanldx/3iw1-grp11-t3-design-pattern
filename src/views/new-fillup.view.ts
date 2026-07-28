import { TagBuilder } from '../core/builder.ts';
import { TagFactory } from '../core/factory.ts';
import { createFillUpForm, type FillUpDraftSource } from '../components/fill-up-form.component.ts';
import type { FillUpFormState, FillUpPayload } from '../core/singleton.ts';
import { FuelPriceService } from '../http/fuel-price.service.ts';

/** Construit la vue de création d'un plein. */
export const createNewFillUpView = (
  draft: FillUpFormState,
  minimumOdometer: number,
  draftSource: FillUpDraftSource,
  onDraftChange: (draft: FillUpFormState) => void,
  onCreate: (payload: FillUpPayload) => void | Promise<void>,
): HTMLElement =>
  new TagBuilder('section')
    .withStyle('display', 'grid').withStyle('gap', '1rem')
    .withChild(TagFactory.toHtml('heading', { level: 2, text: 'Nouveau plein', styles: { margin: '0', color: '#0f172a', fontSize: '1.6rem' } }))
    .withChild(TagFactory.toHtml('p', { text: 'Enregistrez un plein. Les champs sont validés en temps réel.', styles: { margin: '0', color: '#475569' } }))
    .withChild(createFillUpForm({
      initial: draft,
      minimumOdometer,
      submitLabel: 'Enregistrer le plein',
      draftSource,
      onDraftChange,
      onSubmit: onCreate,
      fuelPriceService: new FuelPriceService(),
    }))
    .build();

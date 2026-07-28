import { describe, expect, it } from 'vitest';
import { MinStrategy, NumericStrategy, PatternStrategy, RequiredStrategy, validateWith } from '../src/core/validation.ts';

describe('validation strategies', () => {
  it('valide les champs requis', () => {
    expect(new RequiredStrategy().validate('')).toMatchObject({ valid: false });
    expect(new RequiredStrategy().validate('ok')).toMatchObject({ valid: true });
  });

  it('valide les nombres et minimums', () => {
    expect(new NumericStrategy().validate('12.5').valid).toBe(true);
    expect(new NumericStrategy().validate('abc').valid).toBe(false);
    expect(new MinStrategy(10).validate('9').valid).toBe(false);
  });

  it('valide les motifs et compose les règles', () => {
    const rules = [new RequiredStrategy(), new PatternStrategy(/^\d{5}$/, 'Code invalide')];
    expect(validateWith('75001', rules).valid).toBe(true);
    expect(validateWith('75', rules)).toEqual({ valid: false, message: 'Code invalide' });
  });
});

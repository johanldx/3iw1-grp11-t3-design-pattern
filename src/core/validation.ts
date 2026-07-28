/** Résultat normalisé d'une règle de validation. */
export interface ValidationResult {
  valid: boolean;
  message: string;
}

/** Contrat commun des règles de validation de formulaire. */
export interface ValidationStrategy {
  validate(value: string): ValidationResult;
}

const valid = (): ValidationResult => ({ valid: true, message: '' });
const invalid = (message: string): ValidationResult => ({ valid: false, message });

/** Refuse une valeur vide. */
export class RequiredStrategy implements ValidationStrategy {
  private readonly message: string;
  constructor(message = 'Ce champ est obligatoire.') {
    this.message = message;
  }
  validate(value: string): ValidationResult {
    return value.trim() ? valid() : invalid(this.message);
  }
}

/** Vérifie qu'une valeur est un nombre fini. */
export class NumericStrategy implements ValidationStrategy {
  validate(value: string): ValidationResult {
    return value.trim() !== '' && Number.isFinite(Number(value))
      ? valid()
      : invalid('Saisissez un nombre valide.');
  }
}

/** Impose une valeur numérique minimale. */
export class MinStrategy implements ValidationStrategy {
  private readonly minimum: number;
  private readonly message?: string;
  constructor(minimum: number, message?: string) {
    this.minimum = minimum;
    this.message = message;
  }
  validate(value: string): ValidationResult {
    return Number(value) >= this.minimum
      ? valid()
      : invalid(this.message ?? `La valeur minimale est ${this.minimum}.`);
  }
}

/** Vérifie une valeur à l'aide d'une expression régulière. */
export class PatternStrategy implements ValidationStrategy {
  private readonly pattern: RegExp;
  private readonly message: string;
  constructor(pattern: RegExp, message: string) {
    this.pattern = pattern;
    this.message = message;
  }
  validate(value: string): ValidationResult {
    return this.pattern.test(value) ? valid() : invalid(this.message);
  }
}

/** Exécute plusieurs stratégies et retourne le premier échec. */
export const validateWith = (
  value: string,
  strategies: readonly ValidationStrategy[],
): ValidationResult => {
  for (const strategy of strategies) {
    const result = strategy.validate(value);
    if (!result.valid) return result;
  }
  return valid();
};

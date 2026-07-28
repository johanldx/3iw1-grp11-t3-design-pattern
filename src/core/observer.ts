/** Signature d'une fonction abonnée à un observable typé. */
export type ObserverCallback<T> = (value: T) => void;

/** Fonction retournée pour retirer un abonnement. */
export type Unsubscribe = () => void;

/**
 * Représente une source d'événements typée pouvant notifier plusieurs abonnés.
 */
export class Observable<T> {
  private readonly subscribers = new Set<ObserverCallback<T>>();
  private currentValue: T | undefined;

  /**
   * Initialise l'observable avec une valeur initiale facultative.
   *
   * @param initialValue Valeur immédiatement disponible pour les nouveaux abonnés.
   */
  constructor(initialValue?: T) {
    this.currentValue = initialValue;
  }

  /**
   * Abonne une fonction à chaque nouvelle valeur propagée.
   *
   * @param callback Fonction appelée lors de chaque émission.
   * @returns Fonction permettant de se désabonner.
   */
  subscribe(callback: ObserverCallback<T>): Unsubscribe {
    this.subscribers.add(callback);

    if (this.currentValue !== undefined) {
      callback(this.currentValue);
    }

    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Propage une nouvelle valeur à tous les abonnés.
   *
   * @param value Valeur à diffuser.
   */
  next(value: T): void {
    this.currentValue = value;

    for (const subscriber of this.subscribers) {
      subscriber(value);
    }
  }

  /**
   * Retourne la dernière valeur connue de l'observable.
   *
   * @returns Dernière valeur propagée ou `undefined`.
   */
  getValue(): T | undefined {
    return this.currentValue;
  }
}

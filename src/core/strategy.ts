export type StorageStrategyName = 'volatile' | 'localStorage' | 'indexedDb';

/**
 * Définit le contrat commun des stratégies de stockage.
 */
export interface StorageStrategy {
  /**
   * Lit une valeur depuis une clé de stockage.
   *
   * @param key Clé à lire.
   * @returns Valeur lue ou `null` si elle n'existe pas.
   */
  get<T>(key: string): Promise<T | null>;
  /**
   * Écrit une valeur pour une clé donnée.
   *
   * @param key Clé de destination.
   * @param value Valeur à enregistrer.
   * @returns Promesse résolue une fois l'écriture terminée.
   */
  set<T>(key: string, value: T): Promise<void>;
  /**
   * Supprime une clé du stockage.
   *
   * @param key Clé à supprimer.
   * @returns Promesse résolue une fois la suppression terminée.
   */
  remove(key: string): Promise<void>;
  /**
   * Vide intégralement le stockage.
   *
   * @returns Promesse résolue une fois le stockage vidé.
   */
  clear(): Promise<void>;
}

/**
 * PORT — stockage de scalaires au niveau du MONDE (graine & horodatage boutique).
 * Implémenté par des scoreboards à participant fixe.
 */
export interface WorldStore {
  getNumber(key: string): number | undefined;
  setNumber(key: string, value: number): void;
}

import type { ValueTransformer } from 'typeorm';

/**
 * Convertit une colonne `BIGINT` PostgreSQL en `bigint` JavaScript.
 *
 * Sans ce transformateur, le pilote `pg` renvoie une chaine et TypeORM la
 * laisse telle quelle : une addition produirait alors une concatenation. C'est
 * le genre de defaut qui ne se voit qu'en production, sur un solde.
 */
export const bigintTransformer: ValueTransformer = {
  to: (value: bigint | null | undefined): string | null =>
    value === null || value === undefined ? null : value.toString(),

  from: (value: string | null): bigint | null => (value === null ? null : BigInt(value)),
};

/** Variante non nullable, pour les colonnes de montant obligatoires. */
export const requiredBigintTransformer: ValueTransformer = {
  to: (value: bigint): string => value.toString(),
  from: (value: string): bigint => BigInt(value),
};

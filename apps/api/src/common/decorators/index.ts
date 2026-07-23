import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common';

/**
 * Decorateurs transverses.
 *
 * Les decorateurs propres a un domaine (roles, niveau de verification…) sont
 * declares dans le module concerne, pas ici.
 */

/** Rend une route accessible sans authentification. */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Injecte l'identifiant de correlation de la requete. */
export const RequestId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<{ headers: Record<string, string> }>();
  return request.headers['x-request-id'];
});

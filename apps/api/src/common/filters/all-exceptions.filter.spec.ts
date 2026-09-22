import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { BusinessException } from '../exceptions/business.exception';

/**
 * Le champ `code` est un contrat : le front y branche ses messages traduits.
 * Un statut mal etiquete se traduit directement par un mauvais message affiche
 * a l'utilisateur, sans qu'aucun test ne s'en apercoive — d'ou ces cas.
 */
describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();
  let payload: Record<string, unknown>;
  let statusCode: number;

  const host = {
    switchToHttp: () => ({
      getResponse: () => ({
        status: (code: number) => {
          statusCode = code;
          return { json: (body: Record<string, unknown>) => (payload = body) };
        },
      }),
      getRequest: () => ({ url: '/api/v1/users', headers: { 'x-request-id': 'req-1' } }),
    }),
  } as unknown as ArgumentsHost;

  const capture = (exception: unknown) => {
    filter.catch(exception, host);
    return { status: statusCode, ...payload } as { status: number; code: string; message: string };
  };

  it('etiquette un conflit comme DUPLICATE_RESOURCE et non INTERNAL_ERROR', () => {
    const result = capture(new ConflictException('Email ou telephone deja utilise.'));

    expect(result.status).toBe(HttpStatus.CONFLICT);
    // La regression corrigee : 409 renvoyait `INTERNAL_ERROR`.
    expect(result.code).toBe('DUPLICATE_RESOURCE');
    expect(result.code).not.toBe('INTERNAL_ERROR');
  });

  it.each([
    [new BadRequestException('x'), HttpStatus.BAD_REQUEST, 'VALIDATION_FAILED'],
    [new UnauthorizedException('x'), HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED'],
    [new ForbiddenException('x'), HttpStatus.FORBIDDEN, 'FORBIDDEN'],
    [new NotFoundException('x'), HttpStatus.NOT_FOUND, 'RESOURCE_NOT_FOUND'],
  ])('associe le statut %# au code attendu', (exception, expectedStatus, expectedCode) => {
    const result = capture(exception);

    expect(result.status).toBe(expectedStatus);
    expect(result.code).toBe(expectedCode);
  });

  it('derive un code parlant pour un statut client absent de la table', () => {
    const result = capture(new HttpException('Compte verrouille', HttpStatus.UNPROCESSABLE_ENTITY));

    // Aucune erreur client ne doit plus etre presentee comme une panne serveur.
    expect(result.code).toBe('UNPROCESSABLE_ENTITY');
    expect(result.code).not.toBe('INTERNAL_ERROR');
  });

  it('conserve le code metier porte par une BusinessException', () => {
    const result = capture(
      new BusinessException('INSUFFICIENT_FUNDS', 'Solde insuffisant.', HttpStatus.CONFLICT),
    );

    // Un code metier explicite prime sur la deduction depuis le statut.
    expect(result.code).toBe('INSUFFICIENT_FUNDS');
  });

  it('reste sur INTERNAL_ERROR pour une erreur reellement serveur', () => {
    const result = capture(new Error('boom'));

    expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(result.code).toBe('INTERNAL_ERROR');
    // Le message d'origine ne doit pas fuir vers le client.
    expect(result.message).not.toContain('boom');
  });

  it('traduit une violation de contrainte unique sans exposer le SQL', () => {
    const error = new QueryFailedError('INSERT ...', [], new Error('duplicate key'));
    (error as unknown as { driverError: { code: string } }).driverError = { code: '23505' };

    const result = capture(error);

    expect(result.status).toBe(HttpStatus.CONFLICT);
    // Meme code que le conflit leve par le service : le client n'a qu'un cas a
    // traiter.
    expect(result.code).toBe('DUPLICATE_RESOURCE');
    expect(result.message).not.toContain('INSERT');
  });
});

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { BusinessException } from '../exceptions/business.exception';

interface NormalizedError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Filtre global. Garantit qu'aucune exception ne fuit vers le client sous une
 * forme non maitrisee : ni trace d'appel, ni message de la base de donnees.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) ?? 'unknown';

    const normalized = this.normalize(exception);

    // Les erreurs serveur sont journalisees avec leur trace ; les erreurs
    // client ne le sont qu'en debug, pour ne pas noyer les journaux.
    if (normalized.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { requestId, path: request.url, code: normalized.code },
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.debug({ requestId, path: request.url, code: normalized.code });
    }

    response.status(normalized.status).json({
      statusCode: normalized.status,
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof BusinessException) {
      const body = exception.getResponse() as {
        code: string;
        message: string;
        details?: Record<string, unknown>;
      };
      return {
        status: exception.getStatus(),
        code: body.code,
        message: body.message,
        details: body.details,
      };
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const status = exception.getStatus();

      // Erreurs de validation produites par le ValidationPipe.
      if (typeof body === 'object' && body !== null && 'message' in body) {
        const raw = (body as { message: string | string[] }).message;
        if (Array.isArray(raw)) {
          return {
            status,
            code: 'VALIDATION_FAILED',
            message: 'Les donnees fournies sont invalides.',
            details: { errors: raw },
          };
        }
        return { status, code: this.codeFromStatus(status), message: raw };
      }

      return { status, code: this.codeFromStatus(status), message: exception.message };
    }

    // Une erreur SQL ne doit jamais atteindre le client : son message peut
    // reveler le schema, des noms de colonnes ou des valeurs.
    if (exception instanceof QueryFailedError) {
      const driverError = exception.driverError as { code?: string } | undefined;
      if (driverError?.code === '23505') {
        return {
          status: HttpStatus.CONFLICT,
          code: 'DUPLICATE_RESOURCE',
          message: 'Cette ressource existe deja.',
        };
      }
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_ERROR',
        message: 'Une erreur technique est survenue.',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Une erreur technique est survenue.',
    };
  }

  /**
   * Code metier stable associe a un statut HTTP.
   *
   * La table ne couvre que les cas ou l'on veut un libelle choisi. Pour tout
   * autre statut client, le code est derive du statut lui-meme (`CONFLICT`,
   * `UNPROCESSABLE_ENTITY`, `LOCKED`...).
   *
   * C'est ce repli qui manquait : un statut absent de la table — 409 en
   * particulier — etait etiquete `INTERNAL_ERROR`. Le client concluait a une
   * panne serveur alors que sa requete etait simplement refusee, et le front,
   * qui branche ses messages sur `code`, affichait « erreur technique » au lieu
   * de « adresse deja utilisee ».
   */
  private codeFromStatus(status: number): string {
    const explicit: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'VALIDATION_FAILED',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'RESOURCE_NOT_FOUND',
      // Meme code que la violation de contrainte d'unicite detectee plus haut :
      // le client n'a pas a savoir si le doublon a ete vu par le service ou par
      // la base.
      [HttpStatus.CONFLICT]: 'DUPLICATE_RESOURCE',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
    };

    const known = explicit[status];
    if (known) return known;

    if (status >= 400 && status < 500) {
      // `HttpStatus` est une enumeration numerique : la lecture inverse donne
      // le libelle du statut.
      return (HttpStatus[status] as string | undefined) ?? 'CLIENT_ERROR';
    }

    return 'INTERNAL_ERROR';
  }
}

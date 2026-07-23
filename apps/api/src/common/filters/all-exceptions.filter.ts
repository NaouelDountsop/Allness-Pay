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

  private codeFromStatus(status: number): string {
    const map: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'VALIDATION_FAILED',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'RESOURCE_NOT_FOUND',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
    };
    return map[status] ?? 'INTERNAL_ERROR';
  }
}

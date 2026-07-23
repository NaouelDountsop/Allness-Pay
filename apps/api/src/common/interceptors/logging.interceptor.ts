import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';

/** Champs a ne jamais faire apparaitre dans un journal, a aucun niveau. */
const REDACTED_FIELDS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'pin',
  'confirmPin',
  'otp',
  'code',
  'accessToken',
  'refreshToken',
  'apiKey',
  'clientSecret',
  'authorization',
]);

/** Remplace recursivement la valeur des champs sensibles. */
export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [
        key,
        REDACTED_FIELDS.has(key) ? '[masque]' : redact(val),
      ]),
    );
  }
  return value;
}

/**
 * Journalisation des acces : duree, issue et auteur de chaque requete —
 * sans jamais recopier un secret depuis le corps de la requete.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const requestId = request.headers['x-request-id'] as string;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log({
            requestId,
            method,
            url,
            durationMs: Date.now() - startedAt,
            outcome: 'success',
          });
        },
        error: (error: Error) => {
          this.logger.warn({
            requestId,
            method,
            url,
            durationMs: Date.now() - startedAt,
            outcome: 'error',
            error: error.name,
          });
        },
      }),
    );
  }
}

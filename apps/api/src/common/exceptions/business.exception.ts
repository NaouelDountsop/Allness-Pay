import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception metier de base.
 *
 * Toute erreur previsible du domaine doit en heriter, afin que le client
 * recoive un code stable et exploitable plutot qu'un message libre.
 *
 * Les codes propres a chaque module sont declares dans le module concerne.
 */
export class BusinessException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details?: Record<string, unknown>,
  ) {
    super({ code, message, details }, status);
  }
}

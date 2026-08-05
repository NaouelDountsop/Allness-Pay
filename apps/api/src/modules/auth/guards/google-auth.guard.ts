import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(_context: ExecutionContext) {
    return {
      prompt: 'select_account',
      scope: ['email', 'profile'],
      accessType: 'offline',
    };
  }
}

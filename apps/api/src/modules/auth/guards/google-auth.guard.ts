import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';

type GoogleAuthenticateOptions = IAuthModuleOptions & {
  prompt?: 'select_account' | 'consent' | 'none';
  scope?: string[];
  accessType?: 'online' | 'offline';
};

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(_context: ExecutionContext): GoogleAuthenticateOptions {
    return {
      prompt: 'select_account',
      scope: ['email', 'profile'],
      accessType: 'offline',
    };
  }
}

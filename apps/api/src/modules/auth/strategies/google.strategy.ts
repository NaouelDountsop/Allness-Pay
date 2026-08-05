import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { id, emails, displayName, photos } = profile;
    const email = emails?.[0]?.value;

    this.logger.debug(`Google OAuth — id: ${id}, email: ${email}, name: ${displayName}`);

    if (!email) {
      return done(new Error('Aucun email trouvé dans le profil Google'), undefined);
    }

    const user = {
      googleId: id,
      email,
      firstName: displayName.split(' ')[0] || '',
      lastName: displayName.split(' ').slice(1).join(' ') || '',
      avatar: photos?.[0]?.value || null,
    };

    return done(null, user);
  }
}

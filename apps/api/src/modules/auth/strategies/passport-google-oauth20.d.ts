declare module 'passport-google-oauth20' {
  import { Strategy } from 'passport';

  export type VerifyCallback = (
    err: Error | null,
    user?: Express.User | false,
    info?: object,
  ) => void;

  export interface Profile {
    id: string;
    displayName: string;
    emails?: Array<{ value: string; verified?: boolean }>;
    photos?: Array<{ value: string }>;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback?: boolean;
  }

  export class Strategy extends Strategy {
    constructor(
      options: StrategyOptions,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
      ) => void,
    );
  }
}

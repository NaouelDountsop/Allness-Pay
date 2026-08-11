import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'required_permissions';

// Usage: @RequirePermissions('kyc:validate')
// Plusieurs permissions = toutes requises (ET logique), pas OU.
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

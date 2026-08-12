import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../role.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

// À utiliser APRÈS un guard d'authentification (JwtAuthGuard) dans la chaîne
// @UseGuards, puisqu'il dépend de req.user.id déjà renseigné.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Pas de @RequirePermissions() sur la route -> route publique du point de
    // vue RBAC (l'authentification, elle, reste gérée par JwtAuthGuard).
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // req.user.id ici doit provenir du JWT d'un administrateur (id numérique),
    // pas d'un client — donc d'un flow d'authentification back-office distinct.
    const adminId: number | undefined = request.user?.id;
    if (adminId === undefined || adminId === null) {
      throw new ForbiddenException('Administrateur non authentifié');
    }

    const hasAccess = await this.rolesService.adminHasAllPermissions(adminId, requiredPermissions);
    if (!hasAccess) {
      throw new ForbiddenException('Permissions insuffisantes pour cette action');
    }

    return true;
  }
}

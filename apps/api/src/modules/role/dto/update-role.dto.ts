import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

// Le nom d'un rôle n'est volontairement pas modifiable après création pour
// éviter de casser des références externes (ex: un rôle 'admin' renommé
// silencieusement). Pour renommer, il faut créer un nouveau rôle et migrer.
export class UpdateRoleDto extends PartialType(OmitType(CreateRoleDto, ['name'] as const)) {}
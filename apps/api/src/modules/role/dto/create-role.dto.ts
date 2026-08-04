import { IsString, IsOptional, Length, IsArray, IsInt } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @Length(2, 50)
  name: string;

  @IsOptional()
  @IsString()
  @Length(0, 255)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionIds?: number[];
}

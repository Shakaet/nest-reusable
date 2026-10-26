
import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId } from 'class-validator';
import { CreateAdminRoleDto } from './create-admin-role.dto.js';

export class UpdateAdminRoleDto extends PartialType(
  CreateAdminRoleDto,
) {
  @IsMongoId()
  _id: string;
}

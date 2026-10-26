import { PartialType } from '@nestjs/mapped-types';
import { CreateAdminDto } from './create-admin.dto.js';
import { IsMongoId, IsOptional } from 'class-validator';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @IsMongoId()
  _id: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid Updated ID' })
  updated_id?: string;
}

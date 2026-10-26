import {
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  admin_name: string;

  @IsString()
  @IsNotEmpty()
  admin_phone: string;

  @IsString()
  @MinLength(8)
  admin_password: string;

  @IsMongoId()
  admin_role_id: string;

  @IsMongoId()
  publisher_id: string;

  @IsOptional()
  @IsIn(['active', 'in-active'])
  admin_status?: 'active' | 'in-active';
}
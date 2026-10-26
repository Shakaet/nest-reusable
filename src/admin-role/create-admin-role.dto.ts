
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAdminRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  admin_role_name: string;

  @IsOptional()
  @IsIn(['active', 'in-active'])
  admin_role_status?: 'active' | 'in-active';

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions?: string[];

  @IsMongoId()
  publisher_id: string;

  @IsOptional()
  @IsMongoId()
  updated_id?: string;
}

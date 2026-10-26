import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminDto {
  @IsString()
  @IsNotEmpty()
  admin_phone: string;

  @IsString()
  @IsNotEmpty()
  admin_password: string;
}
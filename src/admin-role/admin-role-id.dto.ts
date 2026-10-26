
import { IsMongoId } from 'class-validator';

export class AdminRoleIdDto {
  @IsMongoId()
  _id: string;
}

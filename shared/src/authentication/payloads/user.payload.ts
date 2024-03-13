import { IsUUID, IsNumber, IsNumberString, IsEnum } from 'class-validator';
import { AuthRoleEnum } from '../enums/auth-role.enum';

export class UserPayload {
  @IsUUID()
  userId: string;

  @IsNumberString()
  loginId: string;

  @IsEnum(AuthRoleEnum)
  role: AuthRoleEnum;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}

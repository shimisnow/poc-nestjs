import { IsUUID, IsNumber, IsNumberString } from 'class-validator';

export class UserPayload {
  @IsUUID()
  userId: string;

  @IsNumberString()
  loginId: string;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}

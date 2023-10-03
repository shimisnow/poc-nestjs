import { IsUUID, IsNumber } from 'class-validator';

export class UserPayload {
  @IsUUID()
  userId: string;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}

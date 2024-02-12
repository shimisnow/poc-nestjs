import { IsUUID, IsNumber } from 'class-validator';

export class UserPayload {
  @IsUUID()
  userId: string;

  @IsNumber()
  iss: number;

  @IsNumber()
  iat: number;

  @IsNumber()
  exp: number;
}

import { IsNumber, IsNumberString } from 'class-validator';

export class PasswordChangeCachePayload {
  @IsNumberString()
  loginId: string;

  @IsNumber()
  changedAt: number;
}
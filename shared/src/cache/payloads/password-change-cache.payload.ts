import { IsNumber } from 'class-validator';

export class PasswordChangeCachePayload {
  @IsNumber()
  changedAt: number;
}
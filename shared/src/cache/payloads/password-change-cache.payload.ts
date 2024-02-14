import { IsNumber } from 'class-validator';

export class PasswordChangeCachePayload {
  @IsNumber()
  sessionId: number;

  @IsNumber()
  changedAt: number;
}
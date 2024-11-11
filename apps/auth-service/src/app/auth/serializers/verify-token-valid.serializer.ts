import { InvalidatedErrorEnum } from '../enums/invalidated-error.enum';

export class VerifyTokenValidSerializer {
  valid: boolean;
  invalidatedBy?: InvalidatedErrorEnum;
}

import { InvalidatedErrorEnum } from '../enums/invalidated-error.enum';

export class VerifyTokenInvalidationProcessSerializer {
  valid: boolean;
  invalidatedBy?: InvalidatedErrorEnum;
}

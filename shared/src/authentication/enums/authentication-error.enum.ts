export enum AUTHENTICATION_ERROR {
  EmptyJsonWebTokenError = 'EmptyJsonWebTokenError',
  JsonWebTokenError = 'JsonWebTokenError',
  JsonWebTokenPayloadStrutureError = 'JsonWebTokenPayloadStrutureError',
  TokenExpiredError = 'TokenExpiredError',
  TokenInvalidatedByServer = 'TokenInvalidatedByServer',
  UserPasswordError = 'UserPasswordError',
}

/**
 * Error names to be used at the name field of an UnauthorizedException
 */
export enum AuthErrorNames {
  JWT_EMPTY_ERROR = 'EmptyJsonWebTokenError',
  JWT_ERROR = 'JsonWebTokenError',
  JWT_PAYLOAD_STRUCTURE_ERROR = 'JsonWebTokenPayloadStrutureError',
  JWT_EXPIRED_ERROR = 'TokenExpiredError',

  /** When the token was invalidated by logout or password change */
  JWT_INVALIDATED_BY_SERVER = 'TokenInvalidatedByServer',

  /** User does not exists, is inactive or password is incorrect */
  CREDENTIAL_ERROR = 'CredentialError',
}

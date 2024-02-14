/**
 * Error messages to be used at the error field of an UnauthorizedException
 */
export enum AuthErrorMessages {
  /** When the combination of userId with sessionId is marked in cache as invalid */
  INVALIDATED_BY_LOGOUT = 'invalidated by logout',

  /** When the user had a password change event */
  INVALIDATED_BY_PASSWORD_CHANGE = 'invalidated by password change',
}

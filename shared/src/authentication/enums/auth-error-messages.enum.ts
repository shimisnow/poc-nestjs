/**
 * Error messages to be used at the error field of an UnauthorizedException
 */
export enum AuthErrorMessages {
  /** JWT: wWhen the combination of userId with sessionId is marked in cache as invalid */
  INVALIDATED_BY_LOGOUT = 'invalidated by logout',

  /** JWT: when the user had a password change event */
  INVALIDATED_BY_PASSWORD_CHANGE = 'invalidated by password change',

  /** Wrong user or password. Also for user that does not exists at endpoints without jwt protection */
  WRONG_USER_PASSWORD = 'wrong user or password information',

  /** For inactive user at endpoints with jwt protection */
  INACTIVE_USER = 'inactive user',
}

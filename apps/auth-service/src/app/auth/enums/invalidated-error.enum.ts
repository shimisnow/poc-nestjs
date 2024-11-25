/**
 * Error messages to be used at the error field of an UnauthorizedException
 */
export enum InvalidatedErrorEnum {
  /** JWT: wWhen the combination of userId with sessionId is marked in cache as invalid */
  INVALIDATED_BY_LOGOUT = 'logout',

  /** JWT: when the user had a password change event */
  INVALIDATED_BY_PASSWORD_CHANGE = 'password',

  /** when the user is marked with a status that make it invalid */
  INVALIDATED_BY_USER_STATUS = 'user-status',
}

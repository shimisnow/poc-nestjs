/**
 * Cache key prefixes.
 * It uses : to separate information.
 * None of the prefixes has : at the end.
 */
export enum CacheKeyPrefix {
  /**
   * Prefix for cache key that stores if a session id was invalidated through logout.
   * Does not have : at the end.
   */
  AUTH_SESSION_LOGOUT = 'auth:logout',

  /**
   * Prefix for cache key that stores if a session id was invalidated by a password change.
   * Does not have : at the end.
   */
  AUTH_PASSWORD_CHANGE = 'auth:password',
}

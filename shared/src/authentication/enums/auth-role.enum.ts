/**
 * Role to indicate the user type
 */
export enum AuthRoleEnum {
  /**
   * User can be probably access all resources
   */
  ADMIN = 'admin',

  /**
   * User can access only its own resources
   */
  USER = 'user',
}

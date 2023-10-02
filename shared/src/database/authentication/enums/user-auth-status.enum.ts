/**
 * Status to indicate the user status at the authentication database.
 */
export enum UserAuthStatusEnum {
  /**
   * User can be used to generate access tokens.
   */
  ACTIVE = 'active',

  /**
   * User CANNOT be used to generate access tokens.
   */
  INACTIVE = 'inactive',
}

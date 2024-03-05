/**
 * Status to indicate the account status at the financial database.
 */
export enum AccountStatusEnum {
  /**
   * Account can be used in transactions.
   */
  ACTIVE = 'active',

  /**
   * Account cannot be used in transactions.
   */
  INACTIVE = 'inactive',
}

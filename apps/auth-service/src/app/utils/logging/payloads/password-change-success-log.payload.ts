export class PasswordChangeSuccessLogPayload {
  userId: string;
  loginId: string;
  /** request IP address */
  ip?: string;
  /** request headers */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  headers?: any;
}

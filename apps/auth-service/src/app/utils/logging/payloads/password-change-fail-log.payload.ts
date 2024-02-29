export class PasswordChangeFailLogPayload {
  userId: string;
  loginId: string;
  errorBy: 'status' | 'password';
  /** request IP address */
  ip?: string;
  /** request headers */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: any;
}

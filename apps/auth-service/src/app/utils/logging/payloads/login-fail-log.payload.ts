export class LoginFailLogPayload {
  userId: string;
  errorBy: 'status' | 'password';
  /** request IP address */
  ip?: string;
  /** request headers */
  headers?: any;
}
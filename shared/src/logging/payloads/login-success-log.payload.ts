export class LoginSuccessLogPayload {
  userId: string;
  loginId: string;
  /** if the request also generated a refresh token */
  withRefreshToken = false;
  /** request IP address */
  ip?: string;
  /** request headers */
  headers?: any;
}

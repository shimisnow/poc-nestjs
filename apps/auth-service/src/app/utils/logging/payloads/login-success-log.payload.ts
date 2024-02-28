/**
 * Data for login success operation
 */
export class LoginSuccessLogPayload {
  userId: string;
  loginId: string;
  /** if the request also generated a refresh token */
  withRefreshToken = false;
  /** request IP address */
  ip?: string;
  /** request headers */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  headers?: any;
}

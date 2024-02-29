import { LoginSuccessLogPayload } from '../payloads/login-success-log.payload';

/**
 * LOG output for a fail operation
 */
export class LoginSuccessLogOutput extends LoginSuccessLogPayload {
  type: 'login';
  status: 'success';
}

import { LoginFailLogPayload } from '../payloads/login-fail-log.payload';

/**
 * LOG output for a fail operatin
 */
export class LoginFailLogOutput extends LoginFailLogPayload {
  type: 'login';
  status: 'fail';
}

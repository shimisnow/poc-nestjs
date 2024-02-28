import { LoginFailLogPayload } from '../payloads/login-fail-log.payload';

export class LoginFailLogOutput extends LoginFailLogPayload {
  type: 'login';
  status: 'fail';
}
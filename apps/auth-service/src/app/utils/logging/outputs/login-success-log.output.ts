import { LoginSuccessLogPayload } from '../payloads/login-success-log.payload';

export class LoginSuccessLogOutput extends LoginSuccessLogPayload {
  type: 'login';
  status: 'success';
}
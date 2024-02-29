import { PasswordChangeSuccessLogPayload } from '../payloads/password-change-success-log.payload';

export class PasswordChangeSuccessLogOutput extends PasswordChangeSuccessLogPayload {
  type: 'password-change';
  status: 'success';
}

import { PasswordChangeFailLogPayload } from '../payloads/password-change-fail-log.payload';

export class PasswordChangeFailLogOutput extends PasswordChangeFailLogPayload {
  type: 'password-change';
  status: 'fail';
}

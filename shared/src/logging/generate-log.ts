import { LoginFailLogOutput } from './outputs/login-fail-log.output';
import { LoginSuccessLogOutput } from './outputs/login-success-log.output';
import { LoginFailLogPayload } from './payloads/login-fail-log.payload';
import { LoginSuccessLogPayload } from './payloads/login-success-log.payload';

export class GenerateLog {
  /**
   * Generates a JSON log with data from a login success operation
   * 
   * @param data Information to be logged
   * @returns JSON log
   */
  static loginSuccess(data: LoginSuccessLogPayload): LoginSuccessLogOutput {
    return {
      type: 'login',
      status: 'success',
      ...data,
    };
  }

  /**
   * Generates a JSON log with data from a login fail operation
   * 
   * @param data Information to be logged
   * @returns JSON log
   */
  static loginFail(data: LoginFailLogPayload): LoginFailLogOutput {
    return {
      type: 'login',
      status: 'fail',
      ...data,
    };
  }
}

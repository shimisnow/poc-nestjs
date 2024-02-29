import { LoginFailLogOutput } from './outputs/login-fail-log.output';
import { LoginSuccessLogOutput } from './outputs/login-success-log.output';
import { PasswordChangeFailLogOutput } from './outputs/password-change-fail-log.output';
import { PasswordChangeSuccessLogOutput } from './outputs/password-change-success-log.output';
import { LoginFailLogPayload } from './payloads/login-fail-log.payload';
import { LoginSuccessLogPayload } from './payloads/login-success-log.payload';
import { PasswordChangeFailLogPayload } from './payloads/password-change-fail-log.payload';
import { PasswordChangeSuccessLogPayload } from './payloads/password-change-success-log.payload';

/**
 * Generates structure JSON log
 */
export class GenerateLog {
  /**
   * Generates a JSON log with data from a login success operation
   * 
   * @param {LoginSuccessLogPayload} data Information to be logged
   * @return {LoginSuccessLogOutput} JSON log
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
   * @param {LoginFailLogPayload} data Information to be logged
   * @return {LoginFailLogOutput} JSON log
   */
  static loginFail(data: LoginFailLogPayload): LoginFailLogOutput {
    return {
      type: 'login',
      status: 'fail',
      ...data,
    };
  }

  /**
   * Generates a JSON log with data from a password change success operation
   * 
   * @param {PasswordChangeSuccessLogPayload} data Information to be logged
   * @return {PasswordChangeSuccessLogOutput} JSON log
   */
  static passwordChangeSuccess(data: PasswordChangeSuccessLogPayload): PasswordChangeSuccessLogOutput {
    return {
      type: 'password-change',
      status: 'success',
      ...data,
    };
  }

  /**
   * Generates a JSON log with data from a password change fail operation
   * 
   * @param {PasswordChangeFailLogPayload} data Information to be logged
   * @return {PasswordChangeFailLogOutput} JSON log
   */
  static passwordChangeFail(data: PasswordChangeFailLogPayload): PasswordChangeFailLogOutput {
    return {
      type: 'password-change',
      status: 'fail',
      ...data,
    };
  }
}

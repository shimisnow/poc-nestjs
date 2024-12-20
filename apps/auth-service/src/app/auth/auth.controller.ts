import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../utils/guards/auth.guard';
import { AuthRefreshGuard } from '../utils/guards/auth-refresh.guard';
import { User } from '@shared/authentication/decorators/user.decorator';
import { UserPayload } from '@shared/authentication/payloads/user.payload';
import { AuthService } from './auth.service';
import { SignUpBodyDto } from './dtos/signup-body.dto';
import { SignUpSerializer } from './serializers/signup.serializer';
import { DefaultError500Serializer } from './serializers/default-error-500.serializer';
import { DefaultError502Serializer } from './serializers/default-error-502.serializer';
import { LoginBodyDto } from './dtos/login-body.dto';
import { LoginSerializer } from './serializers/login.serializer';
import { LoginError400Serializer } from './serializers/login-error-400.serializer';
import { DefaultError401Serializer } from '@shared/authentication/serializers/default-error-401.serializer';
import { SignUpError400Serializer } from './serializers/signup-error-400.serializer';
import { SignUpError409Serializer } from './serializers/signup-error-409.serializer';
import { RefreshSerializer } from './serializers/refresh.serializer';
import { LogoutSerializer } from './serializers/logout.serializer';
import { PasswordChangeBodyDto } from './dtos/password-change-body.dto';
import { PasswordChangeSerializer } from './serializers/password-change.serializer';
import { PasswordChangeError400Serializer } from './serializers/password-change-error-400.serializer';
import { VerifyTokenInvalidationProcessSerializer } from './serializers/verify-token-invalidation-process.serializer';
import { VerifyTokenInvalidationProcessBodyDto } from './dtos/verify-token-invalidation-process-body.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Version('1')
  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Uses username and password to get a JWT token to use in future API calls',
  })
  @ApiHeader({
    name: 'X-Api-Version',
    description: 'Sets the API version',
    required: true,
  })
  @ApiOkResponse({
    description: 'JWT Access Token to use in future API calls',
    type: LoginSerializer,
  })
  @ApiBadRequestResponse({
    description: 'Error validating request input data',
    type: LoginError400Serializer,
  })
  @ApiUnauthorizedResponse({
    description:
      'User does not exists, exists and is inactive or the password is wrong',
    type: DefaultError401Serializer,
  })
  @ApiInternalServerErrorResponse({
    description:
      'The server has encountered a situation it does not know how to handle. See server logs for details',
    type: DefaultError500Serializer,
  })
  @ApiBadGatewayResponse({
    description: 'Internal data processing error. Probably a database error',
    type: DefaultError502Serializer,
  })
  async login(
    @Body() body: LoginBodyDto,
    @Ip() ip,
    @Headers() headers,
  ): Promise<LoginSerializer> {
    return await this.authService.login(
      body.username,
      body.password,
      body.requestRefreshToken,
      ip,
      headers,
    );
  }

  @Version('1')
  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('AccessToken')
  @ApiHeader({
    name: 'X-Api-Version',
    description: 'Sets the API version',
    required: true,
  })
  @ApiOperation({
    summary: 'Invalidates all tokens issued for a give login request',
  })
  @ApiOkResponse({
    description: 'Information if the logout process was performed',
    type: LogoutSerializer,
  })
  @ApiInternalServerErrorResponse({
    description:
      'The server has encountered a situation it does not know how to handle. See server logs for details',
    type: DefaultError500Serializer,
  })
  @ApiBadGatewayResponse({
    description: 'Internal data processing error. Probably a database error',
    type: DefaultError502Serializer,
  })
  async logout(@User() user: UserPayload) {
    return await this.authService.logout(user.userId, user.loginId);
  }

  @Version('1')
  @Get('refresh')
  @UseGuards(AuthRefreshGuard)
  @ApiBearerAuth('RefreshToken')
  @ApiOperation({
    summary: 'Uses refresh token to get new access token',
  })
  @ApiHeader({
    name: 'X-Api-Version',
    description: 'Sets the API version',
    required: true,
  })
  @ApiOkResponse({
    description: 'JWT Access Token to use in future API calls',
    type: RefreshSerializer,
  })
  @ApiUnauthorizedResponse({
    description: 'User does not exists or is inactive',
    type: DefaultError401Serializer,
  })
  @ApiInternalServerErrorResponse({
    description:
      'The server has encountered a situation it does not know how to handle. See server logs for details',
    type: DefaultError500Serializer,
  })
  @ApiBadGatewayResponse({
    description: 'Internal data processing error. Probably a database error',
    type: DefaultError502Serializer,
  })
  async refresh(@User() user: UserPayload): Promise<RefreshSerializer> {
    return await this.authService.refresh(user);
  }

  @Version('1')
  @Post('signup')
  @ApiOperation({
    summary: 'Creates a new user',
  })
  @ApiHeader({
    name: 'X-Api-Version',
    description: 'Sets the API version',
    required: true,
  })
  @ApiOkResponse({
    description: 'ID for the created user',
    type: SignUpSerializer,
  })
  @ApiBadRequestResponse({
    description: 'Error validating request input data',
    type: SignUpError400Serializer,
  })
  @ApiConflictResponse({
    description: 'User cannot be created. It already exists',
    type: SignUpError409Serializer,
  })
  @ApiInternalServerErrorResponse({
    description:
      'The server has encountered a situation it does not know how to handle. See server logs for details',
    type: DefaultError500Serializer,
  })
  @ApiBadGatewayResponse({
    description: 'Internal data processing error. Probably a database error',
    type: DefaultError502Serializer,
  })
  async signup(@Body() body: SignUpBodyDto): Promise<SignUpSerializer> {
    return await this.authService.signup(body.username, body.password);
  }

  @Version('1')
  @Post('password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('AccessToken')
  @ApiOperation({
    summary: 'Changes an user password',
  })
  @ApiHeader({
    name: 'X-Api-Version',
    description: 'Sets the API version',
    required: true,
  })
  @ApiOkResponse({
    description: 'ID for the created user',
    type: PasswordChangeSerializer,
  })
  @ApiBadRequestResponse({
    description: 'Error validating request input data',
    type: PasswordChangeError400Serializer,
  })
  @ApiUnauthorizedResponse({
    description: 'User does not exists or is inactive or password is incorrect',
    type: DefaultError401Serializer,
  })
  @ApiInternalServerErrorResponse({
    description:
      'The server has encountered a situation it does not know how to handle. See server logs for details',
    type: DefaultError500Serializer,
  })
  @ApiBadGatewayResponse({
    description: 'Internal data processing error. Probably a database error',
    type: DefaultError502Serializer,
  })
  async passwordChange(
    @User() user: UserPayload,
    @Body() body: PasswordChangeBodyDto,
    @Ip() ip,
    @Headers() headers,
  ) {
    return await this.authService.passwordChange(
      user.userId,
      user.loginId,
      body.currentPassword,
      body.newPassword,
      body.requestRefreshToken,
      ip,
      headers,
    );
  }

  @Version('1')
  @Post('verify')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Checkes if user has logged out or made a password change',
  })
  @ApiHeader({
    name: 'X-Api-Version',
    description: 'Sets the API version',
    required: true,
  })
  @ApiOkResponse({
    description: 'Information if the token is valid',
    type: VerifyTokenInvalidationProcessSerializer,
  })
  @ApiUnauthorizedResponse({
    description: 'User does not exists or is inactive or password is incorrect',
    type: DefaultError401Serializer,
  })
  @ApiInternalServerErrorResponse({
    description:
      'The server has encountered a situation it does not know how to handle. See server logs for details',
    type: DefaultError500Serializer,
  })
  async verifyTokenInvalidationProcess(
    @Body() body: VerifyTokenInvalidationProcessBodyDto,
  ): Promise<VerifyTokenInvalidationProcessSerializer> {
    return await this.authService.verifyTokenInvalidationProcess(body);
  }
}

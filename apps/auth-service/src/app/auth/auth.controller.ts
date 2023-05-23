import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpBodyDto } from './dtos/signup-body.dto';
import { SignUpSerializer } from './serializers/signup.serializer';
import { VerifyUsernameSerializer } from './serializers/verify-username.serializer';
import { VerifyUsernameQueryDto } from './dtos/verify-username-query.dto';
import { VerifyUsernameError400Serializer } from './serializers/verify-username-error-400.serializer';
import { DefaultError500Serializer } from './serializers/default-error-500.serializer';
import { DefaultError502Serializer } from './serializers/default-error-502.serializer';
import { LoginBodyDto } from './dtos/login-body.dto';
import { LoginSerializer } from './serializers/login.serializer';
import { LoginError400Serializer } from './serializers/login-error-400.serializer';
import { LoginError401Serializer } from './serializers/login-error-401.serializer';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('username/available')
  @ApiOperation({
    summary:
      'Retrieves information if the provided username is already registered',
  })
  @ApiOkResponse({
    description: 'Information about the username availability',
    type: VerifyUsernameSerializer,
  })
  @ApiBadRequestResponse({
    description: 'Error validating request input data',
    type: VerifyUsernameError400Serializer,
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
  async verifyIfUsernameIsAvailable(
    @Query() query: VerifyUsernameQueryDto
  ): Promise<VerifyUsernameSerializer> {
    const result = await this.authService.verifyIfUsernameExists(
      query.username
    );

    return {
      available: !result,
    } as VerifyUsernameSerializer;
  }

  @Post('login')
  @ApiOperation({
    summary:
      'Uses username and password to get a JWT token to use in future API calls',
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
      'User do not exists, exists and is inactive or the password is wrong',
    type: LoginError401Serializer,
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
  async login(@Body() body: LoginBodyDto): Promise<LoginSerializer> {
    return await this.authService.login(body.username, body.password);
  }

  @Post('signup')
  async signup(@Body() body: SignUpBodyDto): Promise<SignUpSerializer> {
    return await this.authService.signup(
      body.userId,
      body.username,
      body.password
    );
  }
}

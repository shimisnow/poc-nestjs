import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpBodyDto } from './dtos/signup-body.dto';
import { SignUpSerializer } from './serializers/signup.serializer';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignUpBodyDto): Promise<SignUpSerializer> {
    return await this.authService.signup(
      body.userId,
      body.username,
      body.password
    );
  }
}

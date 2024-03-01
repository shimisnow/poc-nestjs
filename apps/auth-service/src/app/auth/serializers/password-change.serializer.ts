import { ApiProperty } from '@nestjs/swagger';

export class PasswordChangeSerializer {
  @ApiProperty({
    description: 'Information if the password change process was performed',
    example: true,
  })
  performed: boolean;

  @ApiProperty({
    description: 'Access token to be used at protected endpoints',
    example:
      'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMGY4ODI1MS1kMTgxLTQyNTUtOTJlZC1kMGQ4NzRlM2ExNjYiLCJsb2dpbklkIjoiMTcwNzk0NzY1Mjg5OSIsImlhdCI6MTcwNzk0NzY1Mi44OTksImV4cCI6MTcwNzk0NzcxMi44OTl9.l5kCGNrX8CCYf5YkV0p7gw1SM6c9kFPQ64SL2mHCMpc',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token to be used to get new access tokens',
    example:
      'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI0Nzk5Y2MzMS03NjkyLTQwYjMtYWZmZi1jYzU2MmJhZjUzNzQiLCJsb2dpbklkIjoiMTcwNzk0NzY5MzE0OSIsImlhdCI6MTcwNzk0NzY5My4xNDksImV4cCI6MTcwNzk0Nzc1My4xNDl9.XDvAHGsDeqdmzz6P_5DMd7wFbsIooVAxfw44Jlpkc34',
  })
  refreshToken?: string;
}

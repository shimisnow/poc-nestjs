import { ApiProperty } from '@nestjs/swagger';

export class RefreshSerializer {
  @ApiProperty({
    description: 'Access token to be used at the private endpoints',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZGVyc29uIiwic3ViIjoxLCJpYXQiOjE2ODM4MzAyNTEsImV4cCI6MTY4MzgzMDMxMX0.eN5Cv2tJ0HGlVNKMtPv5VPeCIA7dd4OEA-8Heh7OJ_c',
  })
  accessToken: string;
}

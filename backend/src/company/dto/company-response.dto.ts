import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  website?: string;
  @ApiProperty({ description: "Company type: 'own' | 'client'" })
  type?: string;
}

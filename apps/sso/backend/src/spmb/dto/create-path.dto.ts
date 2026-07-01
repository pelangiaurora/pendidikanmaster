import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreatePathDto {
  @ApiProperty()
  @IsUUID()
  periodId: string;

  @ApiProperty({ example: 'Jalur Reguler' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  quota: number;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  registrationFee: number;
}

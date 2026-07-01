import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePeriodDto {
  @ApiProperty({ example: 'PPDB 2026/2027' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2026/2027' })
  @IsString()
  academicYear: string;

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-08-31' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

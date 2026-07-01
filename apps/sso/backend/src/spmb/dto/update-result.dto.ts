import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { SpmbResultStatus } from '@pendidikanmaster/database';

export class UpdateResultDto {
  @ApiProperty({ enum: SpmbResultStatus })
  @IsEnum(SpmbResultStatus)
  status: SpmbResultStatus;

  @ApiPropertyOptional({ example: 85.5 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

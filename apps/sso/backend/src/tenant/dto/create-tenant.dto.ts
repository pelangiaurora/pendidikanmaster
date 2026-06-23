import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  MinLength,
} from 'class-validator';
import { PlanType, InstitutionType } from '@pendidikanmaster/database';

export class CreateTenantDto {
  @ApiProperty({ example: 'SDN 1 Bandung' })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    example: 'sdn1bandung',
    description: 'Slug unik, tanpa spasi',
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'sdn1bandung.ac.id' })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiPropertyOptional({ enum: PlanType, default: PlanType.FREE })
  @IsOptional()
  @IsEnum(PlanType)
  planType?: PlanType;

  @ApiPropertyOptional({
    enum: InstitutionType,
    default: InstitutionType.SCHOOL_SD,
  })
  @IsOptional()
  @IsEnum(InstitutionType)
  institutionType?: InstitutionType;

  @ApiPropertyOptional({ example: 'Jl. Merdeka No. 1, Bandung' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '022-1234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'info@sdn1bandung.ac.id' })
  @IsOptional()
  @IsString()
  email?: string;
}

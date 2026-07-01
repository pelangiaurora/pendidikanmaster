import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Gender } from '@pendidikanmaster/database';

export class CreateApplicantDto {
  @ApiProperty()
  @IsUUID()
  periodId: string;

  @ApiProperty()
  @IsUUID()
  pathId: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'budi@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '08123456789' })
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nik?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @ApiPropertyOptional({ example: '2008-01-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previousSchool?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  major?: string;
}

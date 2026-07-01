import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SpmbService } from './spmb.service';
import { CreatePeriodDto } from './dto/create-period.dto';
import { CreatePathDto } from './dto/create-path.dto';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';

@ApiTags('SPMB')
@ApiBearerAuth()
@Controller('spmb')
export class SpmbController {
  constructor(private spmbService: SpmbService) {}

  // ── PERIODE ───────────────────────────────────────────────
  @Post('periods')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buat periode SPMB baru' })
  createPeriod(@Body() dto: CreatePeriodDto, @Request() req: any) {
    return this.spmbService.createPeriod(dto, req.user.tenantId);
  }

  @Get('periods')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List semua periode SPMB' })
  getPeriods(@Request() req: any) {
    return this.spmbService.getPeriods(req.user.tenantId);
  }

  @Get('periods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Detail periode SPMB' })
  getPeriod(@Param('id') id: string, @Request() req: any) {
    return this.spmbService.getPeriod(id, req.user.tenantId);
  }

  // ── JALUR ─────────────────────────────────────────────────
  @Post('paths')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buat jalur pendaftaran' })
  createPath(@Body() dto: CreatePathDto, @Request() req: any) {
    return this.spmbService.createPath(dto, req.user.tenantId);
  }

  @Get('paths/:periodId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List jalur pendaftaran per periode' })
  getPaths(@Param('periodId') periodId: string, @Request() req: any) {
    return this.spmbService.getPaths(periodId, req.user.tenantId);
  }

  // ── PENDAFTAR (butuh TenantGuard untuk publik) ────────────
  @Post('register')
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Daftar sebagai calon siswa/mahasiswa (publik)' })
  register(@Body() dto: CreateApplicantDto, @Request() req: any) {
    return this.spmbService.register(dto, req.tenantId);
  }

  @Get('applicants')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List semua pendaftar' })
  @ApiQuery({ name: 'periodId', required: false })
  @ApiQuery({ name: 'pathId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getApplicants(
    @Request() req: any,
    @Query('periodId') periodId?: string,
    @Query('pathId') pathId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.spmbService.getApplicants(req.user.tenantId, {
      periodId,
      pathId,
      status,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('applicants/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Detail pendaftar' })
  getApplicant(@Param('id') id: string, @Request() req: any) {
    return this.spmbService.getApplicant(id, req.user.tenantId);
  }

  // ── HASIL SELEKSI ──────────────────────────────────────────
  @Put('applicants/:id/result')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Input/update hasil seleksi pendaftar' })
  setResult(
    @Param('id') id: string,
    @Body() dto: UpdateResultDto,
    @Request() req: any,
  ) {
    return this.spmbService.setResult(id, dto, req.user.tenantId);
  }

  // ── STATISTIK ──────────────────────────────────────────────
  @Get('stats/:periodId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Statistik pendaftar per periode' })
  getStats(@Param('periodId') periodId: string, @Request() req: any) {
    return this.spmbService.getStats(periodId, req.user.tenantId);
  }
}

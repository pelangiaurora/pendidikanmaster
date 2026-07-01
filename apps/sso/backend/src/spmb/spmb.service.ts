import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationEvent } from '../notification/notification.constants';
import { CreatePeriodDto } from './dto/create-period.dto';
import { CreatePathDto } from './dto/create-path.dto';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { UpdateResultDto } from './dto/update-result.dto';

@Injectable()
export class SpmbService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
  ) {}

  // ── PERIODE ───────────────────────────────────────────────
  async createPeriod(dto: CreatePeriodDto, tenantId: string) {
    return this.prisma.spmbPeriod.create({
      data: { ...dto, tenantId },
    });
  }

  async getPeriods(tenantId: string) {
    return this.prisma.spmbPeriod.findMany({
      where: { tenantId },
      include: {
        paths: true,
        _count: { select: { applicants: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPeriod(id: string, tenantId: string) {
    const period = await this.prisma.spmbPeriod.findFirst({
      where: { id, tenantId },
      include: {
        paths: true,
        _count: { select: { applicants: true } },
      },
    });
    if (!period) throw new NotFoundException('Periode tidak ditemukan');
    return period;
  }

  // ── JALUR PENDAFTARAN ──────────────────────────────────────
  async createPath(dto: CreatePathDto, tenantId: string) {
    await this.getPeriod(dto.periodId, tenantId);
    return this.prisma.spmbPath.create({
      data: { ...dto, tenantId },
    });
  }

  async getPaths(periodId: string, tenantId: string) {
    return this.prisma.spmbPath.findMany({
      where: { periodId, tenantId },
      include: {
        _count: { select: { applicants: true } },
      },
    });
  }

  // ── PENDAFTAR ──────────────────────────────────────────────
  async register(dto: CreateApplicantDto, tenantId: string) {
    // Cek periode aktif
    const period = await this.prisma.spmbPeriod.findFirst({
      where: { id: dto.periodId, tenantId, isActive: true },
    });
    if (!period)
      throw new BadRequestException('Periode pendaftaran tidak aktif');

    // Cek jalur
    const path = await this.prisma.spmbPath.findFirst({
      where: { id: dto.pathId, tenantId, isActive: true },
    });
    if (!path)
      throw new BadRequestException('Jalur pendaftaran tidak tersedia');

    // Cek kuota
    const count = await this.prisma.spmbApplicant.count({
      where: { pathId: dto.pathId, tenantId },
    });
    if (count >= path.quota) {
      throw new BadRequestException('Kuota jalur ini sudah penuh');
    }

    // Generate nomor pendaftaran
    const registrationNo = await this.generateRegistrationNo(
      tenantId,
      period.academicYear,
    );

    const applicant = await this.prisma.spmbApplicant.create({
      data: {
        ...dto,
        tenantId,
        registrationNo,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
      include: { period: true, path: true },
    });

    // Kirim email konfirmasi
    await this.notification.send({
      to: applicant.email,
      subject: 'Konfirmasi Pendaftaran SPMB',
      event: NotificationEvent.SPMB_REGISTERED,
      tenantId,
      data: {
        name: applicant.fullName,
        registrationNo: applicant.registrationNo,
        periodName: applicant.period.name,
        pathName: applicant.path.name,
        tenantName: 'PendidikanMaster',
      },
    });

    return applicant;
  }

  async getApplicants(
    tenantId: string,
    filters: {
      periodId?: string;
      pathId?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (filters.periodId) where.periodId = filters.periodId;
    if (filters.pathId) where.pathId = filters.pathId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { registrationNo: { contains: filters.search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.spmbApplicant.findMany({
        where,
        include: {
          path: { select: { name: true } },
          period: { select: { name: true, academicYear: true } },
          result: true,
          _count: { select: { documents: true, payments: true } },
        },
        orderBy: { registeredAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.spmbApplicant.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getApplicant(id: string, tenantId: string) {
    const applicant = await this.prisma.spmbApplicant.findFirst({
      where: { id, tenantId },
      include: {
        path: true,
        period: true,
        documents: true,
        payments: true,
        result: true,
      },
    });
    if (!applicant) throw new NotFoundException('Pendaftar tidak ditemukan');
    return applicant;
  }

  // ── HASIL SELEKSI ──────────────────────────────────────────
  async setResult(applicantId: string, dto: UpdateResultDto, tenantId: string) {
    const applicant = await this.getApplicant(applicantId, tenantId);

    const result = await this.prisma.spmbResult.upsert({
      where: { applicantId },
      create: {
        applicantId,
        tenantId,
        status: dto.status,
        score: dto.score,
        notes: dto.notes,
        announcedAt: new Date(),
      },
      update: {
        status: dto.status,
        score: dto.score,
        notes: dto.notes,
        announcedAt: new Date(),
      },
    });

    // Update status pendaftar
    await this.prisma.spmbApplicant.update({
      where: { id: applicantId },
      data: { status: 'COMPLETED' },
    });

    // Kirim email pengumuman hasil
    await this.notification.send({
      to: applicant.email,
      subject: 'Pengumuman Hasil Seleksi',
      event: NotificationEvent.SPMB_RESULT,
      tenantId,
      data: {
        name: applicant.fullName,
        status: dto.status,
        programStudi: applicant.major ?? 'Program Pilihan',
        tenantName: 'PendidikanMaster',
      },
    });

    return result;
  }

  // ── STATISTIK ──────────────────────────────────────────────
  async getStats(periodId: string, tenantId: string) {
    const [total, byStatus, byPath] = await Promise.all([
      this.prisma.spmbApplicant.count({ where: { periodId, tenantId } }),
      this.prisma.spmbApplicant.groupBy({
        by: ['status'],
        where: { periodId, tenantId },
        _count: true,
      }),
      this.prisma.spmbApplicant.groupBy({
        by: ['pathId'],
        where: { periodId, tenantId },
        _count: true,
      }),
    ]);

    return { total, byStatus, byPath };
  }

  // ── HELPER ─────────────────────────────────────────────────
  private async generateRegistrationNo(
    tenantId: string,
    academicYear: string,
  ): Promise<string> {
    const count = await this.prisma.spmbApplicant.count({
      where: { tenantId },
    });
    const year = academicYear.replace('/', '');
    const seq = String(count + 1).padStart(5, '0');
    return `SPMB-${year}-${seq}`;
  }
}

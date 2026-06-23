import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    // Cek slug sudah ada
    const existing = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Slug sudah digunakan');

    // Buat tenant + settings sekaligus
    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        domain: dto.domain,
        planType: dto.planType ?? 'FREE',
        settings: {
          create: {
            institutionType: dto.institutionType ?? 'SCHOOL_SD',
            address: dto.address,
            phone: dto.phone,
            email: dto.email,
          },
        },
      },
      include: { settings: true },
    });

    return tenant;
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      include: { settings: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
        _count: { select: { users: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant tidak ditemukan');
    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { settings: true },
    });
    if (!tenant) throw new NotFoundException('Tenant tidak ditemukan');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);

    const { institutionType, address, phone, email, ...tenantData } = dto;

    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...tenantData,
        settings: {
          update: {
            ...(institutionType && { institutionType }),
            ...(address !== undefined && { address }),
            ...(phone !== undefined && { phone }),
            ...(email !== undefined && { email }),
          },
        },
      },
      include: { settings: true },
    });
  }

  async toggleActive(id: string) {
    const tenant = await this.findOne(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: !tenant.isActive },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.delete({ where: { id } });
  }

  async getStats(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true } },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant tidak ditemukan');
    return {
      tenantId: id,
      name: tenant.name,
      totalUsers: tenant._count.users,
      isActive: tenant.isActive,
      planType: tenant.planType,
    };
  }
}

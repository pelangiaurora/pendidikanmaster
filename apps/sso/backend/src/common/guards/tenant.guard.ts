import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RedisService } from '../../redis.service';

const TENANT_CACHE_TTL = 300; // 5 menit

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = await this.resolveTenant(request);

    if (!tenantId) {
      throw new UnauthorizedException(
        'Tenant tidak ditemukan atau tidak aktif',
      );
    }

    request.tenantId = tenantId;
    return true;
  }

  private async resolveTenant(request: any): Promise<string | null> {
    // ── Prioritas 1: x-tenant-id header ──────────────────────
    const tenantIdHeader = request.headers['x-tenant-id'];
    if (tenantIdHeader) {
      return this.getTenantById(tenantIdHeader);
    }

    // ── Prioritas 2: subdomain dari Host header ───────────────
    const host = request.headers['host'] || '';
    const slug = this.extractSlug(host);
    if (slug) {
      return this.getTenantBySlug(slug);
    }

    return null;
  }

  private async getTenantById(id: string): Promise<string | null> {
    const cacheKey = `tenant:id:${id}`;

    // Cek cache dulu
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached === 'active' ? id : null;

    // Query database
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });

    if (!tenant) {
      await this.redis.set(cacheKey, 'inactive', TENANT_CACHE_TTL);
      return null;
    }

    // Simpan ke cache
    await this.redis.set(
      cacheKey,
      tenant.isActive ? 'active' : 'inactive',
      TENANT_CACHE_TTL,
    );
    return tenant.isActive ? tenant.id : null;
  }

  private async getTenantBySlug(slug: string): Promise<string | null> {
    const cacheKey = `tenant:slug:${slug}`;

    // Cek cache dulu
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      const [status, id] = cached.split(':');
      return status === 'active' ? id : null;
    }

    // Query database
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, isActive: true },
    });

    if (!tenant) {
      await this.redis.set(cacheKey, 'inactive', TENANT_CACHE_TTL);
      return null;
    }

    // Simpan ke cache: "active:uuid" atau "inactive:"
    const cacheValue = tenant.isActive ? `active:${tenant.id}` : 'inactive:';
    await this.redis.set(cacheKey, cacheValue, TENANT_CACHE_TTL);
    return tenant.isActive ? tenant.id : null;
  }

  private extractSlug(host: string): string | null {
    const hostWithoutPort = host.split(':')[0];
    const parts = hostWithoutPort.split('.');
    if (parts.length < 2) return null;

    if (parts[parts.length - 1] === 'localhost') {
      return parts[0] !== 'localhost' ? parts[0] : null;
    }

    const serviceSubdomains = ['sso', 'api', 'www', 'admin'];
    if (parts.length >= 3) {
      return serviceSubdomains.includes(parts[0]) ? parts[1] : parts[0];
    }

    return null;
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const tenantId = await this.resolveTenant(request);
    if (!tenantId) {
      throw new UnauthorizedException('Tenant tidak ditemukan');
    }

    request.tenantId = tenantId;
    return true;
  }

  private async resolveTenant(request: any): Promise<string | null> {
    // ── Prioritas 1: x-tenant-id header (untuk dev & API) ──
    const tenantIdHeader = request.headers['x-tenant-id'];
    if (tenantIdHeader) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantIdHeader },
        select: { id: true, isActive: true },
      });
      if (tenant?.isActive) return tenant.id;
    }

    // ── Prioritas 2: subdomain dari Host header ─────────────
    const host = request.headers['host'] || '';
    const slug = this.extractSlug(host);
    if (slug) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { slug },
        select: { id: true, isActive: true },
      });
      if (tenant?.isActive) return tenant.id;
    }

    return null;
  }

  private extractSlug(host: string): string | null {
    // Hapus port jika ada: "demo.localhost:3001" → "demo.localhost"
    const hostWithoutPort = host.split(':')[0];

    // Split by dot
    const parts = hostWithoutPort.split('.');

    // "demo.localhost" → slug = "demo"
    // "sso.sdn1.ac.id" → slug = "sdn1" (index 1)
    // "localhost" → tidak ada subdomain
    if (parts.length < 2) return null;

    // Kalau pakai localhost: "demo.localhost" → parts = ["demo", "localhost"]
    if (parts[parts.length - 1] === 'localhost') {
      return parts[0] !== 'localhost' ? parts[0] : null;
    }

    // Kalau pakai domain proper: "sso.sdn1.ac.id" → ambil bagian kedua
    // tapi kita skip subdomain service (sso, api, dll)
    const serviceSubdomains = ['sso', 'api', 'www', 'admin'];
    if (parts.length >= 3) {
      const firstPart = parts[0];
      if (serviceSubdomains.includes(firstPart)) {
        return parts[1];
      }
      return firstPart;
    }

    return null;
  }
}

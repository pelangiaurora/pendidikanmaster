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
    const host = request.headers['host'] || '';
    const subdomain = host.split('.')[0];

    if (!subdomain) throw new UnauthorizedException('Tenant tidak ditemukan');

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: subdomain },
    });

    if (!tenant || !tenant.isActive) {
      throw new UnauthorizedException('Tenant tidak aktif');
    }

    request.tenantId = tenant.id;
    request.tenant = tenant;
    return true;
  }
}

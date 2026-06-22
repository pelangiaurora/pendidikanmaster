import { Injectable } from '@nestjs/common';
import { prisma } from '@pendidikanmaster/database';

@Injectable()
export class PrismaService {
  get user() {
    return prisma.user;
  }
  get tenant() {
    return prisma.tenant;
  }
  get session() {
    return prisma.session;
  }
  get auditLog() {
    return prisma.auditLog;
  }
  get userProfile() {
    return prisma.userProfile;
  }
  get tenantSetting() {
    return prisma.tenantSetting;
  }
}

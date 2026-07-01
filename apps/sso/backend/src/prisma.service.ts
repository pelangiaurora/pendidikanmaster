import { Injectable } from '@nestjs/common';
import { prisma } from '@pendidikanmaster/database';

@Injectable()
export class PrismaService {
  // ── Core ──────────────────────────────────────────────────
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

  // ── SPMB ──────────────────────────────────────────────────
  get spmbPeriod() {
    return prisma.spmbPeriod;
  }
  get spmbPath() {
    return prisma.spmbPath;
  }
  get spmbApplicant() {
    return prisma.spmbApplicant;
  }
  get spmbDocument() {
    return prisma.spmbDocument;
  }
  get spmbPayment() {
    return prisma.spmbPayment;
  }
  get spmbResult() {
    return prisma.spmbResult;
  }
}

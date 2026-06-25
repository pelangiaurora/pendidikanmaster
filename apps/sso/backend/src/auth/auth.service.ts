import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string, tenantId?: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, ...(tenantId ? { tenantId } : {}), isActive: true },
    });
    if (!user || !user.passwordHash) return null;
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;
    const { passwordHash, ...result } = user;
    return result;
  }

  async register(dto: RegisterDto, tenantId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: dto.email } },
    });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        fullName: dto.fullName,
        phone: dto.phone,
        passwordHash,
        role: dto.role ?? 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        tenantId: true,
        createdAt: true,
      },
    });

    await this.prisma.userProfile.create({
      data: { userId: user.id, tenantId },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        action: 'USER_REGISTERED',
        entity: 'users',
        entityId: user.id,
      },
    });

    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async login(user: any, tenantId: string) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'users',
        entityId: user.id,
      },
    });
    const tokens = await this.generateTokens(user);
    return { user, ...tokens };
  }

  async generateTokens(user: any) {
    const jti = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      jti,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    // Hapus session lama milik user ini dulu (max 5 session aktif)
    const sessionCount = await this.prisma.session.count({
      where: { userId: user.id },
    });
    if (sessionCount >= 5) {
      // Hapus session terlama
      const oldest = await this.prisma.session.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });
      if (oldest) {
        await this.prisma.session.delete({ where: { id: oldest.id } });
      }
    }

    await this.prisma.session.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: token },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token tidak valid atau expired');
    }
    await this.prisma.session.delete({ where: { id: session.id } });
    return this.generateTokens(session.user);
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.session.deleteMany({ where: { userId, refreshToken } });
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    await this.prisma.auditLog.create({
      data: {
        tenantId: user!.tenantId,
        userId,
        action: 'USER_LOGOUT',
        entity: 'users',
        entityId: userId,
      },
    });
    return { message: 'Logout berhasil' };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        lastLoginAt: true,
        createdAt: true,
        profile: true,
      },
    });
  }
}

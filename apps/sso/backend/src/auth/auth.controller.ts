import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register user baru' })
  @ApiSecurity('x-tenant-id')
  @ApiResponse({ status: 201, description: 'User berhasil dibuat' })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar' })
  async register(
    @Body() dto: RegisterDto,
    @Request() req: any,
    @Headers('x-tenant-id') tenantHeader?: string,
  ) {
    const tenantId = req.tenantId ?? tenantHeader;
    if (!tenantId) {
      return { statusCode: 400, message: 'Tenant ID diperlukan' };
    }
    return this.authService.register(dto, tenantId);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login dan dapatkan JWT token' })
  @ApiSecurity('x-tenant-id')
  @ApiResponse({
    status: 200,
    description: 'Login berhasil, token dikembalikan',
  })
  @ApiResponse({ status: 401, description: 'Email atau password salah' })
  async login(
    @Body() dto: LoginDto,
    @Request() req: any,
    @Headers('x-tenant-id') tenantHeader?: string,
  ) {
    const tenantId = req.tenantId ?? tenantHeader;
    if (!tenantId) {
      return { statusCode: 400, message: 'Tenant ID diperlukan' };
    }
    const user = await this.authService.validateUser(
      dto.email,
      dto.password,
      tenantId,
    );
    if (!user) {
      return { statusCode: 401, message: 'Email atau password salah' };
    }
    return this.authService.login(user, tenantId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token baru dikembalikan' })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout dan hapus session' })
  async logout(@Request() req: any, @Body() body: { refreshToken: string }) {
    return this.authService.logout(req.user.userId, body.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ambil profil user yang sedang login' })
  @ApiResponse({ status: 200, description: 'Data profil user' })
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check SSO service' })
  health() {
    return {
      status: 'ok',
      service: 'sso',
      timestamp: new Date().toISOString(),
    };
  }
}

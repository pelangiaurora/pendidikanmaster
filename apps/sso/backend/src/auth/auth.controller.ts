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
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
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
  async login(
    @Body() dto: any,
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
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any, @Body() body: { refreshToken: string }) {
    return this.authService.logout(req.user.userId, body.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'sso',
      timestamp: new Date().toISOString(),
    };
  }
}

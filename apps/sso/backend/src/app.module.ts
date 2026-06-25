import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { StorageModule } from './storage/storage.module';
import { RedisService } from './redis.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../../../.env',
    }),

    // ── Rate Limiting ─────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 detik
        limit: 10, // max 10 request per detik
      },
      {
        name: 'medium',
        ttl: 60000, // 1 menit
        limit: 100, // max 100 request per menit
      },
    ]),

    AuthModule,
    TenantModule,
    StorageModule,
  ],
  providers: [
    RedisService,
    // Aktifkan rate limiting secara global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [RedisService],
})
export class AppModule {}

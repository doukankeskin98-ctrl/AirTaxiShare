import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MatchModule } from './match/match.module';
import { TripRequest } from './match/trip-request.entity';
import { Rating } from './match/rating.entity';
import { MatchHistory } from './match/match-history.entity';
import { HealthModule } from './health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        // ─── Rate Limiting ───────────────────────────────────────────
        ThrottlerModule.forRoot([{
            ttl: 60000,  // 60 seconds window
            limit: 60,   // global: 60 requests per window
        }]),

        // ─── Database ────────────────────────────────────────────────
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const isProduction = process.env.NODE_ENV === 'production';
                const databaseUrl = configService.get<string>('DATABASE_URL');

                const base = {
                    entities: [User, TripRequest, Rating, MatchHistory],
                    // In development, synchronize is true to auto-update schema. In production, we MUST use migrations to prevent data loss.
                    synchronize: !isProduction,
                    logging: !isProduction ? (['error'] as any) : false,
                    // Connection pool for high concurrency
                    extra: {
                        max: 20,               // max 20 pooled connections
                        idleTimeoutMillis: 30000,
                        connectionTimeoutMillis: 10000,
                    },
                };

                if (databaseUrl) {
                    // Render internal URLs (e.g. dpg-cxyz123-a) do not support SSL and will time out if forced. 
                    // External URLs (e.g. dpg-cxyz...render.com) require SSL.
                    const isInternalRender = databaseUrl.includes('dpg-') && !databaseUrl.includes('.render.com');
                    const useSsl = isInternalRender ? false : { rejectUnauthorized: false };

                    return {
                        ...base,
                        type: 'postgres',
                        url: databaseUrl,
                        ssl: useSsl,
                    };
                }

                return {
                    ...base,
                    type: 'postgres',
                    host: configService.get<string>('DB_HOST', 'localhost'),
                    port: configService.get<number>('DB_PORT', 5432),
                    username: configService.get<string>('DB_USER', 'airtaxi'),
                    password: configService.get<string>('DB_PASS', 'password'),
                    database: configService.get<string>('DB_NAME', 'airtaxi_db'),
                };
            },
            inject: [ConfigService],
        }),

        TypeOrmModule.forFeature([User, TripRequest, Rating, MatchHistory]),
        UserModule,
        AuthModule,
        MatchModule,
        HealthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }

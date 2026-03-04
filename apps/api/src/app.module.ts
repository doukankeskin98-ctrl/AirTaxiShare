import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MatchModule } from './match/match.module';
import { AdminModule } from './admin/admin.module';
import { TripRequest } from './match/trip-request.entity';
import { Rating } from './match/rating.entity';
import { MatchHistory } from './match/match-history.entity';
import { ChatMessage } from './match/chat-message.entity';
import { Report } from './match/report.entity';
import { HealthModule } from './health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
                PORT: Joi.number().default(10000),
                JWT_SECRET: Joi.string().required(),
                JWT_EXPIRATION: Joi.string().default('7d'),
                DATABASE_URL: Joi.string().optional(),
                DB_HOST: Joi.string().optional(),
                DB_PORT: Joi.number().optional(),
                DB_USER: Joi.string().optional(),
                DB_PASS: Joi.string().optional(),
                DB_NAME: Joi.string().optional(),
                REDIS_URL: Joi.string().optional(),
                ALLOWED_ORIGINS: Joi.string().optional(),
                FIREBASE_SERVICE_ACCOUNT_JSON: Joi.string().optional(),
            }),
        }),

        // ─── Rate Limiting ───────────────────────────────────────────
        ThrottlerModule.forRoot([{
            ttl: 60000,  // 60 seconds window
            limit: 1000, // 1000 req/min: comfortable for dev/demo, still protects against abuse
        }]),

        // ─── Database ────────────────────────────────────────────────
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const isProduction = process.env.NODE_ENV === 'production';
                const databaseUrl = configService.get<string>('DATABASE_URL');
                const isExternalDb = !!databaseUrl;

                const base = {
                    entities: [User, TripRequest, Rating, MatchHistory, ChatMessage, Report],
                    autoLoadEntities: true,
                    // Synchronize schema for new entities (chat_messages, reports, blockedUserIds).
                    // In mature production, switch to explicit migrations.
                    synchronize: true,
                    logging: (!isProduction && !isExternalDb) ? (['error'] as any) : false,
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

        TypeOrmModule.forFeature([User, TripRequest, Rating, MatchHistory, ChatMessage, Report]),
        UserModule,
        AuthModule,
        MatchModule,
        AdminModule,
        HealthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }

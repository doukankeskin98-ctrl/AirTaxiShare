import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MatchModule } from './match/match.module';
import { TripRequest } from './match/trip-request.entity';
import { Rating } from './match/rating.entity';
import { MatchHistory } from './match/match-history.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const isProduction = process.env.NODE_ENV === 'production';
                const databaseUrl = configService.get<string>('DATABASE_URL');

                if (databaseUrl) {
                    return {
                        type: 'postgres',
                        url: databaseUrl,
                        entities: [User, TripRequest, Rating, MatchHistory],
                        synchronize: true,
                        ssl: { rejectUnauthorized: false },
                    };
                }

                return {
                    type: 'postgres',
                    host: configService.get<string>('DB_HOST', 'localhost'),
                    port: configService.get<number>('DB_PORT', 5432),
                    username: configService.get<string>('DB_USER', 'airtaxi'),
                    password: configService.get<string>('DB_PASS', 'password'),
                    database: configService.get<string>('DB_NAME', 'airtaxi_db'),
                    entities: [User, TripRequest, Rating, MatchHistory],
                    synchronize: true,
                };
            },
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([User, TripRequest, Rating, MatchHistory]),
        UserModule,
        AuthModule,
        MatchModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }

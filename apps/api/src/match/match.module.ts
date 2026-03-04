import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TripRequest } from './trip-request.entity';
import { Rating } from './rating.entity';
import { MatchHistory } from './match-history.entity';
import { ChatMessage } from './chat-message.entity';
import { Report } from './report.entity';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MatchGateway } from './match.gateway';
import { UserModule } from '../user/user.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([TripRequest, Rating, MatchHistory, ChatMessage, Report]),
        UserModule,
        NotificationsModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                let secret = configService.get<string>('JWT_SECRET');
                if (!secret) {
                    secret = process.env.NODE_ENV === 'production'
                        ? 'ATS_PROD_FALLBACK_k9!H2$mQ8#vL5@pZ19xY'
                        : 'unsafe_fallback_secret_do_not_use_in_prod';
                }
                return { secret };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [MatchService, MatchGateway],
    controllers: [MatchController],
    exports: [MatchService],
})
export class MatchModule { }

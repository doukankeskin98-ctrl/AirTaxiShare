import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                let secret = configService.get<string>('JWT_SECRET');
                if (!secret) {
                    if (process.env.NODE_ENV === 'production') {
                        Logger.warn('CRITICAL SECURITY WARNING: JWT_SECRET is missing in production. Using a hardcoded persistent secret to prevent deploy failure while maintaining session persistence across Render wake cycles.', 'AuthModule');
                        secret = 'ATS_PROD_FALLBACK_k9!H2$mQ8#vL5@pZ19xY';
                    } else {
                        Logger.warn('SECURITY WARNING: JWT_SECRET missing in development. Using unsafe local fallback.', 'AuthModule');
                        secret = 'unsafe_fallback_secret_do_not_use_in_prod';
                    }
                }
                return {
                    secret,
                    signOptions: { expiresIn: '7d' },
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }

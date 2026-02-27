import { Module } from '@nestjs/common';
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
                        throw new Error('FATAL SECURITY ERROR: JWT_SECRET is missing in production environment. Refusing to boot to prevent zero-day vulnerability. PLEASE UPDATE RENDER DASHBOARD.');
                    }
                    console.warn('SECURITY WARNING: JWT_SECRET missing in development. Using unsafe local fallback.');
                    secret = 'dev-fallback-secret-unsafe';
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

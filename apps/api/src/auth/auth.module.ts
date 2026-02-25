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
                    console.error('CRITICAL SECURITY WARNING: JWT_SECRET environment variable is missing. Using fallback for Render deployment. PLEASE UPDATE RENDER DASHBOARD.');
                    secret = 'airtaxishare-render-fallback-secret-2026-c8f9q2!';
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

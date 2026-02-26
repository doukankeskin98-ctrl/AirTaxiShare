import { Controller, Post, Body, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
    EmailRegisterDto,
    EmailLoginDto,
    PhoneLoginDto,
    VerifyOtpDto,
    GoogleLoginDto,
    AppleLoginDto,
    AdminLoginDto,
} from './auth.dto';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
    constructor(private authService: AuthService) { }

    // --- EMAIL AUTH ---
    @Post('email-register')
    @HttpCode(HttpStatus.CREATED)
    async emailRegister(@Body() dto: EmailRegisterDto) {
        return this.authService.emailRegister(dto.email, dto.password, dto.fullName);
    }

    @Post('email-login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per 60 seconds
    async emailLogin(@Body() dto: EmailLoginDto) {
        return this.authService.emailLogin(dto.email, dto.password);
    }

    // --- ADMIN AUTH ---
    @Post('admin-login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // Stricter throttle for admin attempts
    async adminLogin(@Body() dto: AdminLoginDto) {
        return this.authService.adminLogin(dto.email, dto.password);
    }

    // --- PHONE OTP ---
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 OTP requests per minute
    async login(@Body() dto: PhoneLoginDto) {
        return this.authService.requestOtp(dto.phoneNumber);
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async verify(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto.phoneNumber, dto.code);
    }

    // --- SOCIAL AUTH ---
    @Post('google')
    @HttpCode(HttpStatus.OK)
    async googleLogin(@Body() dto: GoogleLoginDto) {
        return this.authService.verifyGoogleToken(dto.idToken);
    }

    @Post('apple')
    @HttpCode(HttpStatus.OK)
    async appleLogin(@Body() dto: AppleLoginDto) {
        return this.authService.verifyAppleToken(dto.identityToken, dto.fullName);
    }
}

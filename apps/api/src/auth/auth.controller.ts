import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    // --- EMAIL AUTH ---
    @Post('email-register')
    @HttpCode(HttpStatus.CREATED)
    async emailRegister(
        @Body('email') email: string,
        @Body('password') password: string,
        @Body('fullName') fullName?: string,
    ) {
        return this.authService.emailRegister(email, password, fullName);
    }

    @Post('email-login')
    @HttpCode(HttpStatus.OK)
    async emailLogin(
        @Body('email') email: string,
        @Body('password') password: string,
    ) {
        return this.authService.emailLogin(email, password);
    }

    // --- PHONE OTP ---
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body('phoneNumber') phoneNumber: string) {
        return this.authService.requestOtp(phoneNumber);
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verify(
        @Body('phoneNumber') phoneNumber: string,
        @Body('code') code: string,
    ) {
        return this.authService.verifyOtp(phoneNumber, code);
    }

    // --- SOCIAL AUTH ---
    @Post('google')
    @HttpCode(HttpStatus.OK)
    async googleLogin(@Body('idToken') idToken: string) {
        return this.authService.verifyGoogleToken(idToken);
    }

    @Post('apple')
    @HttpCode(HttpStatus.OK)
    async appleLogin(
        @Body('identityToken') identityToken: string,
        @Body('fullName') fullName?: string,
    ) {
        return this.authService.verifyAppleToken(identityToken, fullName);
    }
}

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

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

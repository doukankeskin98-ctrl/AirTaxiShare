import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    async requestOtp(phoneNumber: string): Promise<{ message: string; mockOtp: string }> {
        // In production, send SMS here.
        // For MVP/Dev, return the OTP.
        return {
            message: 'OTP sent (mock)',
            mockOtp: '123456',
        };
    }

    async verifyOtp(phoneNumber: string, code: string): Promise<{ accessToken: string; user: any }> {
        if (code !== '123456') {
            throw new UnauthorizedException('Invalid OTP');
        }

        // Find or Create User
        let user = await this.userService.findByPhoneNumber(phoneNumber);
        if (!user) {
            user = await this.userService.create(phoneNumber);
        }

        const payload = { sub: user.id, phoneNumber: user.phoneNumber, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user,
        };
    }

    async verifyGoogleToken(idToken: string): Promise<{ accessToken: string; user: any }> {
        // In a real application, you would use google-auth-library here.
        if (!idToken) throw new UnauthorizedException('Invalid Google Token');

        const mockEmail = 'mock@gmail.com'; // Extracted from token payload
        const mockGoogleId = 'google-12345'; // Extracted from token sub

        let user = await this.userService.findByGoogleId(mockGoogleId);

        if (!user) {
            // Alternatively, check if email exists and link account
            user = await this.userService.findByEmail(mockEmail);

            if (user) {
                // Link Google ID to existing email account
                user = await this.userService.update(user.id, { googleId: mockGoogleId });
            } else {
                // Create new user
                user = await this.userService.create(
                    undefined,
                    'Google User',
                    mockEmail,
                    mockGoogleId,
                    undefined
                );
            }
        }

        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user,
        };
    }

    async verifyAppleToken(identityToken: string, fullName?: string): Promise<{ accessToken: string; user: any }> {
        // In a real app, you would verify the Apple JWT identityToken.
        if (!identityToken) throw new UnauthorizedException('Invalid Apple Token');

        const mockEmail = 'mock@icloud.com';
        const mockAppleId = 'apple-12345';

        let user = await this.userService.findByAppleId(mockAppleId);

        if (!user) {
            user = await this.userService.findByEmail(mockEmail);

            if (user) {
                // Link Apple ID
                user = await this.userService.update(user.id, { appleId: mockAppleId });
            } else {
                // Create new user
                user = await this.userService.create(
                    undefined,
                    fullName || 'Apple User',
                    mockEmail,
                    undefined,
                    mockAppleId
                );
            }
        }

        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user,
        };
    }
}

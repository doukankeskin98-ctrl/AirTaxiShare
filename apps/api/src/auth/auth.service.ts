import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as crypto from 'crypto';

// Simple password hashing for MVP (use bcrypt in production)
function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    // --- EMAIL AUTH ---
    async emailRegister(email: string, password: string, fullName?: string): Promise<{ accessToken: string; user: any }> {
        // Check if email already exists
        const existing = await this.userService.findByEmail(email);
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const user = await this.userService.createWithEmail(
            email,
            hashPassword(password),
            fullName || 'New User',
        );

        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user: this.sanitizeUser(user),
        };
    }

    async emailLogin(email: string, password: string): Promise<{ accessToken: string; user: any }> {
        const user = await this.userService.findByEmail(email);
        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (user.passwordHash !== hashPassword(password)) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user: this.sanitizeUser(user),
        };
    }

    // --- PHONE OTP ---
    async requestOtp(phoneNumber: string): Promise<{ message: string; mockOtp: string }> {
        return {
            message: 'OTP sent (mock)',
            mockOtp: '123456',
        };
    }

    async verifyOtp(phoneNumber: string, code: string): Promise<{ accessToken: string; user: any }> {
        if (code !== '123456') {
            throw new UnauthorizedException('Invalid OTP');
        }

        let user = await this.userService.findByPhoneNumber(phoneNumber);
        if (!user) {
            user = await this.userService.create(phoneNumber);
        }

        const payload = { sub: user.id, phoneNumber: user.phoneNumber, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user: this.sanitizeUser(user),
        };
    }

    // --- SOCIAL AUTH ---
    async verifyGoogleToken(idToken: string): Promise<{ accessToken: string; user: any }> {
        if (!idToken) throw new UnauthorizedException('Invalid Google Token');

        const mockEmail = 'mock@gmail.com';
        const mockGoogleId = 'google-12345';

        let user = await this.userService.findByGoogleId(mockGoogleId);

        if (!user) {
            user = await this.userService.findByEmail(mockEmail);
            if (user) {
                user = await this.userService.update(user.id, { googleId: mockGoogleId });
            } else {
                user = await this.userService.create(undefined, 'Google User', mockEmail, mockGoogleId, undefined);
            }
        }

        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user: this.sanitizeUser(user),
        };
    }

    async verifyAppleToken(identityToken: string, fullName?: string): Promise<{ accessToken: string; user: any }> {
        if (!identityToken) throw new UnauthorizedException('Invalid Apple Token');

        const mockEmail = 'mock@icloud.com';
        const mockAppleId = 'apple-12345';

        let user = await this.userService.findByAppleId(mockAppleId);

        if (!user) {
            user = await this.userService.findByEmail(mockEmail);
            if (user) {
                user = await this.userService.update(user.id, { appleId: mockAppleId });
            } else {
                user = await this.userService.create(undefined, fullName || 'Apple User', mockEmail, undefined, mockAppleId);
            }
        }

        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user: this.sanitizeUser(user),
        };
    }

    private sanitizeUser(user: any) {
        const { passwordHash, ...safe } = user;
        return safe;
    }
}

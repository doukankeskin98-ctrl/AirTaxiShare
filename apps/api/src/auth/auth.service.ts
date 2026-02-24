import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    // --- EMAIL AUTH ---
    async emailRegister(email: string, password: string, fullName?: string): Promise<{ accessToken: string; user: any }> {
        const existing = await this.userService.findByEmail(email);
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.userService.createWithEmail(email, passwordHash, fullName || 'New User');

        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user: this.sanitizeUser(user),
        };
    }

    async emailLogin(email: string, password: string): Promise<{ accessToken: string; user: any }> {
        this.logger.log(`Attempting login: ${email}`);
        const user = await this.userService.findByEmail(email);

        if (!user) {
            this.logger.warn(`Login failed: User ${email} not found`);
            throw new UnauthorizedException('Invalid email or password');
        }

        if (!user.passwordHash) {
            this.logger.warn(`Login failed: User ${email} has no password (social account)`);
            throw new UnauthorizedException('Invalid email or password');
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            this.logger.warn(`Login failed: Wrong password for ${email}`);
            throw new UnauthorizedException('Invalid email or password');
        }

        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user: this.sanitizeUser(user),
        };
    }

    // --- PHONE OTP ---
    async requestOtp(phoneNumber: string): Promise<{ message: string }> {
        // In production, integrate Twilio Verify here:
        // await twilioClient.verify.v2.services(serviceSid).verifications.create({ to: phoneNumber, channel: 'sms' });
        this.logger.log(`OTP requested for ${phoneNumber}`);
        return { message: 'OTP sent' };
    }

    async verifyOtp(phoneNumber: string, code: string): Promise<{ accessToken: string; user: any }> {
        // In production, verify with Twilio:
        // const check = await twilioClient.verify.v2.services(serviceSid).verificationChecks.create({ to: phoneNumber, code });
        // if (check.status !== 'approved') throw new UnauthorizedException('Invalid OTP');

        // Development mock — accept '123456' only
        const devOtp = this.configService.get<string>('DEV_OTP', '123456');
        if (code !== devOtp) {
            throw new UnauthorizedException('Invalid OTP');
        }

        let user = await this.userService.findByPhoneNumber(phoneNumber);
        if (!user) {
            user = await this.userService.createWithPhone(phoneNumber);
        }

        const payload = { sub: user.id, phoneNumber: user.phoneNumber, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user: this.sanitizeUser(user),
        };
    }

    // --- SOCIAL AUTH ---
    async verifyGoogleToken(idToken: string): Promise<{ accessToken: string; user: any }> {
        let googleId: string;
        let email: string;
        let name: string;

        const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

        if (googleClientId) {
            // Production: real Google token verification
            try {
                const { OAuth2Client } = await import('google-auth-library');
                const client = new OAuth2Client(googleClientId);
                const ticket = await client.verifyIdToken({ idToken, audience: googleClientId });
                const gPayload = ticket.getPayload();
                if (!gPayload || !gPayload.sub) throw new Error('Invalid Google token');
                googleId = gPayload.sub;
                email = gPayload.email || '';
                name = gPayload.name || 'Google User';
            } catch (err) {
                this.logger.error('Google token verification failed:', err.message);
                throw new UnauthorizedException('Invalid Google token');
            }
        } else {
            // Development mock (no Google client ID configured)
            this.logger.warn('[DEV] Using mock Google auth — set GOOGLE_CLIENT_ID for production');
            googleId = `google-dev-${Buffer.from(idToken).toString('base64').substring(0, 12)}`;
            email = `google-${googleId}@dev.local`;
            name = 'Google Dev User';
        }

        let user = await this.userService.findByGoogleId(googleId);
        if (!user) {
            user = await this.userService.findByEmail(email);
            if (user) {
                user = await this.userService.update(user.id, { googleId });
            } else {
                user = await this.userService.createSocial({ googleId, email, fullName: name });
            }
        }

        const payload = { sub: user.id, email: user.email };
        return {
            accessToken: this.jwtService.sign(payload),
            user: this.sanitizeUser(user),
        };
    }

    async verifyAppleToken(identityToken: string, fullName?: string): Promise<{ accessToken: string; user: any }> {
        let appleId: string;
        let email: string;

        const appleClientId = this.configService.get<string>('APPLE_CLIENT_ID');

        if (appleClientId) {
            // Production: real Apple JWT verification via JWKS
            try {
                const appleSignin = await import('apple-signin-auth');
                const applePayload = await appleSignin.default.verifyIdToken(identityToken, {
                    audience: appleClientId,
                    ignoreExpiration: false,
                });
                appleId = applePayload.sub;
                email = applePayload.email || `apple-${appleId}@privaterelay.appleid.com`;
            } catch (err) {
                this.logger.error('Apple token verification failed:', err.message);
                throw new UnauthorizedException('Invalid Apple token');
            }
        } else {
            // Development mock
            this.logger.warn('[DEV] Using mock Apple auth — set APPLE_CLIENT_ID for production');
            appleId = `apple-dev-${Buffer.from(identityToken).toString('base64').substring(0, 12)}`;
            email = `apple-${appleId}@dev.local`;
        }

        let user = await this.userService.findByAppleId(appleId);
        if (!user) {
            user = await this.userService.findByEmail(email);
            if (user) {
                user = await this.userService.update(user.id, { appleId });
            } else {
                user = await this.userService.createSocial({ appleId, email, fullName: fullName || 'Apple User' });
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

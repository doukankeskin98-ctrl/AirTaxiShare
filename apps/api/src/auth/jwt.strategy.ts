import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private userService: UserService,
    ) {
        let secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            console.error('CRITICAL SECURITY WARNING: JWT_SECRET environment variable is missing.');
            secret = process.env.NODE_ENV === 'production'
                ? 'ATS_PROD_FALLBACK_k9!H2$mQ8#vL5@pZ19xY'
                : 'unsafe_fallback_secret_do_not_use_in_prod';
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        const user = await this.userService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}

import { Controller, Get, Put, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @Length(1, 100)
    fullName?: string;

    @IsOptional()
    @IsString()
    photoUrl?: string;

    @IsOptional()
    @IsString()
    @Length(7, 20)
    phoneNumber?: string;
}

class UpdatePushTokenDto {
    @IsString()
    @Length(1, 500)
    pushToken: string;
}

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    constructor(private userService: UserService) { }

    @Get('me')
    async getProfile(@Request() req: any) {
        const user = await this.userService.findById(req.user.id);
        if (!user) return { error: 'User not found' };
        const { passwordHash, ...safeUser } = user as any;
        return safeUser;
    }

    @Put('profile')
    async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
        const updated = await this.userService.update(req.user.id, dto);
        const { passwordHash, ...safeUser } = updated as any;
        return safeUser;
    }

    @Post('push-token')
    async updatePushToken(@Request() req: any, @Body() dto: UpdatePushTokenDto) {
        await this.userService.updatePushToken(req.user.id, dto.pushToken);
        return { success: true };
    }

    // Admin endpoint — returns all users (no sensitive fields)
    @Get('all')
    async getAllUsers() {
        return this.userService.findAll();
    }

    // Admin endpoint — returns aggregate stats
    @Get('stats')
    async getStats() {
        return this.userService.getStats();
    }
}

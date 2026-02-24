import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getProfile(@Request() req: any) {
        const user = await this.userService.findById(req.user.id);
        if (!user) {
            return { error: 'User not found' };
        }
        // Return safe user data (exclude password hash)
        const { passwordHash, ...safeUser } = user as any;
        return safeUser;
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('profile')
    async updateProfile(@Request() req: any, @Body() body: any) {
        const updateData: any = {};
        if (body.fullName) updateData.fullName = body.fullName;
        if (body.photoUrl) updateData.photoUrl = body.photoUrl;
        if (body.phoneNumber) updateData.phoneNumber = body.phoneNumber;

        const updated = await this.userService.update(req.user.id, updateData);
        const { passwordHash, ...safeUser } = updated as any;
        return safeUser;
    }
}

import { Controller, Get, Patch, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/user.entity';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('stats')
    getDashboardStats() {
        return this.adminService.getDashboardStats();
    }

    @Get('users')
    getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Get('logs')
    getRideLogs() {
        return this.adminService.getRideLogs();
    }

    @Patch('users/:id/status')
    async updateUserStatus(
        @Param('id') userId: string,
        @Body('status') status: string,
    ) {
        const validStatuses = ['ACTIVE', 'SUSPENDED', 'BLOCKED'];
        if (!validStatuses.includes(status)) {
            throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }
        return this.adminService.updateUserStatus(userId, status);
    }
}

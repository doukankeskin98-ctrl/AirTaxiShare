import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
    constructor(private matchService: MatchService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('request')
    async createRequest(@Request() req: any, @Body() body: any) {
        return this.matchService.createRequest(req.user.id, body);
    }
}

import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
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

    @UseGuards(AuthGuard('jwt'))
    @Post('rating')
    async submitRating(@Request() req: any, @Body() body: any) {
        return this.matchService.saveRating(req.user.id, {
            toUserId: body.toUserId,
            matchId: body.matchId,
            score: body.score,
            tags: body.tags,
            note: body.note,
        });
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('history')
    async getHistory(@Request() req: any) {
        return this.matchService.getHistory(req.user.id);
    }
}

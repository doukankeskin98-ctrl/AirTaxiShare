import { Controller, Post, Get, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MatchService } from './match.service';
import { SubmitRatingDto } from './match.dto';

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
    async submitRating(@Request() req: any, @Body() dto: SubmitRatingDto) {
        return this.matchService.saveRating(req.user.id, {
            toUserId: dto.toUserId,
            matchId: dto.matchId,
            score: dto.score,
            tags: dto.tags,
            note: dto.note,
        });
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('history')
    async getHistory(@Request() req: any) {
        return this.matchService.getHistory(req.user.id);
    }

    @Get('user/:id/reviews')
    async getUserReviews(@Param('id') id: string) {
        return this.matchService.getUserReviews(id);
    }

    // Admin endpoint — returns summary stats
    @Get('stats')
    async getStats() {
        return this.matchService.getAdminStats();
    }
}

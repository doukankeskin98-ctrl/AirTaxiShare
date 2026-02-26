import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../user/user.entity';
import { MatchHistory } from '../match/match-history.entity';
import { TripRequest } from '../match/trip-request.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, MatchHistory, TripRequest])],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule { }

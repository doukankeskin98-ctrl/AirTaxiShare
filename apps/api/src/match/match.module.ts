import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripRequest } from './trip-request.entity';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MatchGateway } from './match.gateway';

@Module({
    imports: [TypeOrmModule.forFeature([TripRequest])],
    providers: [MatchService, MatchGateway],
    controllers: [MatchController],
    exports: [MatchService],
})
export class MatchModule { }

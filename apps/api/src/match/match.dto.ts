import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max, IsArray } from 'class-validator';

export class SubmitRatingDto {
    @IsString()
    @IsNotEmpty()
    toUserId: string;

    @IsString()
    @IsNotEmpty()
    matchId: string;

    @IsNumber()
    @Min(1)
    @Max(5)
    score: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsString()
    @IsOptional()
    note?: string;
}

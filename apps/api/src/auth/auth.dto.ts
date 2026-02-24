import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class EmailRegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsString()
    @Length(1, 100)
    fullName?: string;
}

export class EmailLoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class PhoneLoginDto {
    @IsString()
    @IsNotEmpty()
    @Length(7, 20)
    phoneNumber: string;
}

export class VerifyOtpDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @Length(4, 8)
    code: string;
}

export class GoogleLoginDto {
    @IsString()
    @IsNotEmpty()
    idToken: string;
}

export class AppleLoginDto {
    @IsString()
    @IsNotEmpty()
    identityToken: string;

    @IsOptional()
    @IsString()
    @Length(1, 100)
    fullName?: string;
}

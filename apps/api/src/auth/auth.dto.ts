import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MinLength, MaxLength } from 'class-validator';

export class EmailRegisterDto {
    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(100)
    password: string;

    @IsOptional()
    @IsString()
    @Length(1, 100)
    fullName?: string;
}

export class EmailLoginDto {
    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    password: string;
}

export class AdminLoginDto {
    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
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
    @MaxLength(20)
    phoneNumber: string;

    @IsString()
    @Length(4, 8)
    code: string;
}

export class GoogleLoginDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(4000)
    idToken: string;
}

export class AppleLoginDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(4000)
    identityToken: string;

    @IsOptional()
    @IsString()
    @Length(1, 100)
    fullName?: string;
}

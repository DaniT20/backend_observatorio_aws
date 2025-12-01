import {
    IsArray,
    IsDateString,
    IsIn,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateLoginTraceDto {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    sub?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    groups?: string[];

    // opcional: fecha enviada por el front; el backend de todas formas puede usar la suya
    @IsOptional()
    @IsDateString()
    when?: string;

    @IsOptional()
    @IsString()
    userAgent?: string;

    @IsOptional()
    @IsIn(['login', 'logout'])
    action?: string;

    @IsOptional()
    @IsString()
    path?: string;
}

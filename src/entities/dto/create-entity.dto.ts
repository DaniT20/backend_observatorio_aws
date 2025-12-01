import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateEntityDto {
    @IsString()
    @MinLength(3)
    @MaxLength(80)
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(300)
    description?: string;

    @IsString()
    @MinLength(3)
    @MaxLength(100)
    path: string; // slug único
}

import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateFileTraceDto {
    @IsString()
    uploaderId: string;

    @IsOptional()
    @IsString()
    uploaderName?: string;

    @IsOptional()
    @IsString()
    uploaderEmail?: string;

    @IsOptional()
    @IsString()
    entityId?: string;

    @IsOptional()
    @IsString()
    entityName?: string;

    @IsString()
    fileName: string;

    @IsString()
    s3Key: string;

    @IsString()
    bucket: string;

    @IsOptional()
    @IsNumber()
    fileSize?: number;

    @IsOptional()
    @IsString()
    mimeType?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    isProcess?: boolean;

    @IsOptional()
    @IsString()
    response?: {};

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsString()
    checksum?: string;
}

/* import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  @UseGuards(JwtAuthGuard)
  @Get('presign')
  async getPresign(
    @Req() req: Request,
    @Query('filename') filename: string,
    @Query('type') type = 'application/octet-stream',
    @Query('entityId') entityId?: string,
    @Query('entityName') entityName?: string,
    @Query('size') size?: string,
    @Query('uploadDate') uploadDate?: string,
  ) {
    if (!filename) {
      return { error: 'Falta filename' };
    }

    const user = (req as any).user;

    return this.uploadsService.getPresignedUrl({
      filename,
      type,
      entityId,
      entityName,
      size: size ? Number(size) : undefined,
      uploadDate,
      user,
      req,
    });
  }

}
 */

// uploads.controller.ts
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // ============================================
  // 1) Presign (lo de siempre, sin ver el archivo)
  // ============================================
  @UseGuards(JwtAuthGuard)
  @Get('presign')
  async getPresign(
    @Req() req: Request,
    @Query('filename') filename: string,
    @Query('type') type = 'text/csv',
    @Query('entityId') entityId?: string,
    @Query('entityName') entityName?: string,
    @Query('size') size?: string,
    @Query('uploadDate') uploadDate?: string,
  ) {
    if (!filename) {
      throw new BadRequestException('Falta filename');
    }

    const lowerName = filename.toLowerCase();
    if (!lowerName.endsWith('.csv')) {
      throw new BadRequestException('Solo se permiten archivos con extensión .csv');
    }

    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv'];
    if (type && !allowedTypes.includes(type)) {
      throw new BadRequestException('El tipo de archivo debe ser CSV');
    }

    const maxSize = 25 * 1024 * 1024; // 25 MB
    const numericSize = size ? Number(size) : undefined;
    if (numericSize && numericSize > maxSize) {
      throw new BadRequestException(
        `El archivo supera el tamaño máximo permitido (${maxSize} bytes)`,
      );
    }

    const user = (req as any).user;

    return this.uploadsService.getPresignedUrl({
      filename,
      type,
      entityId,
      entityName,
      size: numericSize,
      uploadDate,
      user,
      req,
    });
  }

  // ============================================
  // 2) Subida CSV con validación fuerte UTF-8
  // ============================================
  @UseGuards(JwtAuthGuard)
  @Post('csv')
  @UseInterceptors(FileInterceptor('file')) // campo "file" en multipart/form-data
  async uploadCsv(
    @Req() req: Request,
    @UploadedFile() file: any,
    @Query('entityId') entityId?: string,
    @Query('entityName') entityName?: string,
    @Query('uploadDate') uploadDate?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    const user = (req as any).user;

    return this.uploadsService.uploadCsvValidated({
      file,
      entityId,
      entityName,
      uploadDate,
      user,
      req,
    });
  }
}

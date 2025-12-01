import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
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

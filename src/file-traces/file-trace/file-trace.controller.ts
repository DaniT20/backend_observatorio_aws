import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth/jwt-auth.guard';
import { FileTraceService } from './file-trace.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileTraceController {
    constructor(private readonly fileTraceService: FileTraceService) { }

    @Get('traces')
    async getTraces(
        @Query('entityId') entityId?: string,
        @Query('uploaderId') uploaderId?: string,
        @Query('fileName') fileName?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('limit') limit?: string,
        @Query('skip') skip?: string,
    ) {
        const data = await this.fileTraceService.search({
            entityId,
            uploaderId,
            fileName,
            startDate,
            endDate,
            limit: limit ? +limit : undefined,
            skip: skip ? +skip : undefined,
        });

        return { ok: true, ...data };
    }

    // si quieres, aquí puedes mantener también by-entity o by-user
}

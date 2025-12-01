import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { FileTraceModule } from 'src/file-traces/file-trace/file-trace.module';
import { EntitiesModule } from 'src/entities/entities.module';

@Module({
    controllers: [UploadsController],
    providers: [UploadsService],
    imports: [FileTraceModule, EntitiesModule]
})
export class UploadsModule { }

/* import { Module } from '@nestjs/common';
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
 */

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';

import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

import { FileTraceModule } from 'src/file-traces/file-trace/file-trace.module';
import { EntitiesModule } from 'src/entities/entities.module';

@Module({
    imports: [
        // ============================================
        //  Necesario para validar UTF-8 en el backend
        // ============================================
        MulterModule.register({
            storage: multer.memoryStorage(),      // <-- file.buffer habilitado
            limits: {
                fileSize: 25 * 1024 * 1024,        // 25 MB (mismo límite del frontend)
            },
        }),

        FileTraceModule,
        EntitiesModule,
    ],

    controllers: [UploadsController],
    providers: [UploadsService],
    exports: [UploadsService],
})
export class UploadsModule { }

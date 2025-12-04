/* import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../common/config';
import { FileTraceService } from '../file-traces/file-trace/file-trace.service';
import { CreateFileTraceDto } from '../file-traces/dto/create-file-trace.dto';
import { Request } from 'express';
import { EntitiesService } from '../entities/entities.service';

interface PresignParams {
    filename: string;
    type: string;
    entityId?: string;
    entityName?: string;
    size?: number;
    uploadDate?: string;   // 👈 ahora opcional y string
    user?: any;            // payload Cognito
    req: Request;
}

@Injectable()
export class UploadsService {
    private s3 = new S3Client({
        region: config.aws.region,
        credentials: config.aws.credentials,
    });

    constructor(
        private readonly fileTraceService: FileTraceService,
        private readonly entitiesService: EntitiesService,
    ) { }

    async getPresignedUrl(params: PresignParams) {
        const { filename, type, entityId, size, uploadDate, user, req } = params;

        // ============================
        // 0) Resolver fecha efectiva
        // ============================
        // uploadDate viene como 'YYYY-MM-DD' desde el front.
        // Si no viene o viene mal, usamos la fecha de hoy.
        let year: string;
        let month: string;
        let day: string;

        if (uploadDate && /^\d{4}-\d{2}-\d{2}$/.test(uploadDate)) {
            [year, month, day] = uploadDate.split('-'); // ej: '2025-11-14'
        } else {
            const now = new Date();
            year = String(now.getFullYear());
            month = String(now.getMonth() + 1).padStart(2, '0');
            day = String(now.getDate()).padStart(2, '0');
        }

        console.log('uploadDate (raw): ', uploadDate);
        console.log('carpetas => ', { year, month, day });

        // info de usuario desde Cognito
        const sub = user?.sub || 'anonymous';
        const uploaderEmail = user?.email ?? null;
        const uploaderName = user?.name ?? null;

        // ============================
        // 1) Obtener entidad (si viene)
        // ============================
        let s3Prefix: string;
        let entityName: string | undefined = params.entityName;

        if (entityId) {
            try {
                const entity = await this.entitiesService.findOne(entityId);

                // Si tu entidad tiene .path y .name:
                const basePath = entity?.path ?? ''; // ej: "Bronce/ECU911/"
                entityName = entityName ?? entity?.name ?? undefined;

                // normalizamos el prefijo
                s3Prefix = (basePath || '').trim();
                // quitamos slashes iniciales
                s3Prefix = s3Prefix.replace(/^\/+/, '');
                // nos aseguramos de terminar en "/"
                if (!s3Prefix.endsWith('/')) {
                    s3Prefix += '/';
                }
            } catch (err) {
                console.warn('No se pudo obtener la entidad, usando prefijo por defecto', err);
                s3Prefix = `uploads/${sub}/`;
            }
        } else {
            // sin entidad: prefijo por defecto
            s3Prefix = `uploads/${sub}/`;
        }

        // ============================
        // 2) Armar key de S3 usando path + particiones
        // ============================
        // Quedará algo como:
        //   Bronce/ECU911/year=2025/month=11/day=14/173126123123-archivo.csv
        // o
        //   uploads/<sub>/year=2025/month=11/day=14/...
        const prefixWithDate = `${s3Prefix}year=${year}/month=${month}/day=${day}/`;
        const key = `${prefixWithDate}${Date.now()}-${filename}`;

        const cmd = new PutObjectCommand({
            Bucket: config.aws.bucket,
            Key: key,
            ContentType: type,
        });

        const url = await getSignedUrl(this.s3, cmd, { expiresIn: 60 });

        // ============================
        // 3) Registrar trazabilidad
        // ============================
        const traceDto: CreateFileTraceDto = {
            uploaderId: sub,
            uploaderName,
            uploaderEmail,
            entityId,
            entityName,
            fileName: filename,
            s3Key: key,
            bucket: config.aws.bucket,
            fileSize: size,
            mimeType: type,
            isProcess: false, // luego lo puedes actualizar a 'uploaded'
            response: {},
        };

        await this.fileTraceService.create(traceDto, req);

        return {
            url,
            method: 'PUT' as const,
            headers: { 'Content-Type': type },
            key,
        };
    }
}
 */

// uploads.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../common/config';
import { FileTraceService } from '../file-traces/file-trace/file-trace.service';
import { CreateFileTraceDto } from '../file-traces/dto/create-file-trace.dto';
import { Request } from 'express';
import { EntitiesService } from '../entities/entities.service';

interface PresignParams {
    filename: string;
    type: string;
    entityId?: string;
    entityName?: string;
    size?: number;
    uploadDate?: string;
    user?: any;
    req: Request;
}

interface CsvUploadParams {
    file: any;
    entityId?: string;
    entityName?: string;
    uploadDate?: string;
    user?: any;
    req: Request;
}

@Injectable()
export class UploadsService {
    private s3 = new S3Client({
        region: config.aws.region,
        credentials: config.aws.credentials,
    });

    constructor(
        private readonly fileTraceService: FileTraceService,
        private readonly entitiesService: EntitiesService,
    ) { }

    // ==========================
    // A) Presign (como ya tenías)
    // ==========================
    async getPresignedUrl(params: PresignParams) {
        const { filename, type, entityId, size, uploadDate, user, req } = params;

        // Resolver fecha
        let year: string;
        let month: string;
        let day: string;

        if (uploadDate && /^\d{4}-\d{2}-\d{2}$/.test(uploadDate)) {
            [year, month, day] = uploadDate.split('-');
        } else {
            const now = new Date();
            year = String(now.getFullYear());
            month = String(now.getMonth() + 1).padStart(2, '0');
            day = String(now.getDate()).padStart(2, '0');
        }

        console.log('uploadDate (raw): ', uploadDate);
        console.log('carpetas => ', { year, month, day });

        const sub = user?.sub || 'anonymous';
        const uploaderEmail = user?.email ?? null;
        const uploaderName = user?.name ?? null;

        // Prefijo S3 por entidad
        let s3Prefix: string;
        let entityName: string | undefined = params.entityName;

        if (entityId) {
            try {
                const entity = await this.entitiesService.findOne(entityId);
                const basePath = entity?.path ?? ''; // ej: "Bronce/ECU911/"
                entityName = entityName ?? entity?.name ?? undefined;

                s3Prefix = (basePath || '').trim();
                s3Prefix = s3Prefix.replace(/^\/+/, '');
                if (!s3Prefix.endsWith('/')) {
                    s3Prefix += '/';
                }
            } catch (err) {
                console.warn(
                    'No se pudo obtener la entidad, usando prefijo por defecto',
                    err,
                );
                s3Prefix = `uploads/${sub}/`;
            }
        } else {
            s3Prefix = `uploads/${sub}/`;
        }

        const prefixWithDate = `${s3Prefix}year=${year}/month=${month}/day=${day}/`;
        const key = `${prefixWithDate}${Date.now()}-${filename}`;

        const cmd = new PutObjectCommand({
            Bucket: config.aws.bucket,
            Key: key,
            ContentType: 'text/csv; charset=utf-8',
        });

        const url = await getSignedUrl(this.s3, cmd, { expiresIn: 60 });

        const traceDto: CreateFileTraceDto = {
            uploaderId: sub,
            uploaderName,
            uploaderEmail,
            entityId,
            entityName,
            fileName: filename,
            s3Key: key,
            bucket: config.aws.bucket,
            fileSize: size,
            mimeType: type,
            isProcess: false,
            response: {},
        };

        await this.fileTraceService.create(traceDto, req);

        return {
            url,
            method: 'PUT' as const,
            headers: { 'Content-Type': type },
            key,
        };
    }

    // ===============================================
    // B) Subida CSV con validación fuerte de UTF-8
    // ===============================================
    async uploadCsvValidated(params: CsvUploadParams) {
        const { file, entityId, entityName: entityNameFromReq, uploadDate, user, req } =
            params;

        const filename = file.originalname;
        const lowerName = filename.toLowerCase();

        // 1. Validar extensión
        if (!lowerName.endsWith('.csv')) {
            throw new BadRequestException('Solo se permiten archivos con extensión .csv');
        }

        // 2. Validar MIME "tipo CSV"
        const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', ''];
        if (file.mimetype && !allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException('El tipo de archivo debe ser CSV');
        }

        // 3. Validar tamaño (por si acaso, además de Multer)
        const maxSize = 25 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException(
                `El archivo supera el tamaño máximo permitido (${maxSize} bytes)`,
            );
        }

        // 4. Validar que haya buffer
        const buffer = file.buffer;
        if (!buffer) {
            throw new BadRequestException('No se pudo leer el contenido del archivo');
        }

        // 5. Validar UTF-8 (aquí está la validación fuerte)
        try {
            // Para archivos muy grandes podrías tomar solo una muestra:
            // const sample = buffer.subarray(0, Math.min(buffer.length, 1024 * 1024));
            new TextDecoder('utf-8', { fatal: true }).decode(buffer);
        } catch (err) {
            throw new BadRequestException(
                'El archivo debe estar codificado en UTF-8. No se ha subido a S3.',
            );
        }

        // 6. Resolver fecha
        let year: string;
        let month: string;
        let day: string;

        if (uploadDate && /^\d{4}-\d{2}-\d{2}$/.test(uploadDate)) {
            [year, month, day] = uploadDate.split('-');
        } else {
            const now = new Date();
            year = String(now.getFullYear());
            month = String(now.getMonth() + 1).padStart(2, '0');
            day = String(now.getDate()).padStart(2, '0');
        }

        const sub = user?.sub || 'anonymous';
        const uploaderEmail = user?.email ?? null;
        const uploaderName = user?.name ?? null;

        // 7. Prefijo S3 (misma lógica que presign)
        let s3Prefix: string;
        let entityName: string | undefined = entityNameFromReq;

        if (entityId) {
            try {
                const entity = await this.entitiesService.findOne(entityId);
                const basePath = entity?.path ?? '';
                entityName = entityName ?? entity?.name ?? undefined;

                s3Prefix = (basePath || '').trim();
                s3Prefix = s3Prefix.replace(/^\/+/, '');
                if (!s3Prefix.endsWith('/')) {
                    s3Prefix += '/';
                }
            } catch (err) {
                console.warn(
                    'No se pudo obtener la entidad, usando prefijo por defecto',
                    err,
                );
                s3Prefix = `uploads/${sub}/`;
            }
        } else {
            s3Prefix = `uploads/${sub}/`;
        }

        const prefixWithDate = `${s3Prefix}year=${year}/month=${month}/day=${day}/`;
        const key = `${prefixWithDate}${Date.now()}-${filename}`;

        // 8. Subir a S3 (aquí recién toca S3)
        const cmd = new PutObjectCommand({
            Bucket: config.aws.bucket,
            Key: key,
            Body: buffer,
            ContentType: 'text/csv; charset=utf-8',
        });

        await this.s3.send(cmd);

        // 9. Registrar trazabilidad
        const traceDto: CreateFileTraceDto = {
            uploaderId: sub,
            uploaderName,
            uploaderEmail,
            entityId,
            entityName,
            fileName: filename,
            s3Key: key,
            bucket: config.aws.bucket,
            fileSize: file.size,
            mimeType: 'text/csv; charset=utf-8',
            isProcess: false,
            response: {},
        };

        await this.fileTraceService.create(traceDto, req);

        return {
            ok: true,
            message: 'Archivo CSV subido correctamente (UTF-8 válido)',
            key,
            bucket: config.aws.bucket,
        };
    }
}


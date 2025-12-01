import { Injectable } from '@nestjs/common';
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

import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
    DynamoDBDocumentClient,
    PutCommand,
    ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DYNAMO_CLIENT } from 'src/common/dynamodb/dynamodb.module';
import { FileTrace } from '../schemas/file-trace.schema';
import { CreateFileTraceDto } from '../dto/create-file-trace.dto';

@Injectable()
export class FileTraceService {
    private readonly tableName = process.env.DDB_FILE_TRACES_TABLE || 'file_traces';

    constructor(
        @Inject(DYNAMO_CLIENT)
        private readonly ddb: DynamoDBDocumentClient,
    ) { }

    async create(dto: CreateFileTraceDto, req: Request): Promise<FileTrace> {
        const ip = this.getIp(req);
        const now = new Date().toISOString();
        const id = uuidv4();

        const item: FileTrace = {
            id,
            _id: id,
            uploaderId: dto.uploaderId,
            uploaderName: dto.uploaderName,
            uploaderEmail: dto.uploaderEmail,
            entityId: dto.entityId,
            entityName: dto.entityName,
            fileName: dto.fileName,
            s3Key: dto.s3Key,
            bucket: dto.bucket,
            fileSize: dto.fileSize,
            mimeType: dto.mimeType,
            status: dto.status ?? 'pending',
            isProcess: dto.isProcess ?? false,
            response: dto.response,
            ipAddress: ip,
            userAgent: req.headers['user-agent'] as string | undefined,
            checksum: dto.checksum,
            tags: dto.tags ?? [],
            uploadDate: now,
            createdAt: now,
            updatedAt: now,
        };

        await this.ddb.send(
            new PutCommand({
                TableName: this.tableName,
                Item: item,
            }),
        );

        return item;
    }

    async search(query: {
        entityId?: string;
        uploaderId?: string;
        fileName?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
        skip?: number;
    }): Promise<{ total: number; results: FileTrace[] }> {
        // 🔎 Versión simple: Scan + filtros en memoria
        const res = await this.ddb.send(
            new ScanCommand({
                TableName: this.tableName,
            }),
        );

        let items = (res.Items || []) as FileTrace[];

        if (query.entityId) {
            items = items.filter((i) => i.entityId === query.entityId);
        }

        if (query.uploaderId) {
            items = items.filter((i) => i.uploaderId === query.uploaderId);
        }

        if (query.fileName) {
            const q = query.fileName.toLowerCase();
            items = items.filter((i) =>
                i.fileName.toLowerCase().includes(q),
            );
        }

        if (query.startDate || query.endDate) {
            const start = query.startDate
                ? new Date(query.startDate).getTime()
                : undefined;
            const end = query.endDate
                ? new Date(query.endDate).getTime()
                : undefined;

            items = items.filter((i) => {
                const t = new Date(i.uploadDate).getTime();
                if (start !== undefined && t < start) return false;
                if (end !== undefined && t > end) return false;
                return true;
            });
        }

        // orden por uploadDate DESC (como sort({ uploadDate: -1 }))
        items.sort(
            (a, b) =>
                new Date(b.uploadDate).getTime() -
                new Date(a.uploadDate).getTime(),
        );

        const limit = Math.min(Number(query.limit) || 50, 200);
        const skip = Number(query.skip) || 0;

        const total = items.length;
        const results = items.slice(skip, skip + limit);

        return { total, results };
    }

    private getIp(req: Request): string | undefined {
        const xf = req.headers['x-forwarded-for'];
        if (Array.isArray(xf)) {
            return xf[0];
        }
        if (typeof xf === 'string') {
            return xf.split(',')[0].trim();
        }
        return (req as any).ip || req.socket.remoteAddress || undefined;
    }

    async findByEntity(entityId: string): Promise<FileTrace[]> {
        const res = await this.ddb.send(
            new ScanCommand({
                TableName: this.tableName,
            }),
        );
        const items = (res.Items || []) as FileTrace[];
        return items
            .filter((i) => i.entityId === entityId)
            .sort(
                (a, b) =>
                    new Date(b.uploadDate).getTime() -
                    new Date(a.uploadDate).getTime(),
            );
    }

    async findByUploader(uploaderId: string): Promise<FileTrace[]> {
        const res = await this.ddb.send(
            new ScanCommand({
                TableName: this.tableName,
            }),
        );
        const items = (res.Items || []) as FileTrace[];
        return items
            .filter((i) => i.uploaderId === uploaderId)
            .sort(
                (a, b) =>
                    new Date(b.uploadDate).getTime() -
                    new Date(a.uploadDate).getTime(),
            );
    }
}

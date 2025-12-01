// src/file-traces/schemas/file-trace.schema.ts

export interface FileTrace {
    id: string;          // PK en Dynamo
    _id: string;         // alias para compatibilidad
    uploaderId: string;
    uploaderName?: string;
    uploaderEmail?: string;

    entityId?: string;
    entityName?: string;

    fileName: string;
    s3Key: string;
    bucket: string;

    fileSize?: number;
    mimeType?: string;
    status: string;
    isProcess: boolean;      // true | false
    response: {};

    ipAddress?: string;
    userAgent?: string;
    checksum?: string;

    tags?: string[];

    uploadDate: string;  // ISO
    createdAt: string;
    updatedAt: string;
}

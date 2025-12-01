// src/auth/login-trace/schemas/login-trace.schema.ts

export interface LoginTrace {
    id: string;          // PK en Dynamo
    _id: string;         // alias para compatibilidad

    username?: string;
    sub?: string;
    email?: string;
    name?: string;
    groups?: string[];

    when: string;        // ISO

    userAgent?: string;
    ip?: string;
    action: string;      // login | logout
    path?: string;

    createdAt: string;
    updatedAt: string;
}

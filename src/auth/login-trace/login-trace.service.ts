import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DYNAMO_CLIENT } from 'src/common/dynamodb/dynamodb.module';
import { LoginTrace } from '../schemas/login-trace.schema';
import { CreateLoginTraceDto } from '../dto/create-login-trace.dto';

@Injectable()
export class LoginTraceService {
  private readonly tableName =
    process.env.DDB_LOGIN_TRACES_TABLE || 'login_traces';

  constructor(
    @Inject(DYNAMO_CLIENT)
    private readonly ddb: DynamoDBDocumentClient,
  ) { }

  async create(dto: CreateLoginTraceDto, req: Request): Promise<LoginTrace> {
    const ip = this.getIpFromRequest(req);
    const whenDate = dto.when ? new Date(dto.when) : new Date();
    const now = new Date().toISOString();
    const id = uuidv4();

    const item: LoginTrace = {
      id,
      _id: id,
      username: dto.username,
      sub: dto.sub,
      email: dto.email,
      name: dto.name,
      groups: dto.groups ?? [],
      when: whenDate.toISOString(),
      userAgent:
        dto.userAgent || (req.headers['user-agent'] as string) || undefined,
      ip,
      action: dto.action || 'login',
      path: dto.path || req.url,
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

  private getIpFromRequest(req: Request): string | undefined {
    const xff = req.headers['x-forwarded-for'];
    if (Array.isArray(xff)) {
      return xff[0];
    }
    if (typeof xff === 'string') {
      return xff.split(',')[0].trim();
    }
    return (req as any).ip || req.socket.remoteAddress || undefined;
  }

  async findAll(query: {
    username?: string;
    email?: string;
    group?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ total: number; results: LoginTrace[] }> {
    const res = await this.ddb.send(
      new ScanCommand({
        TableName: this.tableName,
      }),
    );

    let items = (res.Items || []) as LoginTrace[];

    if (query.username) {
      items = items.filter((i) => i.username === query.username);
    }

    if (query.email) {
      items = items.filter((i) => i.email === query.email);
    }

    if (query.group) {
      items = items.filter((i) => i.groups?.includes(query.group!));
    }

    if (query.startDate || query.endDate) {
      const start = query.startDate
        ? new Date(query.startDate).getTime()
        : undefined;
      const end = query.endDate
        ? new Date(query.endDate).getTime()
        : undefined;

      items = items.filter((i) => {
        const t = new Date(i.when).getTime();
        if (start !== undefined && t < start) return false;
        if (end !== undefined && t > end) return false;
        return true;
      });
    }

    // orden por when DESC (equivalente a sort({ when: -1 }))
    items.sort(
      (a, b) =>
        new Date(b.when).getTime() - new Date(a.when).getTime(),
    );

    const limit = Math.min(Number(query.limit) || 50, 200);
    const skip = Number(query.skip) || 0;

    const total = items.length;
    const results = items.slice(skip, skip + limit);

    return { total, results };
  }
}

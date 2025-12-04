/* import { Inject, Injectable } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DYNAMO_CLIENT } from 'src/common/dynamodb/dynamodb.module';
import { Entity } from './schemas/entity.schema';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';

@Injectable()
export class EntitiesService {
  private readonly tableName = process.env.DDB_ENTITIES_TABLE || 'entities';

  constructor(
    @Inject(DYNAMO_CLIENT)
    private readonly ddb: DynamoDBDocumentClient,
  ) { }

  async create(data: CreateEntityDto): Promise<Entity> {
    const now = new Date().toISOString();
    const id = uuidv4();

    const item: Entity = {
      id,
      _id: id,
      name: data.name,
      description: data.description,
      path: data.path,
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

  async findAll(): Promise<Entity[]> {
    const res = await this.ddb.send(
      new ScanCommand({
        TableName: this.tableName,
      }),
    );

    const items = (res.Items || []) as Entity[];
    // Mantenemos el sort por name como hacías con Mongo
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findOne(id: string): Promise<Entity | null> {
    const res = await this.ddb.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    return (res.Item as Entity) || null;
  }

  async update(id: string, data: UpdateEntityDto): Promise<Entity | null> {
    const existing = await this.findOne(id);
    if (!existing) {
      return null;
    }

    const updated: Entity = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.ddb.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      }),
    );

    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.ddb.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );
  }
}
 */

import { Inject, Injectable } from '@nestjs/common';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { DYNAMO_CLIENT } from 'src/common/dynamodb/dynamodb.module';
import { Entity } from './schemas/entity.schema';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';

@Injectable()
export class EntitiesService {
  private readonly tableName = process.env.DDB_ENTITIES_TABLE || 'entities';

  constructor(
    @Inject(DYNAMO_CLIENT)
    private readonly ddb: DynamoDBDocumentClient,
  ) { }

  async create(data: CreateEntityDto): Promise<Entity> {
    const now = new Date().toISOString();
    const id = uuidv4();

    const item: Entity = {
      id,
      _id: id,
      name: data.name,
      description: data.description,
      path: data.path,

      // 👇 nuevo: si no envías nada, dejamos undefined o []
      columns: data.columns ?? [],

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

  async findAll(): Promise<Entity[]> {
    const res = await this.ddb.send(
      new ScanCommand({
        TableName: this.tableName,
      }),
    );

    const items = (res.Items || []) as Entity[];
    // sort por name como hacías con Mongo
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findOne(id: string): Promise<Entity | null> {
    const res = await this.ddb.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    return (res.Item as Entity) || null;
  }

  async update(id: string, data: UpdateEntityDto): Promise<Entity | null> {
    const existing = await this.findOne(id);
    if (!existing) {
      return null;
    }

    const updated: Entity = {
      ...existing,
      ...data,                     // 👈 aquí puede venir data.columns
      updatedAt: new Date().toISOString(),
    };

    await this.ddb.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updated,
      }),
    );

    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.ddb.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );
  }
}

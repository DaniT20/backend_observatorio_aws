import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UploadsModule } from './uploads/uploads.module';
import { EntitiesModule } from './entities/entities.module';
import { LoginTraceModule } from './auth/login-trace/login-trace.module';
import { FileTraceModule } from './file-traces/file-trace/file-trace.module';
import { DynamoDbModule } from './common/dynamodb/dynamodb.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DynamoDbModule,       // cliente DynamoDB disponible globalmente
    UploadsModule,
    EntitiesModule,
    LoginTraceModule,
    FileTraceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

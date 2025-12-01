import { Module } from '@nestjs/common';
import { FileTraceService } from './file-trace.service';
import { FileTraceController } from './file-trace.controller';
import { DynamoDbModule } from 'src/common/dynamodb/dynamodb.module';

@Module({
  imports: [DynamoDbModule],
  providers: [FileTraceService],
  exports: [FileTraceService],
  controllers: [FileTraceController],
})
export class FileTraceModule { }

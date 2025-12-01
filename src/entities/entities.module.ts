import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { DynamoDbModule } from 'src/common/dynamodb/dynamodb.module';

@Module({
  imports: [DynamoDbModule],
  controllers: [EntitiesController],
  providers: [EntitiesService],
  exports: [EntitiesService],
})
export class EntitiesModule { }

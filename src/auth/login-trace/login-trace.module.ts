import { Module } from '@nestjs/common';
import { LoginTraceService } from './login-trace.service';
import { LoginTraceController } from './login-trace.controller';
import { DynamoDbModule } from 'src/common/dynamodb/dynamodb.module';

@Module({
    imports: [DynamoDbModule],
    controllers: [LoginTraceController],
    providers: [LoginTraceService],
    exports: [LoginTraceService],
})
export class LoginTraceModule { }

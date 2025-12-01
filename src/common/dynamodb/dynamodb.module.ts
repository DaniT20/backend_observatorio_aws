import { Module } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { config } from '../config';

export const DYNAMO_CLIENT = 'DYNAMO_CLIENT';

@Module({
    providers: [
        {
            provide: DYNAMO_CLIENT,
            useFactory: () => {
                const client = new DynamoDBClient({
                    region: config.aws.region,
                    credentials: config.aws.credentials,
                });

                return DynamoDBDocumentClient.from(client, {
                    marshallOptions: {
                        removeUndefinedValues: true,
                    },
                });
            },
        },
    ],
    exports: [DYNAMO_CLIENT],
})
export class DynamoDbModule { }

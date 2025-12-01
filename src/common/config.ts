import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: Number(process.env.PORT ?? 3000),
    aws: {
        region: process.env.AWS_REGION!,
        bucket: process.env.AWS_S3_BUCKET!,
        credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
            ? { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! }
            : undefined
    },
    cognito: {
        region: process.env.COGNITO_REGION!,
        userPoolId: process.env.COGNITO_USER_POOL_ID!,
        clientId: process.env.COGNITO_CLIENT_ID!,
        get issuer() {
            return `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}`;
        },
        get jwksUri() {
            return `${this.issuer}/.well-known/jwks.json`;
        }
    }
};

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.use(cors({
    origin: ['http://localhost:4200'], // frontend Angular
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  await app.listen(3000);
  console.log(`🚀 Backend listo en http://localhost:3000`);
}
bootstrap();

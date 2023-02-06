import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { HttpExceptionFilter } from './MyExceptionFilter';
import { config } from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
config();//to load environment variables from (.env) file. it called by global object process.env."variable name"

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(helmet())
  // app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    forbidUnknownValues:true,
    forbidNonWhitelisted:true,
    whitelist:true,
    transform:true
  }));
  await app.listen(3000);
}
bootstrap();

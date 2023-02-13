import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as session from 'express-session'
import { SessionOptions } from 'express-session';
import { HttpExceptionFilter } from './MyException.filter';
import { config } from 'dotenv';
import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { SuccessInterceptor } from './success.interceptor';
config();//to load environment variables from (.env) file. it called by global object process.env."variable name"

const VALIDATION_PIPE_OPTIONS:ValidationPipeOptions = {
  forbidUnknownValues: true,
  forbidNonWhitelisted: true,
  whitelist: true,
  transform: true,
  validationError: { target: true, value: true }
};

const SESSION_OPTIONS:SessionOptions = {
  secret: process.env.SESSION_SECRET||'lkvnippoqSFweuroivc1mxnvlsPa4353',
  resave: false,
  saveUninitialized: false,
  cookie:{
    maxAge:Number(process.env.SESSION_AGE_MILLISECOND)||7*24*60*60*1000,//default 7 days
    secure:'auto',
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(helmet())
  app.use(session(SESSION_OPTIONS));
  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  app.useGlobalInterceptors(new SuccessInterceptor())
  // app.enableCors();
  await app.listen(3000);
}
bootstrap();

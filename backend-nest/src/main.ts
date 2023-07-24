import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as session from 'express-session'
import { SessionOptions } from 'express-session';
import { HttpExceptionFilter } from './MyException.filter';
import { config } from 'dotenv';
import { BadRequestException, ValidationError, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { SuccessInterceptor } from './interceptor';
config();//to load environment variables from (.env) file. it called by global object process.env."variable name"

const VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  forbidUnknownValues: true,
  forbidNonWhitelisted: true,
  whitelist: true,
  transform: true,
  validationError: { target: true, value: true },
  exceptionFactory(error) {
    const recursion = (e: ValidationError[]) => {//return all constrains error messages into array of string messages
      const arr = [];
      for (const o of e)
        if (o.constraints)
          for (const keyCon in o.constraints)
            arr.push(o.constraints[keyCon]);
        else if (o.children?.length > 0)//children force us to use recursion
          arr.push(...recursion(o.children))
      return arr;
    }
    const constrains = recursion(error);

    //// beautify the message
    let message = '';
    // if (constrains.length <= 1)
    message = constrains[0];
    // else {
    //   for (let i = 0; i < constrains.length; i++)
    //     message += `${i + 1}- ${constrains[i]}.\n`;
    // }
    // message = message.trim();

    throw new BadRequestException({ msg: 'Invalid object structure/values !', message, error })
  },
};

const secret = process.env.SESSION_SECRET;
if(!secret) throw new Error('Environment variable SESSION_SECRET is empty');
const SESSION_OPTIONS: SessionOptions = {
  secret,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: +process.env.SESSION_AGE_MILLISECOND || 7 * 24 * 60 * 60 * 1000,//default 7 days
    secure: 'auto',
    sameSite: 'strict',
  },
};
const host: string = process.env.HOST_SERVER || 'localhost';
const port: number = +process.env.PORT_SERVER || 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use(helmet({
  //   crossOriginResourcePolicy: process.env.PRODUCTION == 'true',
  // }))
  // if (process.env.PRODUCTION == 'false')
  app.enableCors({ origin: ["http://localhost:4200"], credentials: true, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] });
  app.use(session(SESSION_OPTIONS));
  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  app.useGlobalInterceptors(new SuccessInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(port, host, async () => {
    console.log('Server running at', await app.getUrl());
  });
}
bootstrap();

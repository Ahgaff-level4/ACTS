
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { R } from './utility.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const res = {
      success: false,
      message: exception?.getResponse()['message'] || R.string.somethingWentWrong,
      msg:exception?.getResponse()['msg']||undefined,
      action: exception?.getResponse()['action'] || undefined,
      sqlMessage:exception?.getResponse()['sqlMessage']||undefined,
      code:exception?.getResponse()['error']?.code||undefined,
      error: {
        statusCode: status,
        exception,
        timestamp: new Date().toISOString(),
      }
    };
    response.status(status).json(res);
  }
}




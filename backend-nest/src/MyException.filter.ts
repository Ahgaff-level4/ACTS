
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { R } from './utility.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    
    response
      .status(status)
      .json({
        success: false,
        message: exception?.getResponse()['message'] || R.string.somethingWentWrong,
        msg:exception?.getResponse()['msg']||undefined,
        action: exception?.getResponse()['action'] || undefined,
        sqlMessage:exception?.getResponse()['sqlMessage']||undefined,
        error: {
          statusCode: status,
          exception,
          request: {
            body: request.body,
            params: request.params,
            query: request.query,
          },
          timestamp: new Date().toISOString(),
        }
      });
  }
}




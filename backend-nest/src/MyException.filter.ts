
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

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
        message:exception.message||'Something went wrong!',
        error: {
          statusCode: status,
          exception,
          request:{
            body:request.body,
            params:request.params,
            query:request.query,
          },
          timestamp: new Date().toISOString(),
        }
      });
  }
}

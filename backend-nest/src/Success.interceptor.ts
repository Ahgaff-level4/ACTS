
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ArgumentsHost } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        map(data => (data?.message ? { success: true, message: data.message, data } : { success: true, data }))
      );
  }
}

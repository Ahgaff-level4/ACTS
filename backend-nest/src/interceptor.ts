
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ArgumentsHost, BadRequestException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { QueryFailedError } from 'typeorm';
import { R } from './utility.service';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        // map(data => (data?.message ? { success: true, message: data.message, data } : { success: true, data })),
        catchError(error => {
          if (error instanceof QueryFailedError){
            const code = error.driverError.code;
            const sqlMessage = error?.driverError?.sqlMessage;
            let message:string|undefined;
            if(code === 'ER_DUP_ENTRY')
              message = R.string.duplicateEntry;
              //else for other sql error code. Check the docs for code error values
            
            throw new BadRequestException({ msg:'SQL query failed!',sqlMessage, message, error });
          }
          else if (error && error.status)
            throw error;
          else {
            console.error(error);
            throw new InternalServerErrorException({ msg: 'Error could not be identified!', message: R.string.somethingWentWrong, error });
          }
        })
      );
  }
}

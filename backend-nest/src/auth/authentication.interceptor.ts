import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class AuthenticationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    
    if(req.path === '/api/auth/login' && req.method === 'POST')//user can only login without authentication
      return next.handle();
      
    console.log('authenticate:', req.session)//,context.getType(),context.getArgByIndex(0));
    if (req?.session['loggedIn'] === true)
      return next.handle();

    //todo redirect to login page but if request is API respond should not be .html file
    throw new UnauthorizedException('You must login first!');
  }
}
import { SetMetadata } from "@nestjs/common";
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from "@nestjs/common/exceptions";
import { Reflector } from "@nestjs/core";
import { R, User } from "src/utility.service";
import {Role} from './../../../interfaces.d';


const ROLES_KEY = 'rolesDecorator';

/**
 * A decorator used to determine the role/s of any action or method or controller
 * @param roles one or multiple roles (e.g., Role.Admin,Role.Teacher,Role.Parent,...)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    return true;//for debugging
    //first: check login
    const req = context.switchToHttp().getRequest();
    if (req.path === '/api/auth/login' && req.method === 'POST')//user can only login without authentication
      return true;
    const user:User = req.session['user'];
    if (user?.loggedIn !== true)
      throw new UnauthorizedException({message:R.string.mustLogin,action:'login'});



    //second: check user role
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles)
      return true;

    if (user?.roles && requiredRoles.some((role) => user?.roles?.includes(role)))
      return true;
    else throw new UnauthorizedException({ message: R.string.insufficientPrivilege, requiredPrivilege: requiredRoles, yourPrivileges: user?.roles,action:'privilege' });
  }
}


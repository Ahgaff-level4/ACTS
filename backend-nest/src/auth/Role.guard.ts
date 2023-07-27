import { SetMetadata } from "@nestjs/common";
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from "@nestjs/common/exceptions";
import { Reflector } from "@nestjs/core";
import { R } from "src/utility.service";
import { Role, User } from '../../../interfaces';
import { Request } from "express";


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
    const req: Request = context.switchToHttp().getRequest();
    if (req.path === '/api/auth/login'
      || req.path == '/api/auth/isLogin'
      || req.path == '/api/auth/logout'
      || req.path.startsWith('/api/report/dashboard')
      || (req.path.startsWith('/api/person/')&&req.path.includes('file-manager')))//No authentication needed for these
      return true;

    const user: User | undefined = req.session['user'];

    if (!user || !user.roles || !Array.isArray(user.roles))
      throw new UnauthorizedException({ message: R.string.mustLogin, action: 'login' });

    //check user roles with request required roles
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!Array.isArray(requiredRoles))//if these is no required roles for user's request
      return true;

    if (requiredRoles.some((role) => user.roles.includes(role)))
      return true;
    else throw new UnauthorizedException({ message: R.string.insufficientPrivilege, requiredPrivilege: requiredRoles, yourPrivileges: user?.roles, action: 'privilege' });
  }
}


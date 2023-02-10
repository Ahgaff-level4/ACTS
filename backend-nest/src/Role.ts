import { SetMetadata } from "@nestjs/common";
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from "@nestjs/core";
import { Observable } from 'rxjs';

export enum Role {
  Admin = 'Admin',
  HeadOfDepartment = 'HeadOfDepartment',
  Teacher = 'Teacher',
  Parent = 'Parent'
};

const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => {
  let realRoles: Role[] = [];
  for (let role of roles)
    if (role === Role.Admin)
      realRoles.push(Role.Teacher, Role.HeadOfDepartment)
    else realRoles.push(role);

  return SetMetadata(ROLES_KEY, roles)
};


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean{
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}


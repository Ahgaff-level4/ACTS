import { SetMetadata } from "@nestjs/common";
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UnauthorizedException } from "@nestjs/common/exceptions";
import { Reflector } from "@nestjs/core";

export enum Role {
  Admin = 'Admin',
  HeadOfDepartment = 'HeadOfDepartment',
  Teacher = 'Teacher',
  Parent = 'Parent'
};

const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => {
  console.log('Roles : roles', roles);
  let realRoles: Role[] = [];

  for (let role of roles)
    if (role === Role.Admin)
      realRoles.push(Role.Teacher, Role.HeadOfDepartment)
    else realRoles.push(role);

  return SetMetadata(ROLES_KEY, roles)
};


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles)
      return true;
    
    const { body: user } = context.switchToHttp().getRequest();
    if (user && user.roles && requiredRoles.some((role) => user.roles?.includes(role)))
      return true;
    else throw new UnauthorizedException(`You don't have sufficient privilege!\n You need "${requiredRoles.toString()}" privilege. But your privilege is "${user?.roles?.toString()}".`);
  }
}


import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '@/decorators/roles.decorator';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndMerge<number[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    const userEntity: User = await this.userService.findOne(user.userId);

    if (!userEntity) {
      return false;
    }

    const userRoles = userEntity.getRolesList();
    return requiredRoles.some((role: number) => userRoles.includes(role));
  }
}

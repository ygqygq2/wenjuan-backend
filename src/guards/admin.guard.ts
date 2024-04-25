import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Role } from '@/enum/roles.enum';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    const userEntity: User = await this.userService.findOne(user.userId);

    if (!userEntity) {
      return false;
    }

    if (userEntity.roles.filter((role) => role.id === Role.Admin).length > 0) {
      return true;
    }
    return false;
  }
}

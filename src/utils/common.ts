import { Role } from '@/enum/roles.enum';
import { Logs } from '@/logs/logs.entity';
import { Menus } from '@/menus/menus.entity';
import { Roles } from '@/roles/roles.entity';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

// eslint-disable-next-line consistent-return
export const getEntities = (path: string) => {
  // /users ->User, /logs -> Logs, /roles -> Roles, /menus -> Menus, /auth -> 'Auth'
  const map = {
    '/users': User,
    '/logs': Logs,
    '/roles': Roles,
    '/menus': Menus,
    '/auth': 'Auth',
  };

  for (let i = 0; i < Object.keys(map).length; i++) {
    const key = Object.keys(map)[i];
    if (path.startsWith(key)) {
      return map[key];
    }
  }
};

/**
 *
 * @param request - 请求体
 * @param userService - 用户服务
 * @param admin - 是否需要返回管理员判断
 * @returns
 */
export const getUserInfoFromRequest = async (
  request: any,
  userService: UserService,
  admin: boolean,
): Promise<{ userId: number; isAdmin?: boolean }> => {
  const { userId } = request.user;

  if (admin) {
    const user = await userService.findOne(userId);
    const isAdmin = user.getRolesList().includes(Role.Admin);
    return { userId, isAdmin };
  }
  return { userId };
};

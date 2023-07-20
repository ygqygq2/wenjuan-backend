import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  LoggerService,
  Param,
  Headers,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseFilters,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { TypeormFilter } from '@/filters/typeorm.filter';

import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { CreateUserPipe } from './pipes/create-user.pipe';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user')
@UseFilters(new TypeormFilter())
export class UserController {
  constructor(
    private userService: UserService,
    protected configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.logger.log('UserController init');
  }

  /**
   *
   * @param query - 查询参数
   * @param query.page - 页码
   * @param query.limit - 每页数量
   * @param query.condition - 查询条件
   * @returns
   */
  @Get()
  getUsers(@Query() query: GetUserDto): any {
    return this.userService.findAll(query);
  }

  @Post()
  addUser(@Body(CreateUserPipe) dto: CreateUserDto): any {
    const user = dto as User;
    return this.userService.create(user);
  }

  @Patch('/:id')
  updateUser(@Body() dto: any, @Param('id') id: number, @Headers('Authorization') headers: any): any {
    // 权限 1：判断用户是否是自己
    // 权限 2：判断用户是否有更新 user 的权限
    // 返回数据：不能包含敏感的 password 等信息
    if (id === headers) {
      const user = dto as User;
      return this.userService.update(id, user);
    }
    throw new UnauthorizedException();
  }

  @Delete('/:id')
  removeUser(@Param('id') id: number): any {
    return this.userService.remove(id);
  }

  // 不超过 3 个参数，建议直接使用类型管道
  @Get('/profile')
  @UseGuards(AuthGuard('jwt'))
  async getUserProfile(
    @Query('id', ParseIntPipe) id: any,
    // 这里 req 中的 user 是通过 AuthGuard('jwt') 中的 validate 方法返回的 PassportModule 来添加的
    // @Req() req
  ): Promise<any> {
    const result = await this.userService.findProfile(id);
    let data = {};
    if (result.id) {
      data = {
        errno: 0,
        data: result,
      };
    } else {
      data = {
        errno: 100,
        message: '用户不存在',
      };
    }
    return data;
  }

  @Get('/logs')
  getUserLogs(): any {
    return this.userService.findUserLogs(2);
  }

  @Get('/logsByGroup')
  async getLogsByGroup(): Promise<any> {
    const res = this.userService.findLogsByGroup(2);
    return (await res).map((o) => ({
      result: o.result,
      count: o.count,
    }));
  }

  // @Get()
  // getUser(@Param() '/:id'): any {
  //   return ""
  // }
}

import { Body, ClassSerializerInterceptor, Controller, Get, Post, UseFilters, UseInterceptors } from '@nestjs/common';

import { Public } from '@/decorators/auth.decorator';
import { ErrMsg, Errno } from '@/enum/errno.enum';
import { TypeormFilter } from '@/filters/typeorm.filter';

import { AuthService } from './auth.service';
import { SigninUserDto } from './dto/signin-user.dto';

// export function TypeOrmDecorator() {
//   return UseFilters(new TypeormFilter());
// }

@Controller('auth')
// @TypeOrmDecorator()
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new TypeormFilter())
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Get()
  getHello(): string {
    return 'Auth';
  }

  @Public()
  @Post('/login')
  async signin(@Body() dto: SigninUserDto) {
    const { username, password } = dto;
    const token = await this.authService.signin(username, password);
    // 判断是否返回正确 token
    if (!token) {
      return {
        errno: Errno.ERRNO_21,
        msg: ErrMsg[Errno.ERRNO_21],
      };
    }
    return {
      errno: 0,
      data: {
        token,
      },
    };
  }

  @Public()
  @Post('/register')
  async signup(@Body() dto: SigninUserDto) {
    const { username, password, nickname } = dto;
    const data = await this.authService.signup(username, password, nickname);
    // 判断是否注册成功
    if (!data) {
      return {
        errno: Errno.ERRNO_20,
        msg: ErrMsg[Errno.ERRNO_20],
      };
    }
    return {
      errno: 0,
    };
  }
}

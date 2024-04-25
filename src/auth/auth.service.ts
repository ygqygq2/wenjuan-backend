import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

import { ErrMsg, Errno } from '@/enum/errno.enum';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // 生成随机的盐值
  private generateSalt(length: number): string {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  private async generateHashedPassword(salt: string, password: string): Promise<string> {
    return argon2.hash(`${salt}${password}`);
  }

  private async verifyPassword(storedHashedPassword: string, salt: string, hashedPassword: string): Promise<boolean> {
    try {
      const isPasswordMatch = await argon2.verify(storedHashedPassword, salt + hashedPassword);
      return isPasswordMatch;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Failed to verify hashedPassword');
    }
  }

  async signin(username: string, hashedPassword: string) {
    const user = await this.userService.find(username);
    if (!user) {
      return null;
    }
    // password 为数据库字段，其实是已经加密过的
    const { password = '', salt = '' } = user;
    const verifyResult = await this.verifyPassword(password, salt, hashedPassword);
    // 生成 token
    if (verifyResult) {
      return this.jwtService.signAsync(
        {
          username: user.username,
          sub: user.id,
        },
        // 局部设置过期时间
        {
          expiresIn: '12h',
        },
      );
    }
    throw new UnauthorizedException(ErrMsg[Errno.ERRNO_22]);
  }

  async signup(username: string, hashedPassword: string, nickname: string) {
    const salt = this.generateSalt(16);
    const storedHashedPassword = await this.generateHashedPassword(salt, hashedPassword);
    const res = await this.userService.create({ username, password: storedHashedPassword, salt }, { nickname });
    return res;
  }
}

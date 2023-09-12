import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';

import { ErrMsg, Errno } from '@/enum/errno.enum';

import { UserService } from '@/user/user.service';
import { getUserInfoFromRequest } from '@/utils/common';

import { AnswerService } from './answer.service';

@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService, private readonly userService: UserService) {}

  @Post()
  async index(@Body() body: any) {
    const res = await this.answerService.createAnswer(body);
    if (!res) {
      return {
        errno: Errno.ERRNO_30,
        msg: ErrMsg[Errno.ERRNO_30],
      };
    }
    return {
      errno: Errno.SUCCESS,
      data: { _id: res._id },
    };
  }

  @Get()
  async findAll(@Query() queryParams: any, @Req() request) {
    const { userId } = await getUserInfoFromRequest(request, this.userService, false);
    return this.answerService.findAllForCreator(queryParams, userId);
  }
}

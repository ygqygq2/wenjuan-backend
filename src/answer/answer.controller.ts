import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';

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

  @Get('/:id')
  async fndOne(@Param('id') id: string) {
    const result = await this.answerService.findOne(+id);
    if (result._id) {
      return {
        errno: Errno.SUCCESS,
        data: {
          _id: result._id,
          questionId: result.question._id,
          answerContent: result.answerContent,
        },
      };
    }

    return {
      errno: Errno.ERRNO_31,
      msg: ErrMsg[Errno.ERRNO_31],
    };
  }
}

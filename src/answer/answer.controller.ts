import { Body, Controller, Post } from '@nestjs/common';

import { ErrMsg, Errno } from '@/enum/errno.enum';

import { AnswerService } from './answer.service';

@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

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
      data: res,
    };
  }
}

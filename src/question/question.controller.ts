import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { Roles } from '@/decorators';
import { ErrMsg, Errno } from '@/enum/errno.enum';

import { Role } from '@/enum/roles.enum';
import { RolesGuard } from '@/guards';

import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionService } from './question.service';
import {AuthGuard} from '@nestjs/passport';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // 没有 question id 时
  @Post()
  // 返回数据库最新 id，格式如下
  async index(@Body() body: any) {
    // getNewestId
    const id = await this.questionService.getNewestId();
    // 返回 id 加 1
    return {
      errno: Errno.SUCCESS,
      data: {
        id,
      },
    };
  }

  // 查询问卷列表，根据接收到的参数查询，len, isDeleted, isStar
  @Get()
  @Roles(Role.Admin, Role.User)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  findAll(@Query() queryParams: any) {
    return this.questionService.findAllForCreator(queryParams);
  }

  @Get(':id')
  async findOneWithComponents(@Param('id') id: string) {
    const questionData = await this.questionService.findOneWithComponents(+id);
    // 判断是否存在
    if (!questionData) {
      return {
        errno: Errno.ERRNO_12,
        msg: ErrMsg[Errno.ERRNO_12],
      };
    }
    // componentList 为列表 id

    return {
      errno: Errno.SUCCESS,
      data: questionData,
    };
  }

  // 更新问卷
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionService.saveQuestion(+id, updateQuestionDto);
  }

  // 复制问卷
  @Post('/duplicate/:id')
  async copy(@Param('id') id: string): Promise<ReturnData> {
    try {
      const questionData = await this.questionService.copy(+id);
      if (!questionData) {
        return {
          errno: Errno.ERRNO_12,
          msg: ErrMsg[Errno.ERRNO_12],
        };
      }
      return {
        errno: Errno.SUCCESS,
        data: {
          id: questionData._id,
        },
      };
    } catch (error) {
      return {
        errno: Errno.ERRNO_11,
        msg: ErrMsg[Errno.ERRNO_11],
      };
    }
  }

  // 接收到的是 {ids: [1, 2, 3]} 这样的数据
  @Delete()
  async remove(@Body() body: { ids: number[] }) {
    const { ids } = body;
    const deleteResult = await this.questionService.removeByIds(ids);
    let returnData: ReturnData;
    // 判断是否删除成功
    if (deleteResult.length <= 0) {
      returnData = {
        errno: Errno.SUCCESS,
      };
    } else {
      returnData = {
        errno: Errno.ERRNO_13,
        msg: `${ErrMsg[Errno.ERRNO_13]}列表：${deleteResult}`,
      };
    }
    return returnData;
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { ErrMsg, Errno } from '@/enum/errno.enum';

import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionService } from './question.service';

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
  findAll(@Query() queryParams: any) {
    return this.questionService.findAll(queryParams);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.questionService.findOne(+id);
    // 判断是否存在
    if (!result) {
      return {
        errno: Errno.ERRNO_12,
        msg: ErrMsg[Errno.ERRNO_12],
      };
    }
    // 将 result 内 componentList 字段的值转为 JSON 格式
    result.componentList = JSON.parse(result.componentList);
    return {
      errno: Errno.SUCCESS,
      data: result,
    };
  }

  // 更新问卷
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionService.saveQuestion(+id, updateQuestionDto);
  }

  // 复制问卷
  @Post('/duplicate/:id')
  copy(@Param('id') id: string) {
    // 获取最新 id
    return this.questionService.copy(+id);
  }

  // 接收到的是 {ids: [1, 2, 3]} 这样的数据
  @Delete()
  async remove(@Body() body: { ids: number[] }) {
    const { ids } = body;
    const deleteResult = await this.questionService.removeByIds(ids);
    let returnData: ReturnData;
    // 判断是否删除成功
    if (deleteResult.affected === ids.length) {
      returnData = {
        errno: Errno.SUCCESS,
      };
    } else {
      returnData = {
        errno: Errno.ERRNO_13,
        msg: ErrMsg[Errno.ERRNO_13],
      };
    }
    return returnData;
  }
}

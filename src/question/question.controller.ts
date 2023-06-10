import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { returnData } from '@/utils/axios.helper';

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
      errno: 0,
      data: {
        id: id + 1,
      },
    };
  }

  // 查询问卷列表，根据接收到的参数查询，len, isDeleted, isStar
  @Get()
  findAll(@Param('len') len: number, @Param('isDeleted') isDeleted: boolean, @Param('isStar') isStar: boolean) {
    return this.questionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.questionService.findOne(+id);
    // 将 resule 内 componentList 字段的值转为 JSON 格式
    result.componentList = JSON.parse(result.componentList);
    return returnData(result);
  }

  // 更新问卷
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionService.saveQuestion(+id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionService.remove(+id);
  }
}

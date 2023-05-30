import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  // 返回数据库最新 id，格式如下
  async index(@Body() body: any) {
    // getNewestId
    const id = await this.questionService.getNewestId();
    console.log(id);
    // 返回 id 加 1
    return {
      errno: 0,
      data: {
        id: id + 1,
      },
    };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll() {
    return this.questionService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(+id);
  }

  @Post('id')
  @UseGuards(AuthGuard('jwt'))
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionService.create(createQuestionDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionService.update(+id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionService.remove(+id);
  }
}

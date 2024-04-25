import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Question } from '@/question/question.entity';
import { QuestionModule } from '@/question/question.module';

import { AnswerController } from './answer.controller';
import { Answer } from './answer.entity';
import { AnswerService } from './answer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Answer, Question]), QuestionModule],
  providers: [AnswerService],
  controllers: [AnswerController],
})
export class AnswerModule {}

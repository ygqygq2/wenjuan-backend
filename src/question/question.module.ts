import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Component } from './component.entity';
import { QuestionController } from './question.controller';
import { Question } from './question.entity';
import { QuestionService } from './question.service';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Component])],
  controllers: [QuestionController],
  providers: [QuestionService],
})
export class QuestionModule {}

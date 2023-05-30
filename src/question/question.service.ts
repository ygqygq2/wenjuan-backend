import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './question.entity';

@Injectable()
export class QuestionService {
  constructor(@InjectRepository(Question) private questionRepository: Repository<Question>) {}

  async create(createQuestionDto: CreateQuestionDto) {
    const question = this.questionRepository.create(createQuestionDto);
    return this.questionRepository.save(question);
  }

  findAll() {
    return this.questionRepository.find();
  }

  findOne(id: number) {
    return this.questionRepository.findOne({
      where: {
        id,
      },
    });
  }

  // 获取数据库中最新 id
  async getNewestId() {
    const question = await this.questionRepository.find({
      order: {
        id: 'DESC',
      },
      take: 1,
    });
    if (question.length === 0) {
      return 0;
    }
    return question[0].id;
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.findOne(id);
    const newQuestion = this.questionRepository.merge(question, updateQuestionDto);
    return this.questionRepository.save(newQuestion);
  }

  remove(id: number) {
    // delete  -> AfterRemove 不会触发
    return this.questionRepository.delete(id);
  }
}

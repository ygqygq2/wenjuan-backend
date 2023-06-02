import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { Component } from './component.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question) private questionRepository: Repository<Question>,
    @InjectRepository(Component) private componentRepository: Repository<Component>,
  ) {}

  async create(question: CreateQuestionDto) {
    console.log(question);
    // if (!question.componentList) {
    // const component= await this.componentRepository.findOne({ where: { fe_id: 2} });
    // question.componentList= [component];
    // }
    if (question.componentList instanceof Array && typeof question.componentList[0] === 'number') {
      // 查询所有的用户角色
      question.componentList = await this.componentRepository.find({
        where: {
          fe_id: In(question.componentList),
        },
      });
    }
    const questionTmp = this.questionRepository.create(question);
    const res = await this.questionRepository.save(questionTmp);
    return res;
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

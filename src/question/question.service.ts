import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Component } from './component.entity';
import { CreateComponentDto } from './dto/create-component.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question) private readonly questionRepository: Repository<Question>,
    @InjectRepository(Component) private readonly componentRepository: Repository<Component>,
  ) {}

  async createQuestionAndComponent(
    createComponentDto: CreateComponentDto,
    createQuestionDto: CreateQuestionDto,
  ): Promise<any> {
    const componentList = [];
    // 创建组件，返回组件列表
    const component = this.componentRepository.create(createComponentDto);
    componentList.push(await this.componentRepository.save(component));
    const question = this.questionRepository.create({ ...createQuestionDto, componentList });
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

  async saveQuestion(id: number, updateQuestionDto: UpdateQuestionDto) {
    // 数据库中没有该 id 时，则创建数据
    // 类型“number”与类型“FindOneOptions<Question>”不具有相同的属性。ts(2559)
    const question = await this.findOne(id);
    if (!question) {
      const questionTmp = new Question();
      const { title, description, css, js, componentList } = updateQuestionDto;
      console.log('componentList', componentList);
      questionTmp.id = id;
      questionTmp.title = title;
      questionTmp.description = description;
      questionTmp.css = css;
      questionTmp.js = js;
      const componentListTmp = [];

      // 创建组件
      for (const item of componentList) {
        console.log('item', item);
        const component = this.componentRepository.create(item);
        await this.componentRepository.save(component);
        componentListTmp.push(item.fe_id);
      }

      questionTmp.componentList = componentListTmp;
      console.log(questionTmp);

      return this.questionRepository.save(questionTmp);
    }
    const newQuestion = this.questionRepository.merge(question, updateQuestionDto);
    return this.questionRepository.save(newQuestion);
  }

  remove(id: number) {
    // delete  -> AfterRemove 不会触发
    return this.questionRepository.delete(id);
  }
}

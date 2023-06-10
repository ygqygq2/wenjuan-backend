import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './question.entity';

@Injectable()
export class QuestionService {
  constructor(@InjectRepository(Question) private readonly questionRepository: Repository<Question>) {}

  async findAll() {
    // 只需要特定列
    // 时间使用东八区时间
    const result = await this.questionRepository.find({
      select: ['_id', 'title', 'isPublished', 'isStar', 'answerCount', 'createdAt', 'isDeleted'],
    });
    return {
      errno: 0,
      data: {
        list: result,
        total: result.length,
      },
    };
  }

  async findOne(id: number) {
    return this.questionRepository.findOne({
      where: {
        _id: id,
      },
    });
  }

  async getNewestId() {
    const question = await this.questionRepository.find({
      order: {
        _id: 'DESC',
      },
      take: 1,
    });
    if (question.length === 0) {
      return 0;
    }
    return question[0]._id;
  }

  async saveQuestion(id: number, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.findOne(id);
    // 数据库中没有该 id 时，则创建数据
    const { title, description, css, js, componentList } = updateQuestionDto;
    let result: Question;
    let returnData: { errno: number; msg?: string };
    if (!question) {
      const questionTmp = new Question();
      questionTmp._id = id;
      questionTmp.title = title;
      questionTmp.description = description;
      questionTmp.css = css;
      questionTmp.js = js;
      // 需要将 componentList 对象转成字符串
      questionTmp.componentList = JSON.stringify(componentList);

      result = await this.questionRepository.save(questionTmp);
    } else {
      // 如果数据库中有该 id 时，更新数据
      question.title = title;
      question.description = description;
      question.css = css;
      question.js = js;
      question.componentList = JSON.stringify(componentList);
      result = await this.questionRepository.save(question);
    }
    if (result._id) {
      returnData = {
        errno: 0,
      };
    } else {
      returnData = {
        errno: -1,
        msg: '保存失败',
      };
    }
    return returnData;
  }

  remove(id: number) {
    // delete  -> AfterRemove 不会触发
    return this.questionRepository.delete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Errno } from '@/enum/errno.enum';
import { QuestionService } from '@/question/question.service';
import { UserService } from '@/user/user.service';

import { Answer } from './answer.entity';
import { SearchOptions } from './types';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer) private readonly answerRepository: Repository<Answer>,
    private readonly questionService: QuestionService,
    private readonly userService: UserService,
  ) {}

  async createAnswer(body: any, userId: number) {
    const { questionId, ...content } = body;

    if (!questionId) {
      return null;
    }

    const question = await this.questionService.findOne(+questionId);
    if (!question) {
      return null;
    }

    const user = await this.userService.findOne(userId);
    if (!user) {
      return null;
    }
    const answerTmp = new Answer();
    Object.assign(answerTmp, { question, answerContent: JSON.stringify(content), user });

    return this.answerRepository.save(answerTmp);
  }

  async findAllForCreator(searchOptions: SearchOptions, userId: number) {
    const { keyword, page = 1, pageSize = 10 } = searchOptions;

    const queryBuilder = this.answerRepository.createQueryBuilder('answer');
    queryBuilder.leftJoinAndSelect('answer.question', 'question');
    queryBuilder.select([
      'answer._id',
      'question._id',
      'answer.answerContent',
      'answer.createdAt',
      `COUNT (*) OVER() as total`, // 添加 total 字段，用于返回数据总数
    ]);

    // 设置 take 和 skip
    const startIndex = (page - 1) * pageSize;
    queryBuilder.take(pageSize).skip(startIndex);

    // 用户查询自己的回答
    queryBuilder.andWhere('answer.creator= :userId', { userId });

    // keyword
    if (keyword) {
      queryBuilder.andWhere('answer.questionId like :keyword', { keyword: `%${keyword}%` });
    }

    // 根据需要添加其他查询条件
    const result = await queryBuilder.getRawAndEntities();

    const list = result.entities.map((entity) => {
      const { _id, question, answerContent, createdAt } = entity;
      const questionId = question._id;
      return {
        _id,
        questionId,
        answerContent,
        creator: userId,
        createdAt,
      };
    });
    const total = result.raw[0]?.total || 0;
    return {
      errno: Errno.SUCCESS,
      data: {
        list,
        total,
      },
    };
  }

  async findOne(id: number) {
    const result = await this.answerRepository.findOne({
      where: {
        _id: id,
      },
      relations: ['question'],
    });
    return result;
  }
}

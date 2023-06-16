import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Redis from 'ioredis';
import { Repository } from 'typeorm';

import { ErrMsg, Errno } from '@/enum/errno.enum';

import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './question.entity';

// type SearchOption = {
//   keyword: string;
//   isStar: boolean;
//   isDeleted: boolean;
//   page: number;
//   pageSize: number;
// };

@Injectable()
export class QuestionService {
  private newestId = 0;

  private readonly redis: Redis;

  constructor(
    @InjectRepository(Question) private readonly questionRepository: Repository<Question>,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
  }

  // 查询问卷列表，根据接收到的参数查询，SearchOption
  async findAll(...args: any[]) {
    // 只需要特定列
    // const result= await this.questionRepository.find ({
    //   select: ['_id', 'title', 'isPublished', 'isStar', 'answerCount', 'createdAt', 'isDeleted'],
    // });
    // return {
    //   errno: Errno.SUCCESS,
    //   data: {
    //     list: result,
    //     total: result.length,
    //   },
    // };

    const queryBuilder = this.questionRepository.createQueryBuilder('question');
    queryBuilder.select([
      'question._id',
      'question.title',
      'question.isPublished',
      'question.isStar',
      'question.answerCount',
      'question.createdAt',
      'question.isDeleted',
      `COUNT (*) OVER() as total`, // 添加 total 字段，用于返回数据总数
    ]);
    args.forEach((arg) => {
      // page, 默认为 1
      const page = arg.page || 1;
      // pageSize, 默认为 10
      const pageSize = arg.pageSize || 10;
      // 计算起始索引
      const startIndex = (page - 1) * pageSize;
      // 设置 take 和 skip
      queryBuilder.take(pageSize).skip(startIndex);
      // isDeleted, 没有传值时，默认为 false
      // arg.isDeleted 是 string 类型
      const isDeleted = arg.isDeleted === 'true' || false;
      queryBuilder.andWhere('question.isDeleted= :isDeleted', { isDeleted });
      // keyword
      if (arg.keyword) {
        queryBuilder.andWhere('question.title like :keyword', { keyword: `%${arg.keyword}%` });
      }

      // isStar
      if (arg.isStar !== undefined) {
        // arg.isStar 是 string 类型
        const isStar = arg.isStar === 'true';
        queryBuilder.andWhere('question.isStar= :isStar', { isStar });
      }
      // 根据需要添加其他查询条件
    });
    const result = await queryBuilder.getRawAndEntities();

    const list = result.entities.map((entity) => {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { _id, title, isPublished, isStar, answerCount, createdAt, isDeleted } = entity;
      return {
        _id,
        title,
        isPublished,
        isStar,
        answerCount,
        createdAt,
        isDeleted,
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
    return this.questionRepository.findOne({
      where: {
        _id: id,
      },
    });
  }

  // 生成最新唯一 id 作为问卷 id
  // 先从 mysql 中获取最大 id
  // 再使用 redis 作为计数器
  // 如果 redis 中没有该计数器，则创建，否则获取
  async getNewestId() {
    const newestId = await this.redis.get('question-newest-id');
    if (newestId) {
      this.newestId = parseInt(newestId, 10) + 1;
    } else {
      const [latestQuestion] = await this.questionRepository.find({
        order: {
          _id: 'DESC',
        },
        take: 1,
      });
      this.newestId = (latestQuestion?._id ?? -1) + 1;
    }
    await this.redis.set('question-newest-id', this.newestId.toString());
    return this.newestId;
  }

  async saveQuestion(id: number, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.findOne(id);
    // 数据库中没有该 id 时，则创建数据
    const { title, description, css, js, componentList, isStar, isPublished, isDeleted } = updateQuestionDto;
    let result: Question;
    let returnData: ReturnData;
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
      question.isStar = isStar;
      question.isPublished = isPublished;
      question.isDeleted = isDeleted;

      result = await this.questionRepository.save(question);
    }
    if (result['_id']) {
      returnData = {
        errno: Errno.SUCCESS,
      };
    } else {
      returnData = {
        errno: Errno.ERRNO_10,
        msg: ErrMsg[Errno.ERRNO_10],
      };
    }
    return returnData;
  }

  // 复制问卷
  async copy(id: number) {
    let returnData: ReturnData;
    const question = await this.findOne(id);
    if (!question) {
      returnData = {
        errno: Errno.ERRNO_12,
        msg: ErrMsg[Errno.ERRNO_12],
      };
      return returnData;
    }
    const { title, description, css, js, componentList } = question;

    const questionTmp = new Question();
    questionTmp._id = await this.getNewestId();
    questionTmp.title = title;
    questionTmp.description = description;
    questionTmp.css = css;
    questionTmp.js = js;
    questionTmp.componentList = componentList;
    const result = await this.questionRepository.save(questionTmp);
    if (result['_id']) {
      returnData = {
        errno: Errno.SUCCESS,
        data: {
          id: result['_id'],
        },
      };
      return returnData;
    }
    returnData = {
      errno: Errno.ERRNO_11,
      msg: ErrMsg[Errno.ERRNO_11],
    };
    return returnData;
  }

  remove(id: number) {
    // delete  -> AfterRemove 不会触发
    return this.questionRepository.delete(id);
  }
}

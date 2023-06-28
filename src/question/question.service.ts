import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Redis from 'ioredis';
import { Repository } from 'typeorm';

import { ErrMsg, Errno } from '@/enum/errno.enum';

import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './question.entity';
import { QuestionCheckbox } from './questionCheckbox.entity';
import { QuestionCheckboxOption } from './questionCheckboxOption.entity';
import { QuestionInfo } from './questionInfo.entity';
import { QuestionInput } from './questionInput.entity';
import { QuestionParagraph } from './questionParagraph.entity';
import { QuestionRadio } from './questionRadio.entity';
import { QuestionRadioOption } from './questionRadioOption.entity';
import { QuestionTextarea } from './questionTextarea.entity';
import { QuestionTitle } from './questionTitle.entity';

// type SearchOptions = {
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

  private readonly componentTypeToClass = {
    questionCheckbox: QuestionCheckbox,
    questionInfo: QuestionInfo,
    questionInput: QuestionInput,
    questionParagraph: QuestionParagraph,
    questionRadio: QuestionRadio,
    questionTextarea: QuestionTextarea,
    questionTitle: QuestionTitle,
  };

  constructor(
    @InjectRepository(Question) private readonly questionRepository: Repository<Question>,
    @InjectRepository(QuestionCheckbox) private readonly questionCheckboxRepository: Repository<QuestionCheckbox>,
    @InjectRepository(QuestionCheckboxOption)
    private readonly questionCheckboxOptionRepository: Repository<QuestionCheckboxOption>,
    @InjectRepository(QuestionInfo) private readonly questionInfoRepository: Repository<QuestionInfo>,
    @InjectRepository(QuestionInput) private readonly questionInputRepository: Repository<QuestionInput>,
    @InjectRepository(QuestionParagraph) private readonly questionParagraphRepository: Repository<QuestionParagraph>,
    @InjectRepository(QuestionRadio) private readonly questionRadioRepository: Repository<QuestionRadio>,
    @InjectRepository(QuestionRadioOption)
    private readonly questionRadioOptionRepository: Repository<QuestionRadioOption>,
    @InjectRepository(QuestionTextarea) private readonly questionTextareaRepository: Repository<QuestionTextarea>,
    @InjectRepository(QuestionTitle) private readonly questionTitleRepository: Repository<QuestionTitle>,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
  }

  // 查询问卷列表，根据接收到的参数查询，SearchOptions
  async findAll(...searchOptions: any[]) {
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
    searchOptions.forEach((searchOption) => {
      // page, 默认为 1
      const page = searchOption.page || 1;
      // pageSize, 默认为 10
      const pageSize = searchOption.pageSize || 10;
      // 计算起始索引
      const startIndex = (page - 1) * pageSize;
      // 设置 take 和 skip
      queryBuilder.take(pageSize).skip(startIndex);
      // isDeleted, 没有传值时，默认为 false
      // arg.isDeleted 是 string 类型
      const isDeleted = searchOption.isDeleted === 'true' || false;
      queryBuilder.andWhere('question.isDeleted= :isDeleted', { isDeleted });
      // keyword
      if (searchOption.keyword) {
        queryBuilder.andWhere('question.title like :keyword', { keyword: `%${searchOption.keyword}%` });
      }

      // isStar
      if (searchOption.isStar !== undefined) {
        // arg.isStar 是 string 类型
        const isStar = searchOption.isStar === 'true';
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

  // 保存问卷
  async saveQuestion(id: number, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.findOne(+id);
    const { title, description, css, js, componentList, isStar, isPublished, isDeleted } = updateQuestionDto;

    // 如果数据库中没有该 id 时，则创建数据
    if (!question) {
      return this.createQuestion(id, title, description, css, js, componentList);
    }
    // 如果数据库中有该 id 时，则更新数据
    Object.assign(question, { title, description, css, js, isStar, isPublished, isDeleted });
    return this.updateQuestion(question);
  }

  // 创建问卷
  async createQuestion(id, title, description, css, js, componentList) {
    const questionTmp = new Question();
    Object.assign(questionTmp, { _id: id, title, description, css, js });

    // componentList 转换成对象
    const componentListObj = JSON.parse(JSON.stringify(componentList));
    const questionComponentList = await this.createComponentList(componentListObj);

    questionTmp.componentList = questionComponentList;
    const result = await this.questionRepository.save(questionTmp);

    return this.generateReturnData(result);
  }

  // 创建问卷组件
  async createComponentList(componentListObj) {
    return Promise.all(
      componentListObj.map(async (component) => {
        const ComponentClass = this.componentTypeToClass[component.type];
        const componentTmp = new ComponentClass();
        Object.assign(componentTmp, {
          fe_id: component.fe_id,
          title: component.title || '',
          isHidden: component.isHidden || false,
          disabled: component.disabled || false,
        });

        if (component.type === 'questionCheckbox' || component.type === 'questionRadio') {
          const optionsTmp = await this.createOptions(component);
          componentTmp.options = optionsTmp;
        }

        const componentRepository = this[`${component.type}Repository`];
        const compResult = await componentRepository.save(componentTmp);
        return compResult.fe_id;
      }),
    );
  }

  // 组件选项，只有 questionCheckbox/questionRadio 时才需要
  async createOptions(component) {
    return Promise.all(
      component.props.propsOptions.map(async (option) => {
        let optResult: QuestionCheckboxOption | QuestionRadioOption;
        let optionTmp;
        if (component.type === 'questionCheckbox') {
          optionTmp = new QuestionCheckboxOption();
          Object.assign(optionTmp, {
            value: option.value || '',
            text: option.text || '',
            checked: option.checked || false, // 直接在这里设置 checked 属性
          });
          optResult = await this.questionCheckboxOptionRepository.save(optionTmp);
        } else if (component.type === 'questionRadio') {
          optionTmp = new QuestionRadioOption();
          Object.assign(optionTmp, {
            value: option.value || '',
            text: option.text || '',
          });
          optResult = await this.questionRadioOptionRepository.save(optionTmp);
        }

        return optResult._id;
      }),
    );
  }

  async updateQuestion(question) {
    const result = await this.questionRepository.save(question);
    return this.generateReturnData(result);
  }

  generateReturnData(result) {
    let returnData;
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

  /**
   * 批量删除
   * @param ids - 问卷 id 数组
   */
  removeByIds(ids: number[]) {
    return this.questionRepository.delete(ids);
  }
}

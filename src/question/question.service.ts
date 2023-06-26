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
      // componentList 数据类似下面的格式
      // [
      //   {
      //     fe_id: 'Z3xIwW5MSSzUR3CJHfLJm',
      //     title: '标题',
      //     type: 'questionTitle',
      //     props: {
      //       text: '一行标题',
      //       level: 1,
      //       isCenter: false,
      //     },
      //     isHidden: false,
      //   },
      //   {
      //     fe_id: 'GiTImvo0uL75QrdspkWEv',
      //     title: '单选',
      //     type: 'questionRadio',
      //     props: {
      //       title: '单选标题',
      //       isVertical: false,
      //       options: [
      //         {
      //           value: 'item1',
      //           text: '选项 1',
      //         },
      //         {
      //           value: 'item2',
      //           text: '选项 2',
      //         },
      //         {
      //           value: 'item3',
      //           text: '选项 3',
      //         },
      //       ],
      //       value: '',
      //     },
      //   },
      // ];
      // componentList 转换成对象
      const componentListObj = JSON.parse(JSON.stringify(componentList));
      // 没有问卷，组件肯定不存在，先创建组件
      const questionComponentList = [];
      // 循环 componentListObj
      componentListObj.forEach(async (component) => {
        if (component.type === 'questionCheckbox') {
          const componentTmp = new QuestionCheckbox();
          componentTmp.fe_id = component.fe_id;
          componentTmp.title = component.title || '';
          componentTmp.isHidden = component.isHidden || false;
          componentTmp.disabled = component.disabled || false;
          const { props } = component;
          const { propsTitle, propsIsVertical, propsOptions } = props;
          componentTmp.props_title = propsTitle || '';
          componentTmp.props_isVertical = propsIsVertical || false;
          const optionsTmp = [];
          propsOptions.forEach(async (option) => {
            const optionTmp = new QuestionCheckboxOption();
            optionTmp.value = option.value || '';
            optionTmp.text = option.text || '';
            optionTmp.checked = option.checked || false;
            // 保存选项
            const optResult = await this.questionCheckboxOptionRepository.save(optionTmp);
            optionsTmp.push(optResult._id);
          });
          componentTmp.options = optionsTmp;
          // 保存组件
          const compResult = await this.questionCheckboxRepository.save(componentTmp);
          // 增加组件 fe_id
          questionComponentList.push(compResult.fe_id);
        } else if (component.type === 'questionInfo') {
          const componentTmp = new QuestionInfo();
          componentTmp.fe_id = component.fe_id;
          componentTmp.title = component.title || '';
          componentTmp.isHidden = component.isHidden || false;
          componentTmp.disabled = component.disabled || false;
          const { props } = component;
          const { propsTitle, propsDescription } = props;
          componentTmp.props_title = propsTitle || '';
          componentTmp.props_description = propsDescription || '';
          const compResult = await this.questionInfoRepository.save(componentTmp);
          questionComponentList.push(compResult.fe_id);
        } else if (component.type === 'questionInput') {
          const componentTmp = new QuestionInput();
          componentTmp.fe_id = component.fe_id;
          componentTmp.title = component.title || '';
          componentTmp.isHidden = component.isHidden || false;
          componentTmp.disabled = component.disabled || false;
          const { props } = component;
          const { propsTitle, propsPlaceholder } = props;
          componentTmp.props_title = propsTitle || '';
          componentTmp.props_placeholder = propsPlaceholder || '';
          const compResult = await this.questionInputRepository.save(componentTmp);
          questionComponentList.push(compResult.fe_id);
        } else if (component.type === 'questionParagraph') {
          const componentTmp = new QuestionParagraph();
          componentTmp.fe_id = component.fe_id;
          componentTmp.title = component.title || '';
          componentTmp.isHidden = component.isHidden || false;
          componentTmp.disabled = component.disabled || false;
          const { props } = component;
          const { propsText, propsIsCenter } = props;
          componentTmp.props_text = propsText || '';
          componentTmp.props_isCenter = propsIsCenter || false;
          const compResult = await this.questionParagraphRepository.save(componentTmp);
          questionComponentList.push(compResult.fe_id);
        } else if (component.type === 'questionRadio') {
          const componentTmp = new QuestionRadio();
          componentTmp.fe_id = component.fe_id;
          componentTmp.title = component.title || '';
          componentTmp.isHidden = component.isHidden || false;
          componentTmp.disabled = component.disabled || false;
          const { props } = component;
          const { propsTitle, propsIsVertical, propsValue, propsOptions } = props;
          componentTmp.props_title = propsTitle || '';
          componentTmp.props_isVertical = propsIsVertical || false;
          componentTmp.props_value = propsValue || '';
          const optionsTmp = [];
          propsOptions.forEach(async (option) => {
            const optionTmp = new QuestionRadioOption();
            optionTmp.value = option.value || '';
            optionTmp.text = option.text || '';
            // 保存选项
            const optResult = await this.questionRadioOptionRepository.save(optionTmp);
            optionsTmp.push(optResult._id);
          });
          const compResult = await this.questionRadioRepository.save(componentTmp);
          questionComponentList.push(compResult.fe_id);
        } else if (component.type === 'questionTextarea') {
          const componentTmp = new QuestionTextarea();
          componentTmp.fe_id = component.fe_id;
          componentTmp.title = component.title || '';
          componentTmp.isHidden = component.isHidden || false;
          componentTmp.disabled = component.disabled || false;
          const { props } = component;
          const { propsTitle, propsPlaceholder } = props;
          componentTmp.props_title = propsTitle || '';
          componentTmp.props_placeholder = propsPlaceholder || '';
          const compResult = await this.questionTextareaRepository.save(componentTmp);
          questionComponentList.push(compResult.fe_id);
        } else if (component.type === 'questionTitle') {
          const componentTmp = new QuestionTitle();
          componentTmp.fe_id = component.fe_id;
          componentTmp.title = component.title || '';
          componentTmp.isHidden = component.isHidden || false;
          componentTmp.disabled = component.disabled || false;
          const { props } = component;
          const { propsText, propsLevel, propsIsCenter } = props;
          componentTmp.props_text = propsText || '';
          componentTmp.props_level = propsLevel || 1;
          componentTmp.props_isCenter = propsIsCenter || false;
          const compResult = await this.questionTitleRepository.save(componentTmp);
          questionComponentList.push(compResult.fe_id);
        }
      });
      result = await this.questionRepository.save(questionTmp);
    } else {
      // 如果数据库中有该 id 时，更新数据
      question.title = title;
      question.description = description;
      question.css = css;
      question.js = js;
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

  /**
   * 批量删除
   * @param ids - 问卷 id 数组
   */
  removeByIds(ids: number[]) {
    return this.questionRepository.delete(ids);
  }
}

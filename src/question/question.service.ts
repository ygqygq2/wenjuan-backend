import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import Redis from 'ioredis';
import isEqual from 'lodash/isEqual';
import { Repository } from 'typeorm';

import { ComponentNumberToType, ComponentTypeNumber, ComponentTypeToNumber } from '@/enum/componentType.enum';
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
    // @ts-ignore
    @InjectRepository(QuestionCheckbox) private readonly questionCheckboxRepository: Repository<QuestionCheckbox>,
    @InjectRepository(QuestionCheckboxOption)
    private readonly questionCheckboxOptionRepository: Repository<QuestionCheckboxOption>,
    // @ts-ignore
    @InjectRepository(QuestionInfo) private readonly questionInfoRepository: Repository<QuestionInfo>,
    // @ts-ignore
    @InjectRepository(QuestionInput) private readonly questionInputRepository: Repository<QuestionInput>,
    // @ts-ignore
    @InjectRepository(QuestionParagraph) private readonly questionParagraphRepository: Repository<QuestionParagraph>,
    // @ts-ignore
    @InjectRepository(QuestionRadio) private readonly questionRadioRepository: Repository<QuestionRadio>,
    @InjectRepository(QuestionRadioOption)
    private readonly questionRadioOptionRepository: Repository<QuestionRadioOption>,
    // @ts-ignore
    @InjectRepository(QuestionTextarea) private readonly questionTextareaRepository: Repository<QuestionTextarea>,
    // @ts-ignore
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
    const question = await this.questionRepository.findOne({
      where: {
        _id: id,
      },
    });

    if (!question) {
      return null;
    }
    return question;
  }

  /**
   * 获取组件列表
   * @param question - 问卷实体
   */
  getComponentList(question: Question): { key: string; value: number }[] {
    const dbComponentList = JSON.parse(`[${question.componentList.join(',')}]`).flat() || [];
    return dbComponentList;
  }

  async findOneWithComponents(id: number) {
    const question = await this.findOne(+id);
    if (!question) {
      return null;
    }
    const dbComponentList = this.getComponentList(question);
    const componentList = await Promise.all(
      dbComponentList.map(async (item: { key: string; value: number }) => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const [id, type] = Object.entries(item)[0];
        const componentRepository = this[`${ComponentNumberToType[type]}Repository`];
        const compResult = await componentRepository.findOne({
          where: {
            fe_id: id,
          },
        });
        // 数据里面的 props_aa: bb 转成 {props: {aa: bb}}
        const props = {};
        Object.keys(compResult).forEach((key) => {
          if (key.startsWith('props_')) {
            const propKey = key.replace('props_', '');
            props[propKey] = compResult[key];
            delete compResult[key]; // 删除原来的 props_xxx 属性
          }
        });
        const rest = { ...compResult, props, type: `${ComponentNumberToType[type]}` };
        return rest;
      }),
    );
    const flatComponentList = componentList.flat(); // 平铺嵌套数组
    const questionData = { ...question };
    questionData.componentList = flatComponentList || [];
    return questionData;
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
    const {
      title,
      description = '',
      css = '',
      js = '',
      componentList,
      isStar = 'false',
      isPublished = 'false',
      isDeleted = 'false',
    } = updateQuestionDto;

    // 如果 componentList 为 undefined，则将其置为 undefined
    const componentListObj = componentList === undefined ? undefined : [...componentList];

    // 如果数据库中没有该 id 时，则创建数据
    if (!question) {
      return this.createQuestion(id, title, description, css, js, componentList);
    }
    // 如果数据库中有该 id 时，则更新数据
    Object.assign(question, { title, description, css, js, isStar, isPublished, isDeleted });
    return this.updateQuestion(question, componentListObj);
  }

  // 创建问卷
  async createQuestion(id: number, title: string, description: string, css: string, js: string, componentList: any[]) {
    const questionTmp = new Question();
    Object.assign(questionTmp, { _id: id, title, description, css, js });

    // componentList 转换成对象
    const questionComponentList = await this.createComponentList(componentList);

    questionTmp.componentList = questionComponentList;
    const result = await this.questionRepository.save(questionTmp);

    return this.generateReturnData(result);
  }

  // 创建问卷组件
  async createComponentList(componentList: any[]) {
    return Promise.all(
      componentList.map(async (component) => {
        const ComponentClass = this.componentTypeToClass[component.type];
        const componentTmp = new ComponentClass();
        const { props } = component;
        // props 转换成对象，用于保存到数据库，要加 props_
        Object.entries(props).forEach(([name, value]) => {
          return Object.assign(componentTmp, {
            [`props_${props.name}`]: value,
          });
        });
        Object.assign(componentTmp, {
          fe_id: component.fe_id,
          title: component.title,
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

  /**
   * 更新问卷组件
   * @param question - 查询出来的问卷实体
   * @param oldComponentList - 数据库中存的旧组件列表
   * @param componentList - 前端传过来的组件列表
   * @returns
   */
  async updateComponentList(question: Question, oldComponentList: any[], componentList: any[]) {
    // 创建一个新的组件 ID 列表
    const newComponentIds: Array<{ [fe_id: string]: number }> = componentList.map((component) => ({
      [`${component.fe_id}`]: ComponentTypeToNumber[component.type],
    }));

    // 已经存在的 ID 列表，newComponentIds 存在于 oldComponentList 中的元素
    const existComponentIds: Array<{ [fe_id: string]: number }> = newComponentIds.filter((item) => {
      return Object.keys(item).some((key: string) => {
        return oldComponentList.some((oldItem: { [fe_id: string]: number }) => oldItem[key] === item[key]);
      });
    });

    // 要删除的旧组件
    const deleteComponentIds: Array<{ [fe_id: string]: number }> = newComponentIds.filter((item) => {
      return !Object.keys(item).some((key: string) => {
        return oldComponentList.some((oldItem: { [fe_id: string]: number }) => oldItem[key] === item[key]);
      });
    });

    // 删除旧组件
    await this.removeWithComponents(deleteComponentIds);

    // 获取已更新的组件实体列表
    const updatedComponentListObj: Array<
      | QuestionCheckbox
      | QuestionInfo
      | QuestionInput
      | QuestionParagraph
      | QuestionRadio
      | QuestionTextarea
      | QuestionTitle
    > = await componentList.reduce(async (accPromise, component) => {
      const acc = await accPromise;
      const ComponentClass:
        | typeof QuestionCheckbox
        | typeof QuestionInfo
        | typeof QuestionInput
        | typeof QuestionParagraph
        | typeof QuestionRadio
        | typeof QuestionTextarea
        | typeof QuestionTitle = this.componentTypeToClass[component.type];
      const componentTmp = new (ComponentClass as new () =>
        | QuestionCheckbox
        | QuestionInfo
        | QuestionInput
        | QuestionParagraph
        | QuestionRadio
        | QuestionTextarea
        | QuestionTitle)();
      // 提取出前端传过来的组件 props 对象
      // 将 {props: {aa: bb}} 转换成 {props_aa: bb}
      const { props } = component;
      Object.keys(props).forEach((propName) => {
        const prefixedPropName = `props_${propName}`;
        componentTmp[prefixedPropName] = props[propName];
      });
      Object.assign(componentTmp, {
        title: component.title,
        fe_id: component.fe_id,
        typeText: component.type,
        isHidden: component.isHidden || false,
        disabled: component.disabled || false,
        question,
      });

      // 有 options 的特殊组件
      if (componentTmp instanceof QuestionCheckbox || componentTmp instanceof QuestionRadio) {
        if (existComponentIds.includes(component.fe_id)) {
          const optionsTmp = await this.updateOptions(component);
          componentTmp.options = optionsTmp;
        } else {
          const optionsTmp = await this.createOptions(component);
          componentTmp.options = optionsTmp;
        }
      }

      // 组件 repository
      const componentRepository = this[`${ComponentNumberToType[componentTmp.type]}Repository`] as Repository<
        QuestionCheckbox &
          QuestionInfo &
          QuestionInput &
          QuestionParagraph &
          QuestionRadio &
          QuestionTextarea &
          QuestionTitle
      >;
      // 保存组件到数据库
      await componentRepository.save(componentTmp);
      acc.push(componentTmp);
      return acc;
    }, []);

    const updatedComponentList: Array<{ [fe_id: string]: ComponentTypeNumber }> = updatedComponentListObj.map(
      (item) => ({
        [item.fe_id]: item.type,
      }),
    );
    // mysql 不支持动态实体关系
    // const updatedComponentList = updatedComponentListObj;
    return updatedComponentList;
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

  // 更新选项数据
  async updateOptions(component) {
    // 判断选项数据是否已经存在，存在则更新，不存在则删除
    // 获取旧的选项数据
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

  // 将前端 componentList 转换成数据库中的组件列表
  async convertComponentList(componentList: any[]): Promise<{ [fe_id: string]: number }[]> {
    return componentList.map((component) => ({
      [component.fe_id]: ComponentTypeToNumber[component.type],
    }));
  }

  /**
   * 更新问卷
   * @param question - 问卷实体
   * @param componentList - 前端传过来的组件列表
   * @returns
   */
  async updateQuestion(question: Question, componentList?: any) {
    if (componentList !== undefined) {
      const oldComponentList = question.componentList || [];
      const frontendComponentList = await this.convertComponentList(componentList);
      const frontendComponentListStr = frontendComponentList.map((component) => JSON.stringify(component));

      if (!isEqual(oldComponentList.sort(), frontendComponentListStr.sort())) {
        const questionComponentList = await this.updateComponentList(question, oldComponentList, componentList);
        question.componentList = questionComponentList.map((component) => JSON.stringify(component));
      }
    }

    const result = await this.questionRepository.save(question);
    return this.generateReturnData(result);
  }

  // 生成返回数据
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
  async removeByIds(ids: number[]) {
    type RemoveFailedId = {
      id: number;
      title: string;
    };

    const removeFailedIds: RemoveFailedId[] = [];

    for (const id of ids) {
      const question = await this.findOne(+id);
      console.log('🚀 ~ file: question.service.ts:503 ~ QuestionService ~ removeByIds ~ question:', question);
      if (question) {
        const dbComponentList = this.getComponentList(question);
        console.log(
          '🚀 ~ file: question.service.ts:498 ~ QuestionService ~ removeByIds ~ dbComponentList:',
          dbComponentList,
        );
        const removeComponentResult = await this.removeWithComponents(dbComponentList);
        if (!removeComponentResult) {
          removeFailedIds.push({
            id,
            title: question.title,
          });
          // 跳出此次循环
          break;
        }

        const removeQuestionResult = await this.questionRepository.remove(question);
        if (!removeQuestionResult) {
          removeFailedIds.push({
            id,
            title: question.title,
          });
        }
      }
    }
    return removeFailedIds;
  }

  /**
   * 删除组件
   * @param id - 组件 id
   */
  async removeWithComponents(deleteComponentIds) {
    // 删除旧组件
    const promises = deleteComponentIds.map(async (deleteId) => {
      const [id, type] = Object.entries(deleteId)[0] as any as [string, number];
      const componentRepository = this[`${ComponentNumberToType[type]}Repository`];
      const componentToRemove = await componentRepository.findOne({
        where: {
          fe_id: id,
        },
      });
      if (componentToRemove) {
        await componentRepository.remove(componentToRemove);
      }
    });
    return Promise.all(promises);
  }
}

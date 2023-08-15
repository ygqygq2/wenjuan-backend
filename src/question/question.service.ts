import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { cloneDeep } from 'lodash';
import isEqual from 'lodash/isEqual';
import { nanoid } from 'nanoid';

import { Repository } from 'typeorm';

import {
  ComponentNumberToType,
  ComponentTypeNumber,
  ComponentTypeToNumber,
  componentOptionType,
} from '@/enum/componentType.enum';
import { ErrMsg, Errno } from '@/enum/errno.enum';

import { RolesService } from '@/roles/roles.service';
import { UserService } from '@/user/user.service';

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
import {
  ArrayOfType,
  Component,
  ComponentDB,
  ComponentHaveOptionType,
  ComponentOptionType,
  ComponentType,
  QuestionComponentClass,
  SearchOptions,
} from './types';

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
    private readonly userService: UserService,
    private readonly rolesService: RolesService,
  ) {
    this.redis = this.redisService.getClient();
  }

  // 查询问卷列表，根据接收到的参数查询，SearchOptions
  async findAllForCreator(searchOptions: SearchOptions, userId: number, isAdmin: boolean) {
    const { keyword, isStar, isDeleted, page = 1, pageSize = 10 } = searchOptions;

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

    // 设置 take 和 skip
    const startIndex = (page - 1) * pageSize;
    queryBuilder.take(pageSize).skip(startIndex);

    // 用户查询自己的问卷的逻辑
    if (!isAdmin) {
      queryBuilder.andWhere('question.creator= :userId', { userId });
    }

    // isDeleted, 没有传值时，默认为 false
    const isDeletedValue = isDeleted === 'true' || false;
    queryBuilder.andWhere('question.isDeleted = :isDeleted', { isDeleted: isDeletedValue });

    // keyword
    if (keyword) {
      queryBuilder.andWhere('question.title like :keyword', { keyword: `%${keyword}%` });
    }

    // isStar
    if (isStar !== undefined) {
      const isStarValue = isStar === 'true' || false;
      queryBuilder.andWhere('question.isStar = :isStar', { isStar: isStarValue });
    }

    // 根据需要添加其他查询条件
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
    const question = await this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.user', 'user')
      .leftJoinAndSelect('question.roles', 'roles')
      .select(['question', 'user.id', 'user.username', 'roles.id', 'roles.name'])
      .where('question._id = :id', { id })
      .getOne();

    if (!question) {
      return null;
    }
    return question;
  }

  /**
   * 获取组件列表
   * @param question - 问卷实体
   */
  getComponentList(question: Question): ComponentDB[] {
    const dbComponentList = JSON.parse(`[${question.componentList.join(',')}]`).flat() || [];
    return dbComponentList;
  }

  async findOneWithComponents(id: number) {
    const question = await this.findOne(+id);
    console.log('🚀 ~ file: question.service.ts:179 ~ QuestionService ~ findOneWithComponents ~ question:', question);
    if (!question) {
      return null;
    }
    const questionData = await this.convertQuestionToFront(question);
    return questionData;
  }

  /**
   * 转换问卷数据到前端
   * @param question
   * @returns
   */
  async convertQuestionToFront(question: Question) {
    const dbComponentList = this.getComponentList(question);
    const componentList = await Promise.all(
      dbComponentList.map(async (item: ComponentDB) => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const [id, type] = Object.entries(item)[0];
        const componentRepository = this[`${ComponentNumberToType[type]}Repository`] as Repository<ComponentType>;
        const compResult: ComponentType = await componentRepository.findOne({
          where: {
            fe_id: id,
          },
        });
        // 数据里面的 props_aa: bb 转成 {props: {aa: bb}}
        const props: any = {};
        Object.keys(compResult).forEach((key) => {
          if (key.startsWith('props_')) {
            const propKey = key.replace('props_', '');
            props[propKey] = compResult[key];
            delete compResult[key]; // 删除原来的 props_xxx 属性
          }
        });

        // 有 options 的特殊组件
        if (
          (compResult instanceof QuestionCheckbox || compResult instanceof QuestionRadio) &&
          compResult.options &&
          compResult.options.length > 0
        ) {
          props.options = compResult.options;
          compResult.options = undefined; // 删除原来的 options 属性
        }

        const rest = { ...compResult, props, type: `${ComponentNumberToType[type]}` };
        return rest;
      }),
    );

    const modifiedComponentList = componentList.map((item) => {
      const { props, ...rest } = item;
      if ('options' in props) {
        // 需要格式化 options 的组件
        return {
          ...rest,
          props: {
            ...props,
            options: props.options || [],
          },
        };
      }
      return {
        ...rest,
        props: {
          ...props,
        },
      };
    });

    const questionData: any = { ...question };
    questionData.componentList = modifiedComponentList || [];
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
  async saveQuestion(id: number, updateQuestionDto: UpdateQuestionDto, userId: number) {
    const question = await this.findOne(+id);

    const { title, description, css, js, componentList, isStar, isPublished, isDeleted, roles } = updateQuestionDto;

    // 如果数据库中没有该 id 时，则创建数据
    if (!question) {
      return this.createQuestion(title, description, css, js, componentList, userId);
    }

    // 判断是否已发布问卷，已发布且回答大于 0 ，则禁止修改
    const answerCount = question.answerCount || 0;
    if (question.isPublished && answerCount > 0) {
      return this.generateReturnData({
        errno: Errno.ERRNO_26,
        msg: ErrMsg[Errno.ERRNO_26],
      });
    }

    // 先判断是否有 user 字段，因为旧数据可能没有 user 字段
    if (!question.user) {
      const user = await this.userService.findOne(userId);
      if (!user) {
        return this.generateReturnData({
          errno: Errno.ERRNO_23,
          msg: ErrMsg[Errno.ERRNO_23],
        });
      }
      question.user = user;
    } else if (question.user.id !== userId) {
      // 禁止修改别人的问卷
      return this.generateReturnData({
        errno: Errno.ERRNO_25,
        msg: ErrMsg[Errno.ERRNO_25],
      });
    }

    // 只有传了值才更新
    if (title !== undefined) {
      question.title = title;
    }
    if (description !== undefined) {
      question.description = description;
    }
    if (css !== undefined) {
      question.css = css;
    }
    if (js !== undefined) {
      question.js = js;
    }
    if (isStar !== undefined) {
      question.isStar = isStar;
    }
    if (isPublished !== undefined) {
      question.isPublished = isPublished;
      question.publishedAt = isPublished ? new Date() : null;
    }
    if (isDeleted !== undefined) {
      question.isDeleted = isDeleted;
    }
    if (roles !== undefined) {
      const roleList = await this.rolesService.findByIds(roles);
      question.roles = roleList;
    }

    // 如果 componentList 为 undefined，则将其置为 undefined
    const componentListObj = componentList === undefined ? undefined : [...componentList];

    return this.updateQuestion(question, componentListObj);
  }

  // 创建问卷
  async createQuestion(
    title: string,
    description: string,
    css: string,
    js: string,
    componentList: Component[],
    userId: number,
  ) {
    const questionTmp = new Question();
    Object.assign(questionTmp, { title, description, css, js, creator: userId });

    // componentList 转换成对象
    const questionComponentList = await this.createComponentList(questionTmp, componentList);

    questionTmp.componentList = questionComponentList;
    const result = await this.questionRepository.save(questionTmp);

    if (result['_id']) {
      return this.generateReturnData({
        errno: Errno.SUCCESS,
        data: result,
      });
    }
    return this.generateReturnData({
      errno: Errno.ERRNO_10,
      msg: ErrMsg[Errno.ERRNO_10],
    });
  }

  // 创建问卷组件
  async createComponentList(question: Question, componentList: Component[]) {
    return Promise.all(
      componentList.map(async (component) => {
        const ComponentClass: QuestionComponentClass = this.componentTypeToClass[component.type];
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
          question,
        });

        const componentRepository = this[`${component.type}Repository`] as Repository<ComponentType>;
        const compResult = await componentRepository.save(componentTmp);

        if (componentTmp instanceof QuestionCheckbox || componentTmp instanceof QuestionRadio) {
          await this.createOptions(componentTmp, component);
        }

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
  async updateComponentList(question: Question, oldComponentList: ComponentDB[], componentList: any[]) {
    // 创建一个新的组件 ID 列表
    const newComponentIds: Array<ComponentDB> = componentList.map((component) => ({
      [`${component.fe_id}`]: ComponentTypeToNumber[component.type],
    }));

    // 已经存在的 ID 列表，newComponentIds 存在于 oldComponentList 中的元素
    const existComponentIds: Array<ComponentDB> = newComponentIds.filter((item) => {
      return Object.keys(item).some((key: string) => {
        return oldComponentList.some((oldItem: ComponentDB) => oldItem[key] === item[key]);
      });
    });

    // 要删除的旧组件
    const deleteComponentIds: Array<ComponentDB> = oldComponentList.filter((item) => {
      return !Object.keys(item).some((key: string) => {
        return newComponentIds.some((newItem: ComponentDB) => newItem[key] === item[key]);
      });
    });

    // 删除旧组件
    await this.removeWithComponents(deleteComponentIds);

    // 获取已更新的组件实体列表
    const updatedComponentListObj: Array<ComponentType> = await componentList.reduce(async (accPromise, component) => {
      const acc = await accPromise;
      const ComponentClass: QuestionComponentClass = this.componentTypeToClass[component.type];
      const componentTmp = new ComponentClass();
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

      // 组件 repository
      const componentRepository = this[
        `${ComponentNumberToType[componentTmp.type]}Repository`
      ] as Repository<ComponentType>;
      // 保存组件到数据库
      await componentRepository.save(componentTmp);

      // 有 options 的特殊组件
      if (componentTmp instanceof QuestionCheckbox || componentTmp instanceof QuestionRadio) {
        if (existComponentIds.some((item) => Object.prototype.hasOwnProperty.call(item, component.fe_id))) {
          console.log('update options');
          const options = await this.updateOptions(componentTmp, component);
          componentTmp.options = options as QuestionCheckboxOption[] | QuestionRadioOption[];
        } else {
          console.log('create options');
          const options = await this.createOptions(componentTmp, component);
          componentTmp.options = options as QuestionCheckboxOption[] | QuestionRadioOption[];
        }
      }

      acc.push(componentTmp);
      return acc;
    }, []);

    const updatedComponentList: Array<ComponentDB> = updatedComponentListObj.map((item) => ({
      [item.fe_id]: item.type,
    }));
    // mysql 不支持动态实体关系
    // const updatedComponentList = updatedComponentListObj;
    return updatedComponentList;
  }

  /**
   * 组件选项，只有 questionCheckbox/questionRadio 时才需要
   * @param component - 前端传过来的组件
   */
  async createOptions<T extends ComponentOptionType>(
    componentTmp: ComponentHaveOptionType,
    component: Component,
  ): Promise<ArrayOfType<ComponentOptionType>> {
    const optionMap: Record<string, { optionFactory: () => T; checked?: boolean }> = {
      questionCheckbox: {
        optionFactory: () => new QuestionCheckboxOption() as T,
        checked: true,
      },
      questionRadio: {
        optionFactory: () => new QuestionRadioOption() as T,
      },
      // 添加其他类型的映射
    };

    const options: ArrayOfType<ComponentOptionType> = [];
    // 为了保持原来的选项顺序，使用 for 循环
    for (let i = 0; i < component.props.options.length; i++) {
      const option = component.props.options[i];
      const optionType = optionMap[component.type];
      // 在每次循环中都通过工厂函数创建一个新的对象
      const optionTmp = optionType.optionFactory();
      Object.assign(optionTmp, {
        ...option,
        ...(optionType.checked && { checked: option.checked || false }),
        component: componentTmp,
      });
      const optResult = await this.saveOption(optionTmp);
      options.push(optResult);
    }

    return options;
  }

  // 更新选项数据
  async updateOptions<T extends ComponentOptionType>(
    componentTmp: ComponentHaveOptionType,
    component: Component,
  ): Promise<ArrayOfType<ComponentOptionType>> {
    // 判断选项数据是否已经存在，存在则更新，不存在则删除
    // 获取旧的选项数据
    const oldOptions: ArrayOfType<ComponentOptionType> = await this.getOptions(componentTmp);

    // 获取新的选项数据
    const optionMap: Record<string, { optionFactory: () => T; checked?: boolean }> = {
      questionCheckbox: {
        optionFactory: () => new QuestionCheckboxOption() as T,
        checked: true,
      },
      questionRadio: {
        optionFactory: () => new QuestionRadioOption() as T,
      },
      // 添加其他类型的映射
    };

    // 前端传过来的 options，包含 _id
    // typeorm 中 new 实体，然后把主键合并到实体中，则会变成更新
    const optionPromises = component.props.options.map(async (option: any) => {
      const optionType = optionMap[component.type];
      // 在每次循环中都通过工厂函数创建一个新的对象
      const optionTmp = optionType.optionFactory();
      Object.assign(optionTmp, {
        ...option,
        ...(optionType.checked && { checked: option.checked || false }),
        component: componentTmp,
      });
      const optResult = await this.saveOption(optionTmp);
      return optResult as T;
    });

    const options = await Promise.all(optionPromises);

    // 删除不再需要的旧数据
    const deleteOptionIds = oldOptions
      .filter((oldOption) => !options.find((opt) => opt._id === oldOption._id))
      .map((oldOption) => oldOption._id);

    await Promise.all(
      deleteOptionIds.map(async (deleteOptionId) => {
        switch (componentTmp.constructor) {
          case QuestionCheckbox:
            await this.questionCheckboxOptionRepository.delete(deleteOptionId);
            break;
          case QuestionRadio:
            await this.questionRadioOptionRepository.delete(deleteOptionId);
            break;
          default:
            break;
        }
      }),
    );

    return options;
  }

  /**
   *
   * @param componentTmp - 组件实体
   * @returns
   */
  async getOptions(componentTmp: ComponentHaveOptionType): Promise<ArrayOfType<ComponentOptionType>> {
    if (componentTmp instanceof QuestionCheckbox) {
      return this.questionCheckboxOptionRepository.find({
        where: {
          component: {
            fe_id: componentTmp.fe_id,
          },
        },
      });
    }
    if (componentTmp instanceof QuestionRadio) {
      return this.questionRadioOptionRepository.find({
        where: {
          component: {
            fe_id: componentTmp.fe_id,
          },
        },
      });
    }
    return [];
  }

  /**
   * 保存选项
   * @param option - 选项实体
   */
  async saveOption<T extends ComponentOptionType>(
    option: T,
  ): Promise<(T & QuestionCheckboxOption) | (T & QuestionRadioOption)> {
    try {
      if (option instanceof QuestionCheckboxOption) {
        return await this.questionCheckboxOptionRepository.save(option);
      }
      if (option instanceof QuestionRadioOption) {
        return await this.questionRadioOptionRepository.save(option);
      }
      throw new Error('未知选项类型');
    } catch (error) {
      console.error('保存选项出错', error);
      throw new Error('保存选项出错');
    }
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
      const oldComponentList: ComponentDB[] = question.componentList.reduce((acc, component) => {
        const componentObj = JSON.parse(component);
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const fe_id = Object.keys(componentObj)[0];
        const type = componentObj[fe_id];
        acc.push({ [fe_id]: type });
        return acc;
      }, []);
      const frontendComponentList = await this.convertComponentList(componentList);
      const frontendComponentListStr = frontendComponentList.map((component: ComponentDB) => JSON.stringify(component));

      if (!isEqual(oldComponentList.sort(), frontendComponentListStr.sort())) {
        const questionComponentList: ComponentDB[] = await this.updateComponentList(
          question,
          oldComponentList,
          componentList,
        );
        question.componentList = questionComponentList.map((component: ComponentDB) => JSON.stringify(component));
      }
    }

    const result: Question = await this.questionRepository.save(question);
    if (result['_id']) {
      return this.generateReturnData({
        errno: Errno.SUCCESS,
        data: result,
      });
    }
    return this.generateReturnData({
      errno: Errno.ERRNO_10,
      msg: ErrMsg[Errno.ERRNO_10],
    });
  }

  // 生成返回数据
  generateReturnData(returnData: ReturnData) {
    return returnData;
  }

  // 复制问卷
  async copy(id: number) {
    const question = await this.findOne(id);
    if (!question) {
      return '';
    }
    const newId = await this.getNewestId();

    const copiedQuestion: Question = { ...question };
    copiedQuestion._id = newId;
    // 先保存 question
    const newQuestion = await this.questionRepository.save(copiedQuestion);

    const dbComponentList = this.getComponentList(question);
    const copiedComponentList = await Promise.all(
      dbComponentList.map(async (item: ComponentDB) => {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const [id, type] = Object.entries(item)[0];
        const componentRepository = this[`${ComponentNumberToType[type]}Repository`] as Repository<ComponentType>;
        const compResult: ComponentType = await componentRepository.findOne({
          where: {
            fe_id: id,
          },
          relations: ['question'],
        });
        // 复制组件，深拷贝
        const copiedComponent = cloneDeep(compResult);
        const newFeId = nanoid(); // 使用 nanoid() 生成新的 fe_id 值
        copiedComponent.fe_id = newFeId;
        copiedComponent.question = newQuestion;
        if (copiedComponent instanceof QuestionCheckbox || copiedComponent instanceof QuestionRadio) {
          copiedComponent.options = []; // 断开与旧选项关联
        }
        // 保存组件
        const newComponent = await componentRepository.save(copiedComponent);
        if (compResult instanceof QuestionCheckbox || compResult instanceof QuestionRadio) {
          const newOptions: ComponentOptionType[] = await this.copyOptions(
            compResult,
            newComponent as ComponentHaveOptionType,
          );
          (copiedComponent as { options: ComponentOptionType[] }).options = newOptions || [];
        }

        return { [newFeId]: type };
      }),
    );
    copiedQuestion.componentList = copiedComponentList.map((component: ComponentDB) => JSON.stringify(component));
    const result = await this.questionRepository.save(copiedQuestion);
    return result;
    // return await this.convertQuestionToFront(result);
  }

  // 更新选项数据
  async copyOptions(
    componentTmp: ComponentHaveOptionType,
    newComponent: ComponentHaveOptionType,
  ): Promise<ComponentOptionType[]> {
    // 判断选项数据是否已经存在，存在则复制
    // 获取旧的选项数据
    const oldOptions: ComponentOptionType[] = componentTmp.options || [];

    // 复制选项数据并保存到数据库中
    const newOptions: ComponentOptionType[] = [];
    for (const oldOption of oldOptions) {
      // 深拷贝
      const copiedOption = cloneDeep(oldOption);
      // 删除主键
      delete copiedOption._id;
      // 更新 component 关联
      copiedOption.component = newComponent;
      const savedOption = await this.saveOption(copiedOption); // 保存新选项数据到数据库
      newOptions.push(savedOption); // 获取新的主键并添加到列表中
    }

    return newOptions;
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
      if (question) {
        const dbComponentList = this.getComponentList(question);
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
  async removeWithComponents(
    deleteComponentIds: {
      [fe_id: string]: ComponentTypeNumber;
    }[],
  ) {
    try {
      // 删除旧组件
      const promises = deleteComponentIds.map(async (deleteId: ComponentDB) => {
        const [id, type] = Object.entries(deleteId)[0];
        const componentRepository = this[`${ComponentNumberToType[type]}Repository`] as Repository<ComponentType>;
        const componentToRemove = await componentRepository.findOne({
          where: {
            fe_id: id,
          },
        });
        if (componentToRemove) {
          const hasOptions = componentOptionType.includes(componentToRemove.type);
          if (hasOptions) {
            await this.removeOptions(componentToRemove as ComponentHaveOptionType);
          }
          await componentRepository.remove(componentToRemove);
        }
      });
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.log('删除组件失败', error);
      return false;
    }
  }

  /**
   * 删除组件
   * @param deleteComponent - 要删除的组件实体
   */
  async removeOptions(deleteComponent: ComponentHaveOptionType) {
    try {
      // 删除旧组件
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { fe_id, type } = deleteComponent;
      const optionRepository = this[
        `${ComponentNumberToType[type]}OptionRepository`
      ] as Repository<ComponentOptionType>;
      const queryBuilder = optionRepository.createQueryBuilder('option');
      const optionToRemove = await queryBuilder.where('option.component_fe_id = :fe_id', { fe_id }).getMany();
      if (optionToRemove.length > 0) {
        await optionRepository.remove(optionToRemove);
      }
      return true;
    } catch (error) {
      console.log('删除组件失败', error);
      return false;
    }
  }
}

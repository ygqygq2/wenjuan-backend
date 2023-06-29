import { Expose } from 'class-transformer';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { ComponentTypeNumber } from '@/enum/componentType.enum';

import { Question } from './question.entity';

// 定义一个 Mixin 类，包含一对多关系定义
export class ManyToOneMixin {
  @Expose()
  @ManyToOne(() => Question, (question) => question.componentList)
  @JoinColumn()
  question: Question;
}

// 使用 @Mixin 装饰器应用 mixin
export function Mixin(baseClass: any): (derivedClass: any) => any {
  return (derivedClass: any) => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach((name) => {
      if (name !== 'constructor') {
        Object.defineProperty(derivedClass.prototype, name, Object.getOwnPropertyDescriptor(baseClass.prototype, name));
      }
    });
    return derivedClass;
  };
}

@Entity()
export abstract class Component extends BaseEntity {
  @PrimaryColumn()
  @Expose()
  fe_id: string;

  // type
  @Expose()
  @Column({
    type: 'enum',
    enum: ComponentTypeNumber,
    default: ComponentTypeNumber.QUESTION_CHECKBOX,
  })
  type: ComponentTypeNumber;

  // 组件名称
  @Expose()
  @Column({ default: '' })
  title: string;

  // 是否隐藏
  @Expose()
  @Column({ default: false })
  isHidden: boolean;

  @Expose()
  @Column({ default: false })
  disabled: boolean;

  @Expose()
  @ManyToOne(() => Question, (question) => question.componentList)
  @JoinColumn()
  question: Question;
}

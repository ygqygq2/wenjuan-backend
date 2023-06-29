import { Expose } from 'class-transformer';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import { ComponentTypeNumber } from '@/enum/componentType.enum';

import { Question } from './question.entity';

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

  @ManyToOne(() => Question, (question) => question.componentList, {
    onDelete: 'CASCADE',
  })
  question: Question;
}

import { Expose } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';

import { ComponentTypeNumber } from '@/enum/componentType.enum';

import { Component } from './questionComponent.entity';
import { QuestionRadioOption } from './questionRadioOption.entity';

@Entity({ name: 'question_radio' })
export class QuestionRadio extends Component {
  type: ComponentTypeNumber = ComponentTypeNumber.QUESTION_RADIO;

  // 是否竖向
  @Expose()
  @Column({ default: false })
  props_isVertical: boolean;

  // 值
  @Expose()
  @Column({ default: '' })
  props_value: string;

  @Expose()
  @Column({ default: '' })
  props_title: string;

  // 单选框
  @OneToMany(() => QuestionRadioOption, (questionRadioOption) => questionRadioOption.component, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  options: QuestionRadioOption[];

  getOptions(): QuestionRadioOption[] {
    return this.options;
  }
}

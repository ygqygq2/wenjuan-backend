import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

import { ComponentTypeNumber } from '@/enum/componentType.enum';

import { QuestionCheckboxOption } from './questionCheckboxOption.entity';
import { Component } from './questionComponent.entity';

@Entity({ name: 'question_checkbox' })
export class QuestionCheckbox extends Component {
  type: ComponentTypeNumber = ComponentTypeNumber.QUESTION_CHECKBOX;

  // 组件显示标题
  @Column({ default: '' })
  props_title: string;

  // 是否竖向
  @Column({ default: false })
  props_isVertical: boolean;

  // 多选框列表
  @OneToMany(() => QuestionCheckboxOption, (questionCheckboxOption) => questionCheckboxOption.fe_id, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  options: QuestionCheckboxOption[];
}

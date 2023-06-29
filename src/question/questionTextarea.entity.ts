import { Expose } from 'class-transformer';
import { Column, Entity } from 'typeorm';

import { ComponentTypeNumber } from '@/enum/componentType.enum';

import { Component } from './questionComponent.entity';

@Entity({ name: 'question_textarea' })
export class QuestionTextarea extends Component {
  type: ComponentTypeNumber = ComponentTypeNumber.QUESTION_TEXTAREA;

  // 组件显示标题
  @Expose()
  @Column({ default: '' })
  props_title: string;

  // 组件输入提示
  @Expose()
  @Column({ default: '' })
  props_placeholder: string;
}
